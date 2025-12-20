package com.example.restaurantpos.restaurantpo.smartorder.presentation.screens.order

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.restaurantpos.restaurantpo.smartorder.domain.model.CartItem
import com.example.restaurantpos.restaurantpo.smartorder.domain.model.Product
import com.example.restaurantpos.restaurantpo.smartorder.domain.usecase.GetProductsUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed class OrderUiEvent {
    data class ShowSnackbar(val message: String) : OrderUiEvent()
    object NavigateBack : OrderUiEvent()
}

data class OrderUiState(
    val products: List<Product> = emptyList(),
    val categories: List<String> = emptyList(),
    val selectedCategory: String = "Tất cả",
    val searchQuery: String = "",
    val cartItems: List<CartItem> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
    val successMessage: String? = null
) {
    val totalAmount: Double
        get() = cartItems.sumOf { it.total }
        
    val totalItems: Int
        get() = cartItems.sumOf { it.quantity }
        
    val filteredProducts: List<Product>
        get() {
            var filtered = if (selectedCategory == "Tất cả") {
                products
            } else {
                products.filter { it.categoryName == selectedCategory }
            }
            
            // Apply search filter
            if (searchQuery.isNotEmpty()) {
                filtered = filtered.filter { 
                    it.name.contains(searchQuery, ignoreCase = true)
                }
            }
            
            return filtered
        }
}

