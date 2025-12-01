package com.example.restaurantpos.restaurantpo.smartorder.presentation.screens.kitchen

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.restaurantpos.restaurantpo.smartorder.data.remote.SignalRService
import com.example.restaurantpos.restaurantpo.smartorder.domain.model.Order
import com.example.restaurantpos.restaurantpo.smartorder.domain.repository.OrdersRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class KitchenUiState(
    val pendingOrders: List<Order> = emptyList(),
    val processingOrders: List<Order> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null
)

@HiltViewModel
class KitchenViewModel @Inject constructor(
    private val ordersRepository: OrdersRepository,
    private val signalRService: SignalRService,
    private val notificationRepository: com.example.restaurantpos.restaurantpo.smartorder.domain.repository.NotificationRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(KitchenUiState())
    val uiState: StateFlow<KitchenUiState> = _uiState.asStateFlow()

    init {
        loadOrders()
        listenToSignalREvents()
        subscribeToKitchenNotifications()
    }

    private fun subscribeToKitchenNotifications() {
        viewModelScope.launch {
            notificationRepository.subscribeToTopic("Kitchen")
        }
    }

    fun loadOrders() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            ordersRepository.getOrders().onSuccess { orders ->
                // Filter for active kitchen orders
                val activeOrders = orders.filter { 
                    it.status == "Pending" || it.status == "Processing" 
                }
                
                _uiState.value = _uiState.value.copy(
                    pendingOrders = activeOrders.filter { it.status == "Pending" },
                    processingOrders = activeOrders.filter { it.status == "Processing" },
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

    private fun listenToSignalREvents() {
        viewModelScope.launch {
            signalRService.events.collect { event ->
                // Reload on any order update for now
                // Optimization: Check if event relates to kitchen (Created, StatusChanged)
                loadOrders()
            }
        }
    }

    fun updateOrderStatus(orderId: Int, newStatus: String) {
        viewModelScope.launch {
            // TODO: Implement API call to update status
            // For now, we just reload to simulate (assuming backend updates via other means or we add updateStatus to repo)
            // ordersRepository.updateOrderStatus(orderId, newStatus)
            loadOrders()
        }
    }
}
