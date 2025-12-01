package com.example.restaurantpos.restaurantpo.smartorder.data.remote.api

import com.example.restaurantpos.restaurantpo.smartorder.data.remote.dto.LoginRequest
import com.example.restaurantpos.restaurantpo.smartorder.data.remote.dto.LoginResponse
import com.example.restaurantpos.restaurantpo.smartorder.data.remote.dto.UpdateFcmTokenRequest
import retrofit2.http.Body
import retrofit2.http.POST

interface AuthApi {
    @POST("api/auth/login")
    suspend fun login(@Body request: LoginRequest): LoginResponse

    @POST("api/auth/UpdateFcmToken")
    suspend fun updateFcmToken(@Body request: UpdateFcmTokenRequest)

    @retrofit2.http.GET("api/auth/Users")
    suspend fun getUsers(): List<com.example.restaurantpos.restaurantpo.smartorder.data.remote.dto.UserDto>

    @POST("api/auth/Register")
    suspend fun register(@Body request: com.example.restaurantpos.restaurantpo.smartorder.data.remote.dto.RegisterRequest): com.example.restaurantpos.restaurantpo.smartorder.data.remote.dto.UserDto

    @retrofit2.http.PUT("api/auth/Users/{id}")
    suspend fun updateUser(@retrofit2.http.Path("id") id: Int, @Body user: com.example.restaurantpos.restaurantpo.smartorder.data.remote.dto.UserDto)

    @retrofit2.http.DELETE("api/auth/Users/{id}")
    suspend fun deleteUser(@retrofit2.http.Path("id") id: Int)
}