@HiltViewModel
class OrderViewModel @Inject constructor(
    private val getProductsUseCase: GetProductsUseCase,
    private val createOrderUseCase: com.example.restaurantpos.restaurantpo.smartorder.domain.usecase.CreateOrderUseCase,
    private val signalRService: com.example.restaurantpos.restaurantpo.smartorder.data.remote.SignalRService,
    savedStateHandle: SavedStateHandle
) : ViewModel() {

    private val tableId: Int = checkNotNull(savedStateHandle["tableId"])
    
    private val _uiState = MutableStateFlow(OrderUiState())
    val uiState: StateFlow<OrderUiState> = _uiState.asStateFlow()
    
    private val _uiEvent = kotlinx.coroutines.channels.Channel<OrderUiEvent>()
    val uiEvent = _uiEvent.receiveAsFlow()

    init {
        loadProducts()
        subscribeToRealtimeUpdates()
    }
    
    private fun subscribeToRealtimeUpdates() {
        viewModelScope.launch {
            signalRService.events.collect {
                // Refresh products on any update (Order created/completed implies stock change)
                loadProducts()
            }
        }
    }

    fun submitOrder() {
        val currentCart = _uiState.value.cartItems
        if (currentCart.isEmpty()) return

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            createOrderUseCase(tableId, currentCart).onSuccess { order ->
                _uiState.value = _uiState.value.copy(
                    cartItems = emptyList(),
                    isLoading = false
                )
                // Navigate back immediately without showing snackbar to avoid delay
                _uiEvent.send(OrderUiEvent.NavigateBack)
            }.onFailure { error ->
                _uiState.value = _uiState.value.copy(
                    isLoading = false
                )
                _uiEvent.send(OrderUiEvent.ShowSnackbar("Lỗi: ${error.message}"))
            }
        }
    }
    
    fun loadProducts() {
        viewModelScope.launch {
            // Keep loading state silent if we already have data (refreshing in background)
            val isFirstLoad = _uiState.value.products.isEmpty()
            if (isFirstLoad) {
                _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            }
            
            getProductsUseCase().onSuccess { products ->
                val categories = listOf("Tất cả") + products.mapNotNull { it.categoryName }.distinct()
                _uiState.value = _uiState.value.copy(
                    products = products,
                    categories = categories,
                    isLoading = false
                )
            }.onFailure { error ->
                if (isFirstLoad) {
                    _uiState.value = _uiState.value.copy(
                        error = error.message,
                        isLoading = false
                    )
                }
            }
        }
    }

    fun selectCategory(category: String) {
        _uiState.value = _uiState.value.copy(selectedCategory = category)
    }
    
    fun updateSearchQuery(query: String) {
        _uiState.value = _uiState.value.copy(searchQuery = query)
    }

    fun addToCart(product: Product) {
        val currentCart = _uiState.value.cartItems
        val existingItemIndex = currentCart.indexOfFirst { it.product.id == product.id }
        
        // Stock check
        val currentQty = if (existingItemIndex != -1) currentCart[existingItemIndex].quantity else 0
        if (currentQty >= product.stockQuantity) {
            viewModelScope.launch { _uiEvent.send(OrderUiEvent.ShowSnackbar("Đã đạt giới hạn tồn kho")) }
            return
        }

        val newCart = if (existingItemIndex != -1) {
            // Create new list with updated quantity
            currentCart.mapIndexed { index, item ->
                if (index == existingItemIndex) {
                    item.copy(quantity = item.quantity + 1)
                } else {
                    item
                }
            }
        } else {
            // Add new item
            currentCart + CartItem(product, 1)
        }
        
        _uiState.value = _uiState.value.copy(cartItems = newCart)
    }

    fun updateQuantity(productId: Int, delta: Int) {
        val currentCart = _uiState.value.cartItems
        val itemIndex = currentCart.indexOfFirst { it.product.id == productId }
        
        if (itemIndex != -1) {
            val item = currentCart[itemIndex]
            val product = _uiState.value.products.find { it.id == productId } ?: return
            
            val newQuantity = item.quantity + delta
            
            // Stock Constraint
            if (delta > 0 && newQuantity > product.stockQuantity) {
                viewModelScope.launch { _uiEvent.send(OrderUiEvent.ShowSnackbar("Đã đạt giới hạn tồn kho")) }
                return
            }
            
            val newCart = if (newQuantity > 0) {
                // Update quantity
                currentCart.mapIndexed { index, cartItem ->
                    if (index == itemIndex) {
                        cartItem.copy(quantity = newQuantity)
                    } else {
                        cartItem
                    }
                }
            } else {
                // Remove item
                currentCart.filterIndexed { index, _ -> index != itemIndex }
            }
            
            _uiState.value = _uiState.value.copy(cartItems = newCart)
        }
    }
    
    fun setQuantity(productId: Int, quantity: Int) {
        val currentCart = _uiState.value.cartItems
        val product = _uiState.value.products.find { it.id == productId } ?: return
        
        // Cap quantity at stock
        val finalQuantity = if (quantity > product.stockQuantity) {
            viewModelScope.launch { _uiEvent.send(OrderUiEvent.ShowSnackbar("Số lượng điều chỉnh về mức tồn kho tối đa: ${product.stockQuantity}")) }
            product.stockQuantity
        } else {
            quantity
        }

        val itemIndex = currentCart.indexOfFirst { it.product.id == productId }
        
        if (itemIndex != -1) {
            val newCart = if (finalQuantity > 0) {
                // Update quantity
                currentCart.mapIndexed { index, cartItem ->
                    if (index == itemIndex) {
                        cartItem.copy(quantity = finalQuantity)
                    } else {
                        cartItem
                    }
                }
            } else {
                // Remove item
                currentCart.filterIndexed { index, _ -> index != itemIndex }
            }
            
            _uiState.value = _uiState.value.copy(cartItems = newCart)
        } else if (finalQuantity > 0) {
            val newCart = currentCart + CartItem(product, finalQuantity)
            _uiState.value = _uiState.value.copy(cartItems = newCart)
        }
    }
    
    fun updateNote(productId: Int, note: String) {
        val currentCart = _uiState.value.cartItems
        val itemIndex = currentCart.indexOfFirst { it.product.id == productId }
        
        if (itemIndex != -1) {
            val newCart = currentCart.mapIndexed { index, cartItem ->
                if (index == itemIndex) {
                    cartItem.copy(note = note)
                } else {
                    cartItem
                }
            }
            _uiState.value = _uiState.value.copy(cartItems = newCart)
        }
    }

    fun clearCart() {
        _uiState.value = _uiState.value.copy(cartItems = emptyList())
    }
    
    fun clearMessages() {
        _uiState.value = _uiState.value.copy(error = null, successMessage = null)
    }
}
