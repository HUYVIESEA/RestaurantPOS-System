package com.example.restaurantpos.restaurantpo.smartorder.domain.model

import java.util.Date

data class Table(
    val id: Int,
    val tableNumber: String,
    val capacity: Int,
    val isAvailable: Boolean,
    val occupiedAt: Date?,
    val floor: String,
    val isMerged: Boolean,
    val mergedGroupId: Int?,
    val mergedTableNumbers: String?
)
