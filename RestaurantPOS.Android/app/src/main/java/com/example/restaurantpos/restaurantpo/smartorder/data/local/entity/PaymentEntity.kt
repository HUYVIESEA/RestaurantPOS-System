package com.example.restaurantpos.restaurantpo.smartorder.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "payments")
data class PaymentEntity(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val orderId: Int,
    val amount: Double,
    val paymentMethod: String, // "Cash" or "Transfer"
    val timestamp: Long,
    val note: String? = null,
    val isSynced: Boolean = false // To track if we sent this to server (conceptually)
)
