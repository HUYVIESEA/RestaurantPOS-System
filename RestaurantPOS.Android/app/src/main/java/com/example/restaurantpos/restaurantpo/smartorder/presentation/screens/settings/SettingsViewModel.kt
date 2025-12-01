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
        _uiState.value = _uiState.value.copy(baseUrl = url)
    }

    fun updateBaseUrl(newUrl: String) {
        _uiState.value = _uiState.value.copy(baseUrl = newUrl, isSaved = false)
    }

    fun saveSettings() {
        settingsManager.saveBaseUrl(_uiState.value.baseUrl)
        _uiState.value = _uiState.value.copy(isSaved = true)
    }
    
    fun resetSavedState() {
        _uiState.value = _uiState.value.copy(isSaved = false)
    }
}
