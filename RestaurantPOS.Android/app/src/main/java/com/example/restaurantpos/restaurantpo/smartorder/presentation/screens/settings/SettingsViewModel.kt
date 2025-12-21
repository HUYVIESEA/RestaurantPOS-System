package com.example.restaurantpos.restaurantpo.smartorder.presentation.screens.settings

import androidx.lifecycle.ViewModel
import com.example.restaurantpos.restaurantpo.smartorder.data.local.SettingsManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject

data class SettingsUiState(
    val baseUrl: String = "",
    val printerIp: String = "192.168.1.200",
    val printerPort: String = "9100",
    val isPrinterConnected: Boolean = false,
    val isSaved: Boolean = false
)

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val settingsManager: SettingsManager
) : ViewModel() {

    private val _uiState = MutableStateFlow(SettingsUiState())
    val uiState: StateFlow<SettingsUiState> = _uiState.asStateFlow()

    init {
        loadSettings()
    }

    private fun loadSettings() {
        val url = settingsManager.getBaseUrl()
        val printerIp = settingsManager.getPrinterIp() ?: "192.168.1.200"
        val printerPort = settingsManager.getPrinterPort()?.toString() ?: "9100"
        _uiState.value = _uiState.value.copy(
            baseUrl = url, 
            printerIp = printerIp,
            printerPort = printerPort
        )
    }

    fun updateBaseUrl(newUrl: String) {
        _uiState.value = _uiState.value.copy(baseUrl = newUrl, isSaved = false)
    }

    fun updatePrinterIp(ip: String) {
        _uiState.value = _uiState.value.copy(printerIp = ip, isSaved = false)
    }

    fun updatePrinterPort(port: String) {
        _uiState.value = _uiState.value.copy(printerPort = port, isSaved = false)
    }

    fun saveSettings() {
        settingsManager.saveBaseUrl(_uiState.value.baseUrl)
        settingsManager.savePrinterSettings(_uiState.value.printerIp, _uiState.value.printerPort.toIntOrNull() ?: 9100)
        _uiState.value = _uiState.value.copy(isSaved = true)
    }
    
    fun testPrint() {
        // Simulate print
        _uiState.value = _uiState.value.copy(isPrinterConnected = true)
        // In real app, we would connect socket to IP:Port and send ESC/POS bytes
    }
    
    fun resetSavedState() {
        _uiState.value = _uiState.value.copy(isSaved = false, isPrinterConnected = false)
    }
}
