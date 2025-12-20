package com.example.restaurantpos.restaurantpo.smartorder.presentation.screens.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.restaurantpos.restaurantpo.smartorder.data.local.SettingsManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ScanQrViewModel @Inject constructor(
    private val settingsManager: SettingsManager,
    private val signalRService: com.example.restaurantpos.restaurantpo.smartorder.data.remote.SignalRService
) : ViewModel() {

    fun saveBaseUrl(url: String) {
        viewModelScope.launch(kotlinx.coroutines.Dispatchers.IO) {
            // Basic validation
            var validUrl = url.trim()
            if (!validUrl.startsWith("http://") && !validUrl.startsWith("https://")) {
                validUrl = "http://$validUrl"
            }
            if (!validUrl.endsWith("/")) {
                validUrl += "/"
            }
            
            settingsManager.saveBaseUrl(validUrl)
            
            // Reconnect SignalR
            try {
                signalRService.disconnect()
                val cleanUrl = validUrl.removeSuffix("/")
                signalRService.connect(cleanUrl)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
}
