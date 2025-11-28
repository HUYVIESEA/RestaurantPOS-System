package com.example.restaurantpos.restaurantpo.smartorder.domain.usecase

import com.example.restaurantpos.restaurantpo.smartorder.domain.model.CartItem
import com.example.restaurantpos.restaurantpo.smartorder.domain.model.Order
import com.example.restaurantpos.restaurantpo.smartorder.domain.repository.OrdersRepository
import javax.inject.Inject

class CreateOrderUseCase @Inject constructor(
    private val repository: OrdersRepository
) {
    suspend operator fun invoke(tableId: Int, items: List<CartItem>): Result<Order> {
        if (items.isEmpty()) {
            return Result.failure(IllegalArgumentException("Giỏ hàng trống"))
        }
        return repository.createOrder(tableId, items)
    }
}
