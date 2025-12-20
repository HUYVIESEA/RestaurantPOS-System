package com.example.restaurantpos.restaurantpo.smartorder.domain.repository

import com.example.restaurantpos.restaurantpo.smartorder.domain.model.Order
import com.example.restaurantpos.restaurantpo.smartorder.domain.model.CartItem

interface OrdersRepository {
    suspend fun getOrders(): Result<List<Order>>
    suspend fun getOrder(id: Int): Result<Order>
    suspend fun getOrdersByTable(tableId: Int): Result<List<Order>>
    suspend fun createOrder(tableId: Int, items: List<CartItem>): Result<Order>
    suspend fun completeOrder(orderId: Int, receivedAmount: Double, paymentMethod: String = "Cash"): Result<Order>
    suspend fun updateItemQuantity(orderId: Int, itemId: Int, quantity: Int): Result<Order>
    suspend fun removeItemFromOrder(orderId: Int, itemId: Int): Result<Order>
    suspend fun updateOrderStatus(orderId: Int, status: String): Result<Order>
    suspend fun getPaymentSettings(): Result<com.example.restaurantpos.restaurantpo.smartorder.data.remote.dto.PaymentSettingsDto>
    fun getPaymentHistory(): kotlinx.coroutines.flow.Flow<List<com.example.restaurantpos.restaurantpo.smartorder.data.local.entity.PaymentEntity>>
}
