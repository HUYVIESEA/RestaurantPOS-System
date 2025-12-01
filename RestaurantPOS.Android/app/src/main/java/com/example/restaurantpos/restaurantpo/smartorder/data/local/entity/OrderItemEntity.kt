package com.example.restaurantpos.restaurantpo.smartorder.data.local.entity

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.PrimaryKey
import com.example.restaurantpos.restaurantpo.smartorder.domain.model.OrderItem

@Entity(
    tableName = "order_items",
    foreignKeys = [
        ForeignKey(
            entity = OrderEntity::class,
            parentColumns = ["localId"],
            childColumns = ["orderLocalId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [androidx.room.Index(value = ["orderLocalId"])]
)
data class OrderItemEntity(
    @PrimaryKey(autoGenerate = true)
    val localId: Long = 0,
    val orderLocalId: Long, // Foreign key to OrderEntity.localId
    val remoteId: Int? = null,
    val productId: Int,
    val productName: String,
    val quantity: Int,
    val price: Double,
    val note: String?
) {
    fun toDomain(): OrderItem {
        val domainId = remoteId ?: -localId.toInt()
        return OrderItem(
            id = domainId,
            productId = productId,
            productName = productName,
            quantity = quantity,
            price = price,
            note = note
        )
    }
}

fun OrderItem.toEntity(orderLocalId: Long): OrderItemEntity {
    val rId = if (id > 0) id else null
    return OrderItemEntity(
        orderLocalId = orderLocalId,
        remoteId = rId,
        productId = productId,
        productName = productName,
        quantity = quantity,
        price = price,
        note = note
    )
}
