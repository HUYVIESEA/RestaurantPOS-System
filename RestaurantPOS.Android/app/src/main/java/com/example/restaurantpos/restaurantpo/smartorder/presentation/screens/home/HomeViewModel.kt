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
    val userRole: String = ""
)

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val tokenManager: TokenManager
) : ViewModel() {

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    init {
        loadUserInfo()
    }

    private fun loadUserInfo() {
        viewModelScope.launch {
            val name = tokenManager.userName.first() ?: "User"
            val role = tokenManager.userRole.first() ?: "Staff"
            _uiState.value = HomeUiState(userName = name, userRole = role)
        }
    }

    fun logout(onLogout: () -> Unit) {
        viewModelScope.launch {
            tokenManager.clearToken()
            onLogout()
        }
    }
}
