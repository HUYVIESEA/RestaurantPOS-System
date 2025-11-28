package com.example.restaurantpos.restaurantpo.smartorder.domain.model

data class User(
    val id: String,
    val username: String,
    val fullName: String,
    val role: String,
    val token: String
)
