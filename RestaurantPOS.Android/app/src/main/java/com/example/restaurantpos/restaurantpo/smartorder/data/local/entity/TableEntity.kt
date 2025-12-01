package com.example.restaurantpos.restaurantpo.smartorder.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.example.restaurantpos.restaurantpo.smartorder.domain.model.Table
import java.util.Date

@Entity(tableName = "tables")
data class TableEntity(
    @PrimaryKey
    val id: Int,
    val tableNumber: String,
    val capacity: Int,
    val isAvailable: Boolean,
    val occupiedAt: Long?, // Store Date as timestamp
    val floor: String,
    val isMerged: Boolean,
    val mergedGroupId: Int?,
    val mergedTableNumbers: String?
) {
    fun toDomain(): Table {
        return Table(
            id = id,
            tableNumber = tableNumber,
            capacity = capacity,
            isAvailable = isAvailable,
            occupiedAt = occupiedAt?.let { Date(it) },
            floor = floor,
            isMerged = isMerged,
            mergedGroupId = mergedGroupId,
            mergedTableNumbers = mergedTableNumbers
        )
    }
}

fun Table.toEntity(): TableEntity {
    return TableEntity(
        id = id,
        tableNumber = tableNumber,
        capacity = capacity,
        isAvailable = isAvailable,
        occupiedAt = occupiedAt?.time,
        floor = floor,
        isMerged = isMerged,
        mergedGroupId = mergedGroupId,
        mergedTableNumbers = mergedTableNumbers
    )
}
