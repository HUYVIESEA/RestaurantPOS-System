package com.example.restaurantpos.restaurantpo.smartorder.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.example.restaurantpos.restaurantpo.smartorder.domain.model.Product

@Entity(tableName = "products")
data class ProductEntity(
    @PrimaryKey
    val id: Int,
    val name: String,
    val description: String?,
    val price: Double,
    val categoryId: Int,
    val categoryName: String?,
    val imageUrl: String?,
    val stockQuantity: Int,
    val isAvailable: Boolean
) {
    fun toDomain(): Product {
        return Product(
            id = id,
            name = name,
            description = description,
            price = price,
            categoryId = categoryId,
            categoryName = categoryName,
            imageUrl = imageUrl,
            stockQuantity = stockQuantity,
            isAvailable = isAvailable
        )
    }
}

fun Product.toEntity(): ProductEntity {
    return ProductEntity(
        id = id,
        name = name,
        description = description,
        price = price,
        categoryId = categoryId,
        categoryName = categoryName,
        imageUrl = imageUrl,
        stockQuantity = stockQuantity,
        isAvailable = isAvailable
    )
}
