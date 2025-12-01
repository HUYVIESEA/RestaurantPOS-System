package com.example.restaurantpos.restaurantpo.smartorder.data.local.dao

import androidx.room.*
import com.example.restaurantpos.restaurantpo.smartorder.data.local.entity.OrderEntity
import com.example.restaurantpos.restaurantpo.smartorder.data.local.entity.OrderItemEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface OrderDao {
    @Transaction
    @Query("SELECT * FROM orders ORDER BY orderDate DESC")
    fun getOrders(): Flow<List<OrderWithItems>>

    @Transaction
    @Query("SELECT * FROM orders WHERE tableId = :tableId ORDER BY orderDate DESC")
    fun getOrdersByTable(tableId: Int): Flow<List<OrderWithItems>>

    @Transaction
    @Query("SELECT * FROM orders WHERE localId = :localId")
    suspend fun getOrderById(localId: Long): OrderWithItems?

    @Transaction
    @Query("SELECT * FROM orders WHERE remoteId = :remoteId")
    suspend fun getOrderByRemoteId(remoteId: Int): OrderWithItems?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrder(order: OrderEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertOrderItems(items: List<OrderItemEntity>)

    @Query("DELETE FROM order_items WHERE orderLocalId = :orderLocalId")
    suspend fun deleteOrderItems(orderLocalId: Long)

    @Transaction
    suspend fun insertOrderWithItems(order: OrderEntity, items: List<OrderItemEntity>) {
        val orderId = insertOrder(order)
        val itemsWithOrderId = items.map { it.copy(orderLocalId = orderId) }
        insertOrderItems(itemsWithOrderId)
    }
    
    // Update existing order (e.g. from API sync)
    @Transaction
    suspend fun updateOrderWithItems(order: OrderEntity, items: List<OrderItemEntity>) {
        // Find existing order by remoteId if possible to get localId
        val existingLocalId = if (order.remoteId != null) {
             getOrderByRemoteId(order.remoteId)?.order?.localId
        } else {
            null
        }

        val orderToInsert = if (existingLocalId != null) {
            order.copy(localId = existingLocalId)
        } else {
            order
        }

        val orderId = insertOrder(orderToInsert)
        deleteOrderItems(orderId)
        val itemsWithOrderId = items.map { it.copy(orderLocalId = orderId) }
        insertOrderItems(itemsWithOrderId)
    }

    @Query("DELETE FROM orders")
    suspend fun clearOrders()
}

data class OrderWithItems(
    @Embedded val order: OrderEntity,
    @Relation(
        parentColumn = "localId",
        entityColumn = "orderLocalId"
    )
    val items: List<OrderItemEntity>
)
