package com.example.restaurantpos.restaurantpo.smartorder.domain.repository

import com.example.restaurantpos.restaurantpo.smartorder.domain.model.Product

interface ProductsRepository {
    suspend fun getProducts(): Result<List<Product>>
    suspend fun getProduct(id: Int): Result<Product>
    suspend fun getProductsByCategory(categoryId: Int): Result<List<Product>>
    suspend fun addProduct(product: Product): Result<Product>
    suspend fun updateProduct(product: Product): Result<Unit>
    suspend fun deleteProduct(productId: Int): Result<Unit>
}
