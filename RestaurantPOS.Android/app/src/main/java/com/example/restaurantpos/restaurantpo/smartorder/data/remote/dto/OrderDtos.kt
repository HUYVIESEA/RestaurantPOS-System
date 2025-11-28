package com.example.restaurantpos.restaurantpo.smartorder.data.remote.dto

import com.google.gson.annotations.SerializedName

data class OrderDto(
    @SerializedName("id") val id: Int,
    @SerializedName("tableId") val tableId: Int,
    @SerializedName("orderDate") val orderDate: String,
    @SerializedName("totalAmount") val totalAmount: Double,
    @SerializedName("status") val status: String?,
    @SerializedName("paymentStatus") val paymentStatus: String?, // Backend doesn't have this yet
    @SerializedName("orderItems") val items: List<OrderItemDto>?
)

data class OrderItemDto(
    @SerializedName("id") val id: Int,
    @SerializedName("productId") val productId: Int,
    @SerializedName("product") val product: ProductDto?, // To get product name
    @SerializedName("quantity") val quantity: Int,
    @SerializedName("unitPrice") val price: Double,
    @SerializedName("notes") val note: String?
)

data class CreateOrderRequest(
    @SerializedName("tableId") val tableId: Int,
    @SerializedName("orderItems") val items: List<CreateOrderItemRequest>
)

data class CreateOrderItemRequest(
    @SerializedName("productId") val productId: Int,
    @SerializedName("quantity") val quantity: Int,
    @SerializedName("notes") val note: String?
)

data class CompleteOrderRequest(
    @SerializedName("receivedAmount") val receivedAmount: Double,
    @SerializedName("paymentMethod") val paymentMethod: String = "Cash"
)
