package com.example.restaurantpos.restaurantpo.smartorder.data.repository

import com.example.restaurantpos.restaurantpo.smartorder.data.local.dao.OrderDao
import com.example.restaurantpos.restaurantpo.smartorder.data.local.entity.OrderEntity
import com.example.restaurantpos.restaurantpo.smartorder.data.local.entity.OrderItemEntity
import com.example.restaurantpos.restaurantpo.smartorder.data.local.entity.toEntity
import com.example.restaurantpos.restaurantpo.smartorder.data.remote.api.OrdersApi
import com.example.restaurantpos.restaurantpo.smartorder.data.remote.dto.CreateOrderItemRequest
import com.example.restaurantpos.restaurantpo.smartorder.data.remote.dto.CreateOrderRequest
import com.example.restaurantpos.restaurantpo.smartorder.data.remote.dto.OrderDto
import com.example.restaurantpos.restaurantpo.smartorder.domain.model.CartItem
import com.example.restaurantpos.restaurantpo.smartorder.domain.model.Order
import com.example.restaurantpos.restaurantpo.smartorder.domain.model.OrderItem
import com.example.restaurantpos.restaurantpo.smartorder.domain.repository.OrdersRepository
import kotlinx.coroutines.flow.first
import java.text.SimpleDateFormat
import java.util.*
import javax.inject.Inject

