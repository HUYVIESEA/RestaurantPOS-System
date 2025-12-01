package com.example.restaurantpos.restaurantpo.smartorder.data.repository

import com.example.restaurantpos.restaurantpo.smartorder.data.local.dao.TableDao
import com.example.restaurantpos.restaurantpo.smartorder.data.local.entity.toEntity
import com.example.restaurantpos.restaurantpo.smartorder.data.remote.api.TablesApi
import com.example.restaurantpos.restaurantpo.smartorder.data.remote.dto.MergeTablesRequest
import com.example.restaurantpos.restaurantpo.smartorder.domain.model.Table
import com.example.restaurantpos.restaurantpo.smartorder.domain.repository.TablesRepository
import kotlinx.coroutines.flow.first
import java.text.SimpleDateFormat
import java.util.*
import javax.inject.Inject

class TablesRepositoryImpl @Inject constructor(
    private val api: TablesApi,
    private val dao: TableDao
) : TablesRepository {
    
    private val dateFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault())
    
    override suspend fun getTables(): Result<List<Table>> {
        return try {
            val dtos = api.getTables()
            val tables = dtos.map { dto ->
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
            
            // Save to DB
            try {
                dao.clearTables()
                dao.insertTables(tables.map { it.toEntity() })
            } catch (e: Exception) {
                e.printStackTrace()
            }
            
            Result.success(tables)
        } catch (e: Exception) {
            e.printStackTrace()
            // Try to load from DB
            try {
                val localEntities = dao.getTables().first()
                if (localEntities.isNotEmpty()) {
                    Result.success(localEntities.map { it.toDomain() })
                } else {
                    Result.failure(Exception("Failed to load tables: ${e.message}"))
                }
            } catch (dbEx: Exception) {
                Result.failure(Exception("Failed to load tables: ${e.message}"))
            }
        }
    }
    
    override suspend fun getTablesByFloor(floor: String): Result<List<Table>> {
        return try {
            val dtos = api.getTablesByFloor(floor)
            val tables = dtos.map { dto ->
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
            // Try to load from DB
            try {
                val localEntities = dao.getTablesByFloor(floor).first()
                if (localEntities.isNotEmpty()) {
                    Result.success(localEntities.map { it.toDomain() })
                } else {
                    Result.failure(Exception("Failed to load tables: ${e.message}"))
                }
            } catch (dbEx: Exception) {
                Result.failure(Exception("Failed to load tables: ${e.message}"))
            }
        }
    }
    
    override suspend fun getAvailableTables(): Result<List<Table>> {
        return try {
            val dtos = api.getAvailableTables()
            val tables = dtos.map { dto ->
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
            // Try to load from DB (filter manually)
            try {
                val localEntities = dao.getTables().first()
                val available = localEntities.filter { it.isAvailable }.map { it.toDomain() }
                if (available.isNotEmpty()) {
                    Result.success(available)
                } else {
                    Result.failure(Exception("Failed to load available tables: ${e.message}"))
                }
            } catch (dbEx: Exception) {
                Result.failure(Exception("Failed to load available tables: ${e.message}"))
            }
        }
    }
    
    override suspend fun returnTable(tableId: Int): Result<Unit> {
        return try {
            api.returnTable(tableId)
            // Update local DB optimistically
            try {
                dao.updateTableStatus(tableId, true, null)
            } catch (e: Exception) {
                e.printStackTrace()
            }
            Result.success(Unit)
        } catch (e: Exception) {
            e.printStackTrace()
            Result.failure(Exception("Failed to return table: ${e.message}"))
        }
    }
    
    override suspend fun mergeTables(tableIds: List<Int>): Result<String> {
        return try {
            val response = api.mergeTables(MergeTablesRequest(tableIds))
            // We should probably reload tables from API to get the correct merged state
            // But for now we just return success
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
