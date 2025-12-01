package com.example.restaurantpos.restaurantpo.smartorder.data.remote.dto

import com.google.gson.annotations.SerializedName

data class LoginRequest(
    @SerializedName("username") val username: String,
    @SerializedName("password") val password: String
)

data class LoginResponse(
    @SerializedName("id") val id: Int?,
    @SerializedName("token") val token: String?,
    @SerializedName("username") val username: String?,
    @SerializedName("email") val email: String?,
    @SerializedName("fullName") val fullName: String?,
    @SerializedName("role") val role: String?,
    @SerializedName("expiresAt") val expiresAt: String?
)

data class UserDto(
    @SerializedName("id") val id: Int,
    @SerializedName("username") val username: String,
    @SerializedName("email") val email: String?,
    @SerializedName("fullName") val fullName: String?,
    @SerializedName("role") val role: String?
)

data class RegisterRequest(
    @SerializedName("username") val username: String,
    @SerializedName("password") val password: String,
    @SerializedName("email") val email: String,
    @SerializedName("fullName") val fullName: String,
    @SerializedName("role") val role: String
)
