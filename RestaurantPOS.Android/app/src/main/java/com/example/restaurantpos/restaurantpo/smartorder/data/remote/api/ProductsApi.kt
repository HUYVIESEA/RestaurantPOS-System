package com.example.restaurantpos.restaurantpo.smartorder.data.remote.api

import com.example.restaurantpos.restaurantpo.smartorder.data.remote.dto.ProductDto
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path

interface ProductsApi {
    @GET("api/Products")
    suspend fun getProducts(): List<ProductDto>
    
    @GET("api/Products/{id}")
    suspend fun getProduct(@Path("id") id: Int): ProductDto
    
    @GET("api/Products/Category/{categoryId}")
    suspend fun getProductsByCategory(@Path("categoryId") categoryId: Int): List<ProductDto>

    @POST("api/Products")
    suspend fun createProduct(@Body product: ProductDto): ProductDto

    @PUT("api/Products/{id}")
    suspend fun updateProduct(@Path("id") id: Int, @Body product: ProductDto)

    @DELETE("api/Products/{id}")
    suspend fun deleteProduct(@Path("id") id: Int)
}
