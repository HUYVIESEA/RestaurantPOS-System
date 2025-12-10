package com.example.restaurantpos.restaurantpo.smartorder.presentation.screens.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.restaurantpos.restaurantpo.smartorder.domain.usecase.LoginUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class LoginUiState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val isSuccess: Boolean = false
)

@HiltViewModel
class LoginViewModel @Inject constructor(
    private val loginUseCase: LoginUseCase,
    private val serverDiscovery: com.example.restaurantpos.restaurantpo.smartorder.data.remote.discovery.ServerDiscovery,
    private val settingsManager: com.example.restaurantpos.restaurantpo.smartorder.data.local.SettingsManager
) : ViewModel() {

    private val _uiState = MutableStateFlow(LoginUiState())
    val uiState: StateFlow<LoginUiState> = _uiState.asStateFlow()
    
    private val _discoveryStatus = MutableStateFlow<String?>(null)
    val discoveryStatus: StateFlow<String?> = _discoveryStatus

    init {
        startDiscovery()
    }

    private fun startDiscovery() {
        viewModelScope.launch {
            // Start listening for UDP broadcasts
            launch {
                serverDiscovery.startListening()
            }
            
            // Observer discovered URL
            serverDiscovery.serverUrl.collect { url ->
                if (url != null) {
                    val currentUrl = settingsManager.getBaseUrl()
                    // Only update and restart if URL changed significantly
                    if (!currentUrl.contains(url) && url != currentUrl) {
                         settingsManager.saveBaseUrl(url)
                         _discoveryStatus.value = "Đã tìm thấy máy chủ: $url"
                         // Note: In a real app, you might need to trigger a Retrofit Client rebuild here 
                         // or ask user to restart app if DI graph is singleton
                    }
                }
            }
        }
    }
    
    override fun onCleared() {
        super.onCleared()
        serverDiscovery.stopListening()
    }

    fun login(username: String, password: String) {
        viewModelScope.launch {
            _uiState.value = LoginUiState(isLoading = true)
            
            val result = loginUseCase(username, password)
            
            result.onSuccess {
                _uiState.value = LoginUiState(isSuccess = true)
            }.onFailure { error ->
                _uiState.value = LoginUiState(
                    error = error.message ?: "Unknown error occurred"
                )
            }
        }
    }
    
    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
}
