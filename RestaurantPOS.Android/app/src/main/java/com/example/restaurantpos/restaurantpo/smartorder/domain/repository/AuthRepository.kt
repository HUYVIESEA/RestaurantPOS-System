package com.example.restaurantpos.restaurantpo.smartorder.domain.repository

import com.example.restaurantpos.restaurantpo.smartorder.domain.model.User
import kotlinx.coroutines.flow.Flow

interface AuthRepository {
    suspend fun login(username: String, password: String): Result<User>
    suspend fun logout()
    fun getToken(): Flow<String?>
    suspend fun updateFcmToken(token: String)
    suspend fun getUsers(): Result<List<User>>
    suspend fun register(username: String, password: String, email: String, fullName: String, role: String): Result<User>
    suspend fun updateUser(user: User): Result<Unit>
    suspend fun deleteUser(id: Int): Result<Unit>
}
