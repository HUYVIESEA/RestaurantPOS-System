package com.example.restaurantpos.restaurantpo.smartorder.data.remote.api

import com.example.restaurantpos.restaurantpo.smartorder.data.remote.dto.LoginRequest
import com.example.restaurantpos.restaurantpo.smartorder.data.remote.dto.LoginResponse
import retrofit2.http.Body
import retrofit2.http.POST

interface AuthApi {
    @POST("api/auth/login")
    suspend fun login(@Body request: LoginRequest): LoginResponse
}
