package com.example.restaurantpos.restaurantpo.smartorder.presentation.screens.kitchen

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.restaurantpos.restaurantpo.smartorder.data.remote.SignalRService
import com.example.restaurantpos.restaurantpo.smartorder.data.remote.SignalREvent
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
                when (event) {
                    is SignalREvent.OrderCreated -> fetchAndUpsertOrder(event.orderId)
                    is SignalREvent.OrderUpdated -> fetchAndUpsertOrder(event.orderId)
                    is SignalREvent.OrderCompleted -> removeOrder(event.orderId)
                    else -> {
                        // Optional: Reload all if unsure
                        // loadOrders() 
                    }
                }
            }
        }
    }

    private fun fetchAndUpsertOrder(orderId: Int) {
        viewModelScope.launch {
            ordersRepository.getOrder(orderId).onSuccess { order ->
                // Check if relevant to Kitchen (Pending or Processing)
                if (order.status == "Pending" || order.status == "Processing") {
                    updateLocalOrderList(order)
                } else {
                    // If it became Completed or Cancelled, remove it from Kitchen view
                    removeOrder(orderId)
                }
            }.onFailure {
                // If fetch failed, might be deleted or network error
                // Ideally log it
            }
        }
    }

    private fun updateLocalOrderList(newOrder: Order) {
        val currentPending = _uiState.value.pendingOrders.toMutableList()
        val currentProcessing = _uiState.value.processingOrders.toMutableList()

        // Remove potential existing instance to update it
        currentPending.removeAll { it.id == newOrder.id }
        currentProcessing.removeAll { it.id == newOrder.id }

        // Add to appropriate list
        if (newOrder.status == "Pending") {
            currentPending.add(newOrder)
        } else if (newOrder.status == "Processing") {
            currentProcessing.add(newOrder)
        }

        _uiState.value = _uiState.value.copy(
            pendingOrders = currentPending.sortedBy { it.id }, // FIFO based on ID
            processingOrders = currentProcessing.sortedBy { it.id }
        )
    }

    private fun removeOrder(orderId: Int) {
        val currentPending = _uiState.value.pendingOrders.filter { it.id != orderId }
        val currentProcessing = _uiState.value.processingOrders.filter { it.id != orderId }

        _uiState.value = _uiState.value.copy(
            pendingOrders = currentPending,
            processingOrders = currentProcessing
        )
    }

    fun updateOrderStatus(orderId: Int, newStatus: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            ordersRepository.updateOrderStatus(orderId, newStatus).onSuccess {
                // Success - reload orders to refresh lists
                loadOrders()
            }.onFailure { error ->
                _uiState.value = _uiState.value.copy(
                    error = "Update failed: ${error.message}",
                    isLoading = false
                )
            }
        }
    }
}
