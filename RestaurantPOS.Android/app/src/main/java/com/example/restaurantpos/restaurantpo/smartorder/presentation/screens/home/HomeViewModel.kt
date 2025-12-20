package com.example.restaurantpos.restaurantpo.smartorder.presentation.screens.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.restaurantpos.restaurantpo.smartorder.data.local.TokenManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import javax.inject.Inject

data class HomeUiState(
    val userName: String = "",
    val userRole: String = "Staff",
    val totalRevenue: Double = 0.0,
    val totalOrders: Int = 0,
    val isLoadingStats: Boolean = false
)

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val tokenManager: TokenManager,
    private val ordersRepository: com.example.restaurantpos.restaurantpo.smartorder.domain.repository.OrdersRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    init {
        loadUserInfo()
        loadStats()
    }

    private fun loadUserInfo() {
        viewModelScope.launch {
            val name = tokenManager.userName.first() ?: "User"
            val role = tokenManager.userRole.first() ?: "Staff"
            _uiState.value = _uiState.value.copy(userName = name, userRole = role)
        }
    }

    fun loadStats() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoadingStats = true)
            ordersRepository.getOrders().onSuccess { orders ->
                // Filter for today (simple check)
                val today = java.util.Date()
                val calendar = java.util.Calendar.getInstance()
                calendar.time = today
                val day = calendar.get(java.util.Calendar.DAY_OF_YEAR)
                val year = calendar.get(java.util.Calendar.YEAR)

                val todayOrders = orders.filter { 
                    val orderCal = java.util.Calendar.getInstance()
                    orderCal.time = it.orderDate
                    orderCal.get(java.util.Calendar.DAY_OF_YEAR) == day && 
                    orderCal.get(java.util.Calendar.YEAR) == year &&
                    it.status != "Cancelled"
                }
                
                val revenue = todayOrders.sumOf { it.totalAmount }
                val count = todayOrders.size
                
                _uiState.value = _uiState.value.copy(
                    totalRevenue = revenue,
                    totalOrders = count,
                    isLoadingStats = false
                )
            }.onFailure {
                 _uiState.value = _uiState.value.copy(isLoadingStats = false)
            }
        }
    }

    fun logout(onLogout: () -> Unit) {
        viewModelScope.launch {
            tokenManager.clearToken()
            onLogout()
        }
    }
}
