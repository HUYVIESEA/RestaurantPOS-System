package com.example.restaurantpos.restaurantpo.smartorder.domain.repository

import com.example.restaurantpos.restaurantpo.smartorder.domain.model.Product

interface ProductsRepository {
    suspend fun getProducts(): Result<List<Product>>
    suspend fun getProduct(id: Int): Result<Product>
    suspend fun getProductsByCategory(categoryId: Int): Result<List<Product>>
}
