package com.example.restaurantpos.restaurantpo.smartorder.presentation.screens.orderhistory

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.restaurantpos.restaurantpo.smartorder.domain.model.Order
import com.example.restaurantpos.restaurantpo.smartorder.domain.repository.OrdersRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.util.Date
import javax.inject.Inject

data class OrderHistoryUiState(
    val orders: List<Order> = emptyList(),
    val filteredOrders: List<Order> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
    val selectedStatus: String = "Tất cả", // "Tất cả", "Pending", "Completed", "Cancelled"
    val selectedDate: Date? = null // Filter by date (optional)
)

@HiltViewModel
class OrderHistoryViewModel @Inject constructor(
    private val ordersRepository: OrdersRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(OrderHistoryUiState())
    val uiState: StateFlow<OrderHistoryUiState> = _uiState.asStateFlow()

    init {
        loadOrders()
    }

    fun loadOrders() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            ordersRepository.getOrders().onSuccess { orders ->
                // Sort by date descending
                val sortedOrders = orders.sortedByDescending { it.orderDate }
                _uiState.value = _uiState.value.copy(
                    orders = sortedOrders,
                    filteredOrders = filterOrders(sortedOrders, _uiState.value.selectedStatus),
                    isLoading = false
                )
            }.onFailure { error ->
                _uiState.value = _uiState.value.copy(
                    error = error.message,
                    isLoading = false
                )
            }
        }
    }

    fun filterByStatus(status: String) {
        val currentOrders = _uiState.value.orders
        _uiState.value = _uiState.value.copy(
            selectedStatus = status,
            filteredOrders = filterOrders(currentOrders, status)
        )
    }

    private fun filterOrders(orders: List<Order>, status: String): List<Order> {
        return if (status == "Tất cả") {
            orders
        } else {
            orders.filter { it.status.equals(status, ignoreCase = true) }
        }
    }
}
