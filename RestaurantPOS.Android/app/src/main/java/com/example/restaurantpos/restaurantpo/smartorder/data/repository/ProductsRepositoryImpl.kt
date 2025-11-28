package com.example.restaurantpos.restaurantpo.smartorder.data.repository

import com.example.restaurantpos.restaurantpo.smartorder.data.remote.api.ProductsApi
import com.example.restaurantpos.restaurantpo.smartorder.domain.model.Product
import com.example.restaurantpos.restaurantpo.smartorder.domain.repository.ProductsRepository
import javax.inject.Inject

class ProductsRepositoryImpl @Inject constructor(
    private val api: ProductsApi
) : ProductsRepository {
    
    override suspend fun getProducts(): Result<List<Product>> {
        return try {
            val products = api.getProducts().map { dto ->
                Product(
                    id = dto.id,
                    name = dto.name,
                    description = dto.description,
                    price = dto.price,
                    categoryId = dto.categoryId,
                    categoryName = dto.categoryName,
                    imageUrl = dto.imageUrl,
                    isAvailable = dto.isAvailable
                )
            }
            Result.success(products)
        } catch (e: Exception) {
            e.printStackTrace()
            Result.failure(Exception("Failed to load products: ${e.message}"))
        }
    }
    
    override suspend fun getProduct(id: Int): Result<Product> {
        return try {
            val dto = api.getProduct(id)
            val product = Product(
                id = dto.id,
                name = dto.name,
                description = dto.description,
                price = dto.price,
                categoryId = dto.categoryId,
                categoryName = dto.categoryName,
                imageUrl = dto.imageUrl,
                isAvailable = dto.isAvailable
            )
            Result.success(product)
        } catch (e: Exception) {
            e.printStackTrace()
            Result.failure(Exception("Failed to load product: ${e.message}"))
        }
    }
    
    override suspend fun getProductsByCategory(categoryId: Int): Result<List<Product>> {
        return try {
            val products = api.getProductsByCategory(categoryId).map { dto ->
                Product(
                    id = dto.id,
                    name = dto.name,
                    description = dto.description,
                    price = dto.price,
                    categoryId = dto.categoryId,
                    categoryName = dto.categoryName,
                    imageUrl = dto.imageUrl,
                    isAvailable = dto.isAvailable
                )
            }
            Result.success(products)
        } catch (e: Exception) {
            e.printStackTrace()
            Result.failure(Exception("Failed to load products by category: ${e.message}"))
        }
    }
}
