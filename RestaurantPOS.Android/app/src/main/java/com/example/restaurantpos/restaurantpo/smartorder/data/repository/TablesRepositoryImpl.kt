package com.example.restaurantpos.restaurantpo.smartorder.data.repository

import com.example.restaurantpos.restaurantpo.smartorder.data.remote.api.TablesApi
import com.example.restaurantpos.restaurantpo.smartorder.data.remote.dto.MergeTablesRequest
import com.example.restaurantpos.restaurantpo.smartorder.domain.model.Table
import com.example.restaurantpos.restaurantpo.smartorder.domain.repository.TablesRepository
import java.text.SimpleDateFormat
import java.util.*
import javax.inject.Inject

class TablesRepositoryImpl @Inject constructor(
    private val api: TablesApi
) : TablesRepository {
    
    private val dateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault())
    
    override suspend fun getTables(): Result<List<Table>> {
        return try {
            val tables = api.getTables().map { dto ->
                Table(
                    id = dto.id,
                    tableNumber = dto.tableNumber,
                    capacity = dto.capacity,
                    isAvailable = dto.isAvailable,
                    occupiedAt = dto.occupiedAt?.let { dateFormat.parse(it) },
                    floor = dto.floor,
                    isMerged = dto.isMerged,
                    mergedGroupId = dto.mergedGroupId,
                    mergedTableNumbers = dto.mergedTableNumbers
                )
            }
            Result.success(tables)
        } catch (e: Exception) {
            e.printStackTrace()
            Result.failure(Exception("Failed to load tables: ${e.message}"))
        }
    }
    
    override suspend fun getTablesByFloor(floor: String): Result<List<Table>> {
        return try {
            val tables = api.getTablesByFloor(floor).map { dto ->
                Table(
                    id = dto.id,
                    tableNumber = dto.tableNumber,
                    capacity = dto.capacity,
                    isAvailable = dto.isAvailable,
                    occupiedAt = dto.occupiedAt?.let { dateFormat.parse(it) },
                    floor = dto.floor,
                    isMerged = dto.isMerged,
                    mergedGroupId = dto.mergedGroupId,
                    mergedTableNumbers = dto.mergedTableNumbers
                )
            }
            Result.success(tables)
        } catch (e: Exception) {
            e.printStackTrace()
            Result.failure(Exception("Failed to load tables: ${e.message}"))
        }
    }
    
    override suspend fun getAvailableTables(): Result<List<Table>> {
        return try {
            val tables = api.getAvailableTables().map { dto ->
                Table(
                    id = dto.id,
                    tableNumber = dto.tableNumber,
                    capacity = dto.capacity,
                    isAvailable = dto.isAvailable,
                    occupiedAt = dto.occupiedAt?.let { dateFormat.parse(it) },
                    floor = dto.floor,
                    isMerged = dto.isMerged,
                    mergedGroupId = dto.mergedGroupId,
                    mergedTableNumbers = dto.mergedTableNumbers
                )
            }
            Result.success(tables)
        } catch (e: Exception) {
            e.printStackTrace()
            Result.failure(Exception("Failed to load available tables: ${e.message}"))
        }
    }
    
    override suspend fun returnTable(tableId: Int): Result<Unit> {
        return try {
            api.returnTable(tableId)
            Result.success(Unit)
        } catch (e: Exception) {
            e.printStackTrace()
            Result.failure(Exception("Failed to return table: ${e.message}"))
        }
    }
    
    override suspend fun mergeTables(tableIds: List<Int>): Result<String> {
        return try {
            val response = api.mergeTables(MergeTablesRequest(tableIds))
            Result.success(response.tableNumbers)
        } catch (e: Exception) {
            e.printStackTrace()
            Result.failure(Exception("Failed to merge tables: ${e.message}"))
        }
    }
    
    override suspend fun splitTables(groupId: Int): Result<Unit> {
        return try {
            api.splitTables(groupId)
            Result.success(Unit)
        } catch (e: Exception) {
            e.printStackTrace()
            Result.failure(Exception("Failed to split tables: ${e.message}"))
        }
    }
}
