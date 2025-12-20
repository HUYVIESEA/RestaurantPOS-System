package com.example.restaurantpos.restaurantpo.smartorder.presentation.screens.admin

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.restaurantpos.restaurantpo.smartorder.data.local.entity.PaymentEntity
import com.example.restaurantpos.restaurantpo.smartorder.domain.repository.OrdersRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ReportsUiState(
    val payments: List<PaymentEntity> = emptyList(),
    val totalRevenue: Double = 0.0,
    val cashRevenue: Double = 0.0,
    val transferRevenue: Double = 0.0,
    val isLoading: Boolean = false
)

@HiltViewModel
class ReportsViewModel @Inject constructor(
    private val ordersRepository: OrdersRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(ReportsUiState())
    val uiState: StateFlow<ReportsUiState> = _uiState.asStateFlow()

    init {
        loadData()
    }

    private fun loadData() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            ordersRepository.getPaymentHistory().collectLatest { payments ->
                val total = payments.sumOf { it.amount }
                val cash = payments.filter { it.paymentMethod == "Cash" }.sumOf { it.amount }
                val transfer = payments.filter { it.paymentMethod == "Transfer" }.sumOf { it.amount }
                
                _uiState.value = _uiState.value.copy(
                    payments = payments,
                    totalRevenue = total,
                    cashRevenue = cash,
                    transferRevenue = transfer,
                    isLoading = false
                )
            }
        }
    }
}
