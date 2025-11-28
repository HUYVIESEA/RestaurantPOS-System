package com.example.restaurantpos.restaurantpo.smartorder.domain.usecase

import com.example.restaurantpos.restaurantpo.smartorder.domain.model.Product
import com.example.restaurantpos.restaurantpo.smartorder.domain.repository.ProductsRepository
import javax.inject.Inject

class GetProductsUseCase @Inject constructor(
    private val repository: ProductsRepository
) {
    suspend operator fun invoke(): Result<List<Product>> {
        return repository.getProducts()
    }
}

class GetProductsByCategoryUseCase @Inject constructor(
    private val repository: ProductsRepository
) {
    suspend operator fun invoke(categoryId: Int): Result<List<Product>> {
        return repository.getProductsByCategory(categoryId)
    }
}
