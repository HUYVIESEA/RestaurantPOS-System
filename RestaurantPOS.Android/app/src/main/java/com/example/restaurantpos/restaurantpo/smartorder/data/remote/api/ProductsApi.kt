package com.example.restaurantpos.restaurantpo.smartorder.data.remote.api

import com.example.restaurantpos.restaurantpo.smartorder.data.remote.dto.ProductDto
import retrofit2.http.GET
import retrofit2.http.Path

interface ProductsApi {
    @GET("api/Products")
    suspend fun getProducts(): List<ProductDto>
    
    @GET("api/Products/{id}")
    suspend fun getProduct(@Path("id") id: Int): ProductDto
    
    @GET("api/Products/Category/{categoryId}")
    suspend fun getProductsByCategory(@Path("categoryId") categoryId: Int): List<ProductDto>
}
