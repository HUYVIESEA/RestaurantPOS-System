package com.example.restaurantpos.restaurantpo.smartorder.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.example.restaurantpos.restaurantpo.smartorder.data.local.entity.TableEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface TableDao {
    @Query("SELECT * FROM tables")
    fun getTables(): Flow<List<TableEntity>>

    @Query("SELECT * FROM tables WHERE floor = :floor")
    fun getTablesByFloor(floor: String): Flow<List<TableEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertTables(tables: List<TableEntity>)

    @Query("UPDATE tables SET isAvailable = :isAvailable, occupiedAt = :occupiedAt WHERE id = :tableId")
    suspend fun updateTableStatus(tableId: Int, isAvailable: Boolean, occupiedAt: Long?)

    @Query("DELETE FROM tables")
    suspend fun clearTables()
}
