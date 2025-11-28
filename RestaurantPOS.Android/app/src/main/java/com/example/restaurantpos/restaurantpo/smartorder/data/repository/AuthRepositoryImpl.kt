package com.example.restaurantpos.restaurantpo.smartorder.data.repository

import com.example.restaurantpos.restaurantpo.smartorder.data.local.TokenManager
import com.example.restaurantpos.restaurantpo.smartorder.data.remote.api.AuthApi
import com.example.restaurantpos.restaurantpo.smartorder.data.remote.dto.LoginRequest
import com.example.restaurantpos.restaurantpo.smartorder.domain.model.User
import com.example.restaurantpos.restaurantpo.smartorder.domain.repository.AuthRepository
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class AuthRepositoryImpl @Inject constructor(
    private val api: AuthApi,
    private val tokenManager: TokenManager
) : AuthRepository {
    
    override suspend fun login(username: String, password: String): Result<User> {
        return try {
            val response = api.login(LoginRequest(username, password))
            
            // Map response to User model
            val user = User(
                id = response.id?.toString() ?: "",
                username = response.username ?: "",
                fullName = response.fullName ?: "",
                role = response.role ?: "",
                token = response.token ?: ""
            )
            
            // Save token and user info
            response.token?.let { tokenManager.saveToken(it) }
            if (response.role != null && response.fullName != null) {
                tokenManager.saveUserInfo(response.role, response.fullName)
            }
            
            Result.success(user)
        } catch (e: Exception) {
            e.printStackTrace() // Log the error
            Result.failure(Exception("Login failed: ${e.message}"))
        }
    }

    override suspend fun logout() {
        tokenManager.clearToken()
    }

    override fun getToken(): Flow<String?> {
        return tokenManager.token
    }
}
