package com.example.restaurantpos.restaurantpo.smartorder.domain.usecase

import com.example.restaurantpos.restaurantpo.smartorder.domain.model.Table
import com.example.restaurantpos.restaurantpo.smartorder.domain.repository.TablesRepository
import javax.inject.Inject

class GetTablesUseCase @Inject constructor(
    private val repository: TablesRepository
) {
    suspend operator fun invoke(): Result<List<Table>> {
        return repository.getTables()
    }
}

class GetTablesByFloorUseCase @Inject constructor(
    private val repository: TablesRepository
) {
    suspend operator fun invoke(floor: String): Result<List<Table>> {
        return repository.getTablesByFloor(floor)
    }
}

class ReturnTableUseCase @Inject constructor(
    private val repository: TablesRepository
) {
    suspend operator fun invoke(tableId: Int): Result<Unit> {
        return repository.returnTable(tableId)
    }
}

class MergeTablesUseCase @Inject constructor(
    private val repository: TablesRepository
) {
    suspend operator fun invoke(tableIds: List<Int>): Result<String> {
        if (tableIds.size < 2) {
            return Result.failure(IllegalArgumentException("Cần ít nhất 2 bàn để ghép"))
        }
        return repository.mergeTables(tableIds)
    }
}

class SplitTablesUseCase @Inject constructor(
    private val repository: TablesRepository
) {
    suspend operator fun invoke(groupId: Int): Result<Unit> {
        return repository.splitTables(groupId)
    }
}
