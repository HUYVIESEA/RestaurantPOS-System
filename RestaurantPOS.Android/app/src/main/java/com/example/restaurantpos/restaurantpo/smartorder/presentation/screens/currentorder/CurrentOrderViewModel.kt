package com.example.restaurantpos.restaurantpo.smartorder.presentation.screens.currentorder

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.restaurantpos.restaurantpo.smartorder.domain.model.Order
import com.example.restaurantpos.restaurantpo.smartorder.domain.repository.OrdersRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class CurrentOrderUiState(
    val order: Order? = null,
    val isLoading: Boolean = false,
    val error: String? = null,
    val successMessage: String? = null
)

@HiltViewModel
class CurrentOrderViewModel @Inject constructor(
    private val ordersRepository: OrdersRepository,
    private val signalRService: com.example.restaurantpos.restaurantpo.smartorder.data.remote.SignalRService
) : ViewModel() {

    private val _uiState = MutableStateFlow(CurrentOrderUiState())
    val uiState: StateFlow<CurrentOrderUiState> = _uiState.asStateFlow()

    init {
        listenToSignalREvents()
    }

    private fun listenToSignalREvents() {
        viewModelScope.launch {
            signalRService.events.collect { event ->
                val currentOrder = _uiState.value.order
                when (event) {
                    is com.example.restaurantpos.restaurantpo.smartorder.data.remote.SignalREvent.OrderUpdated -> {
                        if (currentOrder != null && currentOrder.id == event.orderId) {
                            loadCurrentOrder(currentOrder.tableId)
                        }
                    }
                    is com.example.restaurantpos.restaurantpo.smartorder.data.remote.SignalREvent.OrderCompleted -> {
                        if (currentOrder != null && currentOrder.id == event.orderId) {
                            loadCurrentOrder(currentOrder.tableId)
                        }
                    }
                    is com.example.restaurantpos.restaurantpo.smartorder.data.remote.SignalREvent.OrderCreated -> {
                        // If we are viewing a table with no order, and a new order is created for this table
                        // But we don't know the tableId from the event easily unless we fetch it or it's in event
                        // Assuming we might need to reload if we are on that table.
                        // For now, let's just reload if we have a tableId in mind? 
                        // Actually loadCurrentOrder takes tableId. We don't store tableId in state explicitly except inside order.
                        // If order is null, we don't know which table we are viewing unless we store it.
                    }
                    else -> {}
                }
            }
        }
    }

    fun loadCurrentOrder(tableId: Int) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)

            ordersRepository.getOrdersByTable(tableId).onSuccess { orders ->
                android.util.Log.d("CurrentOrderVM", "Found ${orders.size} orders for table $tableId")
                orders.forEach { order ->
                    android.util.Log.d("CurrentOrderVM", "Order #${order.id}: status=${order.status}, items=${order.items.size}")
                }
                
                // Get the most recent pending order
                var currentOrder = orders
                    .filter { it.status.equals("Pending", ignoreCase = true) }
                    .maxByOrNull { it.orderDate }
                
                // Fallback: If no pending order, get the most recent order
                if (currentOrder == null && orders.isNotEmpty()) {
                    currentOrder = orders.maxByOrNull { it.orderDate }
                    android.util.Log.d("CurrentOrderVM", "No pending order, using most recent: #${currentOrder?.id}")
                }

                _uiState.value = _uiState.value.copy(
                    order = currentOrder,
                    isLoading = false
                )
            }.onFailure { error ->
                android.util.Log.e("CurrentOrderVM", "Error loading orders", error)
                _uiState.value = _uiState.value.copy(
                    error = "Lỗi: ${error.message}",
                    isLoading = false
                )
            }
        }
    }

    fun processPayment(receivedAmount: Double) {
        val order = _uiState.value.order ?: return

        if (receivedAmount < order.totalAmount) {
            _uiState.value = _uiState.value.copy(
                error = "Số tiền nhận không đủ"
            )
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)

            ordersRepository.completeOrder(order.id, receivedAmount, "Cash").onSuccess { completedOrder ->
                val change = receivedAmount - order.totalAmount
                _uiState.value = _uiState.value.copy(
                    successMessage = "Thanh toán thành công! Tiền thừa: ${String.format("%,.0f", change)}đ",
                    isLoading = false
                )
            }.onFailure { error ->
                _uiState.value = _uiState.value.copy(
                    error = "Lỗi thanh toán: ${error.message}",
                    isLoading = false
                )
            }
        }
    }

    fun clearMessages() {
        _uiState.value = _uiState.value.copy(error = null, successMessage = null)
    }
    
    fun increaseItemQuantity(itemId: Int) {
        val order = _uiState.value.order ?: return
        
        viewModelScope.launch {
            // Optimistic update - Update UI immediately
            val currentItem = order.items.find { it.id == itemId } ?: return@launch
            val newQuantity = currentItem.quantity + 1
            
            val updatedItems = order.items.map { item ->
                if (item.id == itemId) {
                    item.copy(quantity = newQuantity)
                } else {
                    item
                }
            }
            
            val updatedOrder = order.copy(
                items = updatedItems,
                totalAmount = updatedItems.sumOf { it.price * it.quantity }
            )
            
            _uiState.value = _uiState.value.copy(order = updatedOrder)
            
            // Then sync with backend
            ordersRepository.updateItemQuantity(order.id, itemId, newQuantity).onFailure { error ->
                // Revert on error
                _uiState.value = _uiState.value.copy(
                    order = order,
                    error = "Lỗi: ${error.message}"
                )
            }
        }
    }
    
    fun updateItemQuantity(itemId: Int, newQuantity: Int) {
        val order = _uiState.value.order ?: return
        
        viewModelScope.launch {
            // Optimistic update
            val currentItem = order.items.find { it.id == itemId } ?: return@launch
            
            if (newQuantity <= 0) {
                // Optimistic remove
                val updatedItems = order.items.filter { it.id != itemId }
                val updatedOrder = order.copy(
                    items = updatedItems,
                    totalAmount = updatedItems.sumOf { it.price * it.quantity }
                )
                
                _uiState.value = _uiState.value.copy(order = updatedOrder)
                
                // Sync with backend (Remove)
                ordersRepository.removeItemFromOrder(order.id, itemId).onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        order = order,
                        error = "Lỗi: ${error.message}"
                    )
                }
            } else {
                // Optimistic update quantity
                val updatedItems = order.items.map { item ->
                    if (item.id == itemId) {
                        item.copy(quantity = newQuantity)
                    } else {
                        item
                    }
                }
                
                val updatedOrder = order.copy(
                    items = updatedItems,
                    totalAmount = updatedItems.sumOf { it.price * it.quantity }
                )
                
                _uiState.value = _uiState.value.copy(order = updatedOrder)
                
                // Sync with backend (Update)
                ordersRepository.updateItemQuantity(order.id, itemId, newQuantity).onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        order = order,
                        error = "Lỗi: ${error.message}"
                    )
                }
            }
        }
    }
}
