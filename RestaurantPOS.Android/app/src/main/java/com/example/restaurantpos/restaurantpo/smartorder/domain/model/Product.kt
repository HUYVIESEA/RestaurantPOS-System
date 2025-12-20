package com.example.restaurantpos.restaurantpo.smartorder.domain.model

data class Product(
    val id: Int,
    val name: String,
    val description: String?,
    val price: Double,
    val categoryId: Int,
    val categoryName: String?,
    val imageUrl: String?,
    val stockQuantity: Int,
    val isAvailable: Boolean
)
