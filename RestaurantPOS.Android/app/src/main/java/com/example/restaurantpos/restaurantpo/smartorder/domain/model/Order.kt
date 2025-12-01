package com.example.restaurantpos.restaurantpo.smartorder.domain.model

import java.util.Date

data class Order(
    val id: Int,
    val tableId: Int,
    val orderDate: Date,
    val totalAmount: Double,
    val status: String,
    val paymentStatus: String,
    val items: List<OrderItem>,
    val isSynced: Boolean = true
)

data class OrderItem(
    val id: Int,
    val productId: Int,
    val productName: String,
    val quantity: Int,
    val price: Double,
    val note: String?
)
