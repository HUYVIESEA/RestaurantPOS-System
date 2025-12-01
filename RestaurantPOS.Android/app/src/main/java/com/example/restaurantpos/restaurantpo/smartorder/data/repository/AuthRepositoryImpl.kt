package com.example.restaurantpos.restaurantpo.smartorder.data.repository

import com.example.restaurantpos.restaurantpo.smartorder.data.local.TokenManager
import com.example.restaurantpos.restaurantpo.smartorder.data.remote.api.AuthApi
import com.example.restaurantpos.restaurantpo.smartorder.data.remote.dto.LoginRequest
import com.example.restaurantpos.restaurantpo.smartorder.data.remote.dto.UpdateFcmTokenRequest
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

    override suspend fun updateFcmToken(token: String) {
        tokenManager.saveFcmToken(token)
        try {
            api.updateFcmToken(UpdateFcmTokenRequest(token))
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    override suspend fun getUsers(): Result<List<User>> {
        return try {
            val userDtos = api.getUsers()
            val users = userDtos.map { dto ->
                User(
                    id = dto.id.toString(),
                    username = dto.username,
                    fullName = dto.fullName ?: "",
                    role = dto.role ?: "Staff",
                    token = "" // No token for listed users
                )
            }
            Result.success(users)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun register(username: String, password: String, email: String, fullName: String, role: String): Result<User> {
        return try {
            val request = com.example.restaurantpos.restaurantpo.smartorder.data.remote.dto.RegisterRequest(
                username = username,
                password = password,
                email = email,
                fullName = fullName,
                role = role
            )
            val dto = api.register(request)
            val user = User(
                id = dto.id.toString(),
                username = dto.username,
                fullName = dto.fullName ?: "",
                role = dto.role ?: "Staff",
                token = ""
            )
            Result.success(user)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun updateUser(user: User): Result<Unit> {
        return try {
            val dto = com.example.restaurantpos.restaurantpo.smartorder.data.remote.dto.UserDto(
                id = user.id.toIntOrNull() ?: 0,
                username = user.username,
                email = null, // Email not editable via this simple update for now, or add to User model
                fullName = user.fullName,
                role = user.role
            )
            api.updateUser(user.id.toInt(), dto)
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun deleteUser(id: Int): Result<Unit> {
        return try {
            api.deleteUser(id)
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
