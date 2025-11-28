package com.example.restaurantpos.restaurantpo.smartorder.domain.repository

import com.example.restaurantpos.restaurantpo.smartorder.domain.model.Table
import kotlinx.coroutines.flow.Flow

interface TablesRepository {
    suspend fun getTables(): Result<List<Table>>
    suspend fun getTablesByFloor(floor: String): Result<List<Table>>
    suspend fun getAvailableTables(): Result<List<Table>>
    suspend fun returnTable(tableId: Int): Result<Unit>
    suspend fun mergeTables(tableIds: List<Int>): Result<String>
    suspend fun splitTables(groupId: Int): Result<Unit>
}
