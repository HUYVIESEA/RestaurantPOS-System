package com.example.restaurantpos.restaurantpo.smartorder.data.repository

import com.example.restaurantpos.restaurantpo.smartorder.data.local.dao.ProductDao
import com.example.restaurantpos.restaurantpo.smartorder.data.local.entity.toEntity
import com.example.restaurantpos.restaurantpo.smartorder.data.remote.api.ProductsApi
import com.example.restaurantpos.restaurantpo.smartorder.domain.model.Product
import com.example.restaurantpos.restaurantpo.smartorder.domain.repository.ProductsRepository
import kotlinx.coroutines.flow.first
import javax.inject.Inject

class ProductsRepositoryImpl @Inject constructor(
    private val api: ProductsApi,
    private val dao: ProductDao
) : ProductsRepository {
    
    override suspend fun getProducts(): Result<List<Product>> {
        return try {
            // Try to fetch from API
            val dtos = api.getProducts()
            val products = dtos.map { dto ->
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
            
            // Save to DB
            try {
                dao.clearProducts()
                dao.insertProducts(products.map { it.toEntity() })
            } catch (e: Exception) {
                e.printStackTrace() // Log DB error but don't fail the request
            }
            
            Result.success(products)
        } catch (e: Exception) {
            e.printStackTrace()
            // If API fails, try to load from DB
            try {
                val localEntities = dao.getProducts().first()
                if (localEntities.isNotEmpty()) {
                    val localProducts = localEntities.map { it.toDomain() }
                    Result.success(localProducts)
                } else {
                    Result.failure(Exception("Failed to load products (Offline & Empty Cache): ${e.message}"))
                }
            } catch (dbEx: Exception) {
                Result.failure(Exception("Failed to load products: ${e.message}"))
            }
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
            // Try to find in local DB
            try {
                val localEntities = dao.getProducts().first()
                val found = localEntities.find { it.id == id }
                if (found != null) {
                    Result.success(found.toDomain())
                } else {
                    Result.failure(Exception("Failed to load product: ${e.message}"))
                }
            } catch (dbEx: Exception) {
                Result.failure(Exception("Failed to load product: ${e.message}"))
            }
        }
    }
    
    override suspend fun getProductsByCategory(categoryId: Int): Result<List<Product>> {
        return try {
            val dtos = api.getProductsByCategory(categoryId)
            val products = dtos.map { dto ->
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
            // Try to load from DB
            try {
                val localEntities = dao.getProductsByCategory(categoryId).first()
                if (localEntities.isNotEmpty()) {
                    Result.success(localEntities.map { it.toDomain() })
                } else {
                    // Fallback: maybe we have all products but not filtered by query in DAO?
                    // Actually we have getProductsByCategory in DAO.
                    Result.failure(Exception("Failed to load products by category: ${e.message}"))
                }
            } catch (dbEx: Exception) {
                Result.failure(Exception("Failed to load products by category: ${e.message}"))
            }
        }
    }

    override suspend fun addProduct(product: Product): Result<Product> {
        return try {
            val dto = com.example.restaurantpos.restaurantpo.smartorder.data.remote.dto.ProductDto(
                id = 0,
                name = product.name,
                description = product.description,
                price = product.price,
                categoryId = product.categoryId,
                categoryName = product.categoryName,
                imageUrl = product.imageUrl,
                isAvailable = product.isAvailable
            )
            val responseDto = api.createProduct(dto)
            val newProduct = Product(
                id = responseDto.id,
                name = responseDto.name,
                description = responseDto.description,
                price = responseDto.price,
                categoryId = responseDto.categoryId,
                categoryName = responseDto.categoryName,
                imageUrl = responseDto.imageUrl,
                isAvailable = responseDto.isAvailable
            )
            dao.insertProduct(newProduct.toEntity())
            Result.success(newProduct)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun updateProduct(product: Product): Result<Unit> {
        return try {
            val dto = com.example.restaurantpos.restaurantpo.smartorder.data.remote.dto.ProductDto(
                id = product.id,
                name = product.name,
                description = product.description,
                price = product.price,
                categoryId = product.categoryId,
                categoryName = product.categoryName,
                imageUrl = product.imageUrl,
                isAvailable = product.isAvailable
            )
            api.updateProduct(product.id, dto)
            dao.insertProduct(product.toEntity())
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    override suspend fun deleteProduct(productId: Int): Result<Unit> {
        return try {
            api.deleteProduct(productId)
            dao.deleteProductById(productId)
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
