package com.example.restaurantpos.restaurantpo.smartorder.domain.usecase

import com.example.restaurantpos.restaurantpo.smartorder.domain.model.Order
import com.example.restaurantpos.restaurantpo.smartorder.domain.repository.OrdersRepository
import javax.inject.Inject

class GetOrdersByTableUseCase @Inject constructor(
    private val repository: OrdersRepository
) {
    suspend operator fun invoke(tableId: Int): Result<List<Order>> {
        return repository.getOrdersByTable(tableId)
    }
}
