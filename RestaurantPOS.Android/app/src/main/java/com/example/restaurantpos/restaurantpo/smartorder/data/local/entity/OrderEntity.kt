package com.example.restaurantpos.restaurantpo.smartorder.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.example.restaurantpos.restaurantpo.smartorder.domain.model.Order
import java.util.Date

@Entity(tableName = "orders")
data class OrderEntity(
    @PrimaryKey(autoGenerate = true)
    val localId: Long = 0,
    val remoteId: Int? = null,
    val tableId: Int,
    val orderDate: Long,
    val totalAmount: Double,
    val status: String,
    val paymentStatus: String,
    val isSynced: Boolean = true
) {
    fun toDomain(): Order {
        // If remoteId is present, use it. Otherwise use negative localId to indicate local-only
        val domainId = remoteId ?: -localId.toInt()
        return Order(
            id = domainId,
            tableId = tableId,
            orderDate = Date(orderDate),
            totalAmount = totalAmount,
            status = status,
            paymentStatus = paymentStatus,
            items = emptyList(), // Items will be populated separately
            isSynced = isSynced
        )
    }
}

fun Order.toEntity(isSynced: Boolean = true): OrderEntity {
    // If id is negative, it's a local ID
    val rId = if (id > 0) id else null
    // We don't set localId here, let Room handle it for new inserts if it's 0
    // But if we are updating an existing local order, we might need to handle it.
    // For simplicity, when saving from API, we assume it's a new insert or update based on remoteId query
    return OrderEntity(
        remoteId = rId,
        tableId = tableId,
        orderDate = orderDate.time,
        totalAmount = totalAmount,
        status = status,
        paymentStatus = paymentStatus,
        isSynced = isSynced
    )
}
