package com.example.restaurantpos.restaurantpo.smartorder.presentation.screens.admin

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.restaurantpos.restaurantpo.smartorder.domain.model.User
import com.example.restaurantpos.restaurantpo.smartorder.domain.repository.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class UserManagementUiState(
    val users: List<User> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
    val successMessage: String? = null
)

@HiltViewModel
class UserManagementViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(UserManagementUiState())
    val uiState: StateFlow<UserManagementUiState> = _uiState.asStateFlow()

    init {
        loadUsers()
    }

    fun loadUsers() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            authRepository.getUsers().onSuccess { users ->
                _uiState.value = _uiState.value.copy(
                    users = users,
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

    fun addUser(username: String, password: String, email: String, fullName: String, role: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            authRepository.register(username, password, email, fullName, role).onSuccess {
                _uiState.value = _uiState.value.copy(
                    successMessage = "Thêm nhân viên thành công",
                    isLoading = false
                )
                loadUsers()
            }.onFailure { error ->
                _uiState.value = _uiState.value.copy(
                    error = error.message,
                    isLoading = false
                )
            }
        }
    }

    fun deleteUser(userId: Int) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            authRepository.deleteUser(userId).onSuccess {
                _uiState.value = _uiState.value.copy(
                    successMessage = "Xóa nhân viên thành công",
                    isLoading = false
                )
                loadUsers()
            }.onFailure { error ->
                _uiState.value = _uiState.value.copy(
                    error = error.message,
                    isLoading = false
                )
            }
        }
    }

    fun clearMessages() {
        _uiState.value = _uiState.value.copy(error = null, successMessage = null)
    }
}
