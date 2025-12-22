package com.example.restaurantpos.restaurantpo.smartorder.presentation.screens.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.restaurantpos.restaurantpo.smartorder.data.local.SettingsManager
import com.example.restaurantpos.restaurantpo.smartorder.data.local.TokenManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class SettingsUiState(
    val baseUrl: String = "",
    val printerIp: String = "192.168.1.200",
    val printerPort: String = "9100",
    val isPrinterConnected: Boolean = false,
    val isSaved: Boolean = false,
    val username: String = "",
    val userRole: String = ""
)

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val settingsManager: SettingsManager,
    private val tokenManager: TokenManager
) : ViewModel() {

    private val _uiState = MutableStateFlow(SettingsUiState())
    val uiState: StateFlow<SettingsUiState> = _uiState.asStateFlow()
    
    private val _logoutEvent = kotlinx.coroutines.channels.Channel<Boolean>()
    val logoutEvent = _logoutEvent.receiveAsFlow()

    init {
        loadSettings()
        observeUserInfo()
    }

    private fun loadSettings() {
        val url = settingsManager.getBaseUrl()
        val printerIp = settingsManager.getPrinterIp() ?: "192.168.1.200"
        val printerPort = settingsManager.getPrinterPort()?.toString() ?: "9100"
        _uiState.update {
             it.copy(
                baseUrl = url, 
                printerIp = printerIp,
                printerPort = printerPort
            )
        }
    }
    
    private fun observeUserInfo() {
        viewModelScope.launch {
            tokenManager.userName.collect { name ->
                 _uiState.update { it.copy(username = name ?: "Unknown") }
            }
        }
        viewModelScope.launch {
            tokenManager.userRole.collect { role ->
                 _uiState.update { it.copy(userRole = role ?: "Staff") }
            }
        }
    }

    fun updateBaseUrl(newUrl: String) {
        _uiState.update { it.copy(baseUrl = newUrl, isSaved = false) }
    }

    fun updatePrinterIp(ip: String) {
        _uiState.update { it.copy(printerIp = ip, isSaved = false) }
    }

    fun updatePrinterPort(port: String) {
        _uiState.update { it.copy(printerPort = port, isSaved = false) }
    }

    fun saveSettings() {
        settingsManager.saveBaseUrl(_uiState.value.baseUrl)
        settingsManager.savePrinterSettings(_uiState.value.printerIp, _uiState.value.printerPort.toIntOrNull() ?: 9100)
        _uiState.update { it.copy(isSaved = true) }
    }
    
    fun testPrint() {
        // Simulate print
        _uiState.update { it.copy(isPrinterConnected = true) }
        // In real app, we would connect socket to IP:Port and send ESC/POS bytes
    }
    
    fun resetSavedState() {
        _uiState.update { it.copy(isSaved = false, isPrinterConnected = false) }
    }
    
    fun logout() {
        viewModelScope.launch {
            tokenManager.clearToken()
            _logoutEvent.send(true)
        }
    }
}