class OrdersRepositoryImpl @Inject constructor(
    private val api: OrdersApi,
    private val dao: OrderDao
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
            } ?: emptyList(),
            isSynced = true // DTOs from API are always synced
        )
    }
    
    override suspend fun getOrders(): Result<List<Order>> {
        return try {
            val orders = api.getOrders().map { mapDtoToDomain(it) }
            // Save to DB
            try {
                dao.clearOrders()
                orders.forEach { order ->
                    val orderEntity = order.toEntity(isSynced = true)
                    val itemEntities = order.items.map { it.toEntity(0) } // 0 is placeholder, will be updated in dao
                    dao.insertOrderWithItems(orderEntity, itemEntities)
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
            Result.success(orders)
        } catch (e: Exception) {
            e.printStackTrace()
            // Load from DB
            try {
                val localOrders = dao.getOrders().first()
                val domainOrders = localOrders.map { orderWithItems ->
                    val order = orderWithItems.order.toDomain()
                    val items = orderWithItems.items.map { it.toDomain() }
                    order.copy(items = items)
                }
                Result.success(domainOrders)
            } catch (dbEx: Exception) {
                Result.failure(Exception("Failed to load orders: ${e.message}"))
            }
        }
    }
    
    override suspend fun getOrder(id: Int): Result<Order> {
        return try {
            val dto = api.getOrder(id)
            val order = mapDtoToDomain(dto)
            // Save to DB
            try {
                val orderEntity = order.toEntity(isSynced = true)
                val itemEntities = order.items.map { it.toEntity(0) }
                dao.updateOrderWithItems(orderEntity, itemEntities)
            } catch (e: Exception) {
                e.printStackTrace()
            }
            Result.success(order)
        } catch (e: Exception) {
            e.printStackTrace()
            // Load from DB
            try {
                // Try to find by remote ID
                val localOrder = dao.getOrderByRemoteId(id)
                if (localOrder != null) {
                    val order = localOrder.order.toDomain()
                    val items = localOrder.items.map { it.toDomain() }
                    Result.success(order.copy(items = items))
                } else {
                    Result.failure(Exception("Failed to load order: ${e.message}"))
                }
            } catch (dbEx: Exception) {
                Result.failure(Exception("Failed to load order: ${e.message}"))
            }
        }
    }
    
    override suspend fun getOrdersByTable(tableId: Int): Result<List<Order>> {
        return try {
            val orders = api.getOrdersByTable(tableId).map { mapDtoToDomain(it) }
            // Save to DB (Update existing or insert new)
            try {
                orders.forEach { order ->
                    val orderEntity = order.toEntity(isSynced = true)
                    val itemEntities = order.items.map { it.toEntity(0) }
                    dao.updateOrderWithItems(orderEntity, itemEntities)
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
            Result.success(orders)
        } catch (e: Exception) {
            e.printStackTrace()
            // Load from DB
            try {
                val localOrders = dao.getOrdersByTable(tableId).first()
                val domainOrders = localOrders.map { orderWithItems ->
                    val order = orderWithItems.order.toDomain()
                    val items = orderWithItems.items.map { it.toDomain() }
                    order.copy(items = items)
                }
                // Filter for active orders if needed? For now return all
                Result.success(domainOrders)
            } catch (dbEx: Exception) {
                Result.failure(Exception("Failed to load orders for table: ${e.message}"))
            }
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
            val order = mapDtoToDomain(dto)
            
            // Save to DB
            try {
                val orderEntity = order.toEntity(isSynced = true)
                val itemEntities = order.items.map { it.toEntity(0) }
                dao.insertOrderWithItems(orderEntity, itemEntities)
            } catch (e: Exception) {
                e.printStackTrace()
            }
            
            Result.success(order)
        } catch (e: Exception) {
            e.printStackTrace()
            // Create Offline Order
            try {
                val totalAmount = items.sumOf { it.total }
                val orderEntity = OrderEntity(
                    tableId = tableId,
                    orderDate = System.currentTimeMillis(),
                    totalAmount = totalAmount,
                    status = "Pending",
                    paymentStatus = "Unpaid",
                    isSynced = false
                )
                
                val orderId = dao.insertOrder(orderEntity)
                
                val itemEntities = items.map { 
                    OrderItemEntity(
                        orderLocalId = orderId,
                        productId = it.product.id,
                        productName = it.product.name,
                        quantity = it.quantity,
                        price = it.product.price,
                        note = it.note
                    )
                }
                dao.insertOrderItems(itemEntities)
                
                // Construct domain object to return
                val createdOrder = orderEntity.copy(localId = orderId).toDomain().copy(
                    items = itemEntities.map { it.toDomain() }
                )
                
                Result.success(createdOrder)
            } catch (dbEx: Exception) {
                Result.failure(Exception("Failed to create order (Offline): ${dbEx.message}"))
            }
        }
    }
    
    override suspend fun completeOrder(orderId: Int, receivedAmount: Double, paymentMethod: String): Result<Order> {
        return try {
            val request = com.example.restaurantpos.restaurantpo.smartorder.data.remote.dto.CompleteOrderRequest(
                receivedAmount = receivedAmount,
                paymentMethod = paymentMethod
            )
            val dto = api.completeOrder(orderId, request)
            val order = mapDtoToDomain(dto)
            
            // Update DB
            try {
                val orderEntity = order.toEntity(isSynced = true)
                val itemEntities = order.items.map { it.toEntity(0) }
                dao.updateOrderWithItems(orderEntity, itemEntities)
            } catch (e: Exception) {
                e.printStackTrace()
            }
            
            Result.success(order)
        } catch (e: Exception) {
            e.printStackTrace()
            Result.failure(Exception("Failed to complete order: ${e.message}"))
        }
    }
    
    override suspend fun updateItemQuantity(orderId: Int, itemId: Int, quantity: Int): Result<Order> {
        return try {
            val dto = api.updateItemQuantity(orderId, itemId, quantity)
            val order = mapDtoToDomain(dto)
            
            // Update DB
            try {
                val orderEntity = order.toEntity(isSynced = true)
                val itemEntities = order.items.map { it.toEntity(0) }
                dao.updateOrderWithItems(orderEntity, itemEntities)
            } catch (e: Exception) {
                e.printStackTrace()
            }
            
            Result.success(order)
        } catch (e: Exception) {
            e.printStackTrace()
            Result.failure(Exception("Failed to update item quantity: ${e.message}"))
        }
    }
    
    override suspend fun removeItemFromOrder(orderId: Int, itemId: Int): Result<Order> {
        return try {
            val dto = api.removeItemFromOrder(orderId, itemId)
            val order = mapDtoToDomain(dto)
            
            // Update DB
            try {
                val orderEntity = order.toEntity(isSynced = true)
                val itemEntities = order.items.map { it.toEntity(0) }
                dao.updateOrderWithItems(orderEntity, itemEntities)
            } catch (e: Exception) {
                e.printStackTrace()
            }
            
            Result.success(order)
        } catch (e: Exception) {
            e.printStackTrace()
            Result.failure(Exception("Failed to remove item: ${e.message}"))
        }
    }
}
