package com.example.restaurantpos.restaurantpo.smartorder.data.repository

import com.example.restaurantpos.restaurantpo.smartorder.data.remote.api.OrdersApi
import com.example.restaurantpos.restaurantpo.smartorder.data.remote.dto.CreateOrderItemRequest
import com.example.restaurantpos.restaurantpo.smartorder.data.remote.dto.CreateOrderRequest
import com.example.restaurantpos.restaurantpo.smartorder.data.remote.dto.OrderDto
import com.example.restaurantpos.restaurantpo.smartorder.domain.model.CartItem
import com.example.restaurantpos.restaurantpo.smartorder.domain.model.Order
import com.example.restaurantpos.restaurantpo.smartorder.domain.model.OrderItem
import com.example.restaurantpos.restaurantpo.smartorder.domain.repository.OrdersRepository
import java.text.SimpleDateFormat
import java.util.*
import javax.inject.Inject

class OrdersRepositoryImpl @Inject constructor(
    private val api: OrdersApi
) : OrdersRepository {
    
    private val dateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault())
    
    private fun mapDtoToDomain(dto: OrderDto): Order {
        return Order(
            id = dto.id,
            tableId = dto.tableId,
            orderDate = try { dateFormat.parse(dto.orderDate) ?: Date() } catch (e: Exception) { Date() },
            totalAmount = dto.totalAmount,
            status = dto.status ?: "Pending",
            paymentStatus = dto.paymentStatus ?: "Unpaid",
            items = dto.items?.map { itemDto ->
                OrderItem(
                    id = itemDto.id,
                    productId = itemDto.productId,
                    productName = itemDto.product?.name ?: "Món #${itemDto.productId}",
                    quantity = itemDto.quantity,
                    price = itemDto.price,
                    note = itemDto.note
                )
            } ?: emptyList()
        )
    }
    
    override suspend fun getOrders(): Result<List<Order>> {
        return try {
            val orders = api.getOrders().map { mapDtoToDomain(it) }
            Result.success(orders)
        } catch (e: Exception) {
            e.printStackTrace()
            Result.failure(Exception("Failed to load orders: ${e.message}"))
        }
    }
    
    override suspend fun getOrder(id: Int): Result<Order> {
        return try {
            val dto = api.getOrder(id)
            Result.success(mapDtoToDomain(dto))
        } catch (e: Exception) {
            e.printStackTrace()
            Result.failure(Exception("Failed to load order: ${e.message}"))
        }
    }
    
    override suspend fun getOrdersByTable(tableId: Int): Result<List<Order>> {
        return try {
            val orders = api.getOrdersByTable(tableId).map { mapDtoToDomain(it) }
            Result.success(orders)
        } catch (e: Exception) {
            e.printStackTrace()
            Result.failure(Exception("Failed to load orders for table: ${e.message}"))
        }
    }
    
    override suspend fun createOrder(tableId: Int, items: List<CartItem>): Result<Order> {
        return try {
            val request = CreateOrderRequest(
                tableId = tableId,
                items = items.map { 
                    CreateOrderItemRequest(
                        productId = it.product.id,
                        quantity = it.quantity,
                        note = it.note
                    )
                }
            )
            val dto = api.createOrder(request)
            Result.success(mapDtoToDomain(dto))
        } catch (e: Exception) {
            e.printStackTrace()
            Result.failure(Exception("Failed to create order: ${e.message}"))
        }
    }
    
    override suspend fun completeOrder(orderId: Int, receivedAmount: Double, paymentMethod: String): Result<Order> {
        return try {
            val request = com.example.restaurantpos.restaurantpo.smartorder.data.remote.dto.CompleteOrderRequest(
                receivedAmount = receivedAmount,
                paymentMethod = paymentMethod
            )
            val dto = api.completeOrder(orderId, request)
            Result.success(mapDtoToDomain(dto))
        } catch (e: Exception) {
            e.printStackTrace()
            Result.failure(Exception("Failed to complete order: ${e.message}"))
        }
    }
    
    override suspend fun updateItemQuantity(orderId: Int, itemId: Int, quantity: Int): Result<Order> {
        return try {
            val dto = api.updateItemQuantity(orderId, itemId, quantity)
            Result.success(mapDtoToDomain(dto))
        } catch (e: Exception) {
            e.printStackTrace()
            Result.failure(Exception("Failed to update item quantity: ${e.message}"))
        }
    }
    
    override suspend fun removeItemFromOrder(orderId: Int, itemId: Int): Result<Order> {
        return try {
            val dto = api.removeItemFromOrder(orderId, itemId)
            Result.success(mapDtoToDomain(dto))
        } catch (e: Exception) {
            e.printStackTrace()
            Result.failure(Exception("Failed to remove item: ${e.message}"))
        }
    }
}
