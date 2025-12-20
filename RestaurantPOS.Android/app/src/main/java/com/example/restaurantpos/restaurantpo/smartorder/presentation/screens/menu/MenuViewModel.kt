package com.example.restaurantpos.restaurantpo.smartorder.presentation.screens.menu

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.restaurantpos.restaurantpo.smartorder.domain.model.Product
import com.example.restaurantpos.restaurantpo.smartorder.domain.repository.ProductsRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class MenuUiState(
    val products: List<Product> = emptyList(),
    val filteredProducts: List<Product> = emptyList(),
    val categories: List<String> = emptyList(),
    val distinctCategories: List<Pair<Int, String>> = emptyList(),
    val selectedCategory: String = "Tất cả",
    val searchQuery: String = "",
    val isLoading: Boolean = false,
    val error: String? = null,
    val userRole: String = ""
)

@HiltViewModel
class MenuViewModel @Inject constructor(
    private val productsRepository: ProductsRepository,
    private val tokenManager: com.example.restaurantpos.restaurantpo.smartorder.data.local.TokenManager
) : ViewModel() {

    private val _uiState = MutableStateFlow(MenuUiState())
    val uiState: StateFlow<MenuUiState> = _uiState.asStateFlow()

    init {
        loadUserRole()
        loadProducts()
    }

    private fun loadUserRole() {
        viewModelScope.launch {
            tokenManager.userRole.collect { role ->
                _uiState.value = _uiState.value.copy(userRole = role ?: "")
            }
        }
    }

    fun loadProducts() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            productsRepository.getProducts().onSuccess { products ->
                val categories = listOf("Tất cả") + products.mapNotNull { it.categoryName }.distinct().sorted()
                val distinctCategories = products.map { it.categoryId to (it.categoryName ?: "Khác") }
                    .distinctBy { it.first }
                    .sortedBy { it.second }
                
                _uiState.value = _uiState.value.copy(
                    products = products,
                    filteredProducts = products,
                    categories = categories,
                    distinctCategories = distinctCategories,
                    isLoading = false
                )
                applyFilters()
            }.onFailure { error ->
                _uiState.value = _uiState.value.copy(
                    error = error.message,
                    isLoading = false
                )
            }
        }
    }

    fun selectCategory(category: String) {
        _uiState.value = _uiState.value.copy(selectedCategory = category)
        applyFilters()
    }

    fun updateSearchQuery(query: String) {
        _uiState.value = _uiState.value.copy(searchQuery = query)
        applyFilters()
    }

    private fun applyFilters() {
        val state = _uiState.value
        var result = state.products

        // Filter by category
        if (state.selectedCategory != "Tất cả") {
            result = result.filter { it.categoryName == state.selectedCategory }
        }

        // Filter by search query
        if (state.searchQuery.isNotEmpty()) {
            result = result.filter { 
                it.name.contains(state.searchQuery, ignoreCase = true) 
            }
        }

        _uiState.value = state.copy(filteredProducts = result)
    }
    fun addProduct(name: String, description: String, price: Double, categoryId: Int, categoryName: String, stockQuantity: Int, isAvailable: Boolean) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            val product = Product(
                id = 0,
                name = name,
                description = description,
                price = price,
                categoryId = categoryId,
                categoryName = categoryName,
                imageUrl = null, // TODO: Image upload
                isAvailable = isAvailable,
                stockQuantity = stockQuantity
            )
            productsRepository.addProduct(product).onSuccess {
                loadProducts()
            }.onFailure { error ->
                _uiState.value = _uiState.value.copy(isLoading = false, error = error.message)
            }
        }
    }

    fun updateProduct(product: Product) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            productsRepository.updateProduct(product).onSuccess {
                loadProducts()
            }.onFailure { error ->
                _uiState.value = _uiState.value.copy(isLoading = false, error = error.message)
            }
        }
    }

    fun deleteProduct(productId: Int) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            productsRepository.deleteProduct(productId).onSuccess {
                loadProducts()
            }.onFailure { error ->
                _uiState.value = _uiState.value.copy(isLoading = false, error = error.message)
            }
        }
    }
}
