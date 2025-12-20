package com.example.restaurantpos.restaurantpo.smartorder.data.remote.api

import com.example.restaurantpos.restaurantpo.smartorder.data.remote.dto.CompleteOrderRequest
import com.example.restaurantpos.restaurantpo.smartorder.data.remote.dto.CreateOrderRequest
import com.example.restaurantpos.restaurantpo.smartorder.data.remote.dto.OrderDto
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path

interface OrdersApi {
    @GET("api/Orders")
    suspend fun getOrders(): List<OrderDto>
    
    @GET("api/Orders/{id}")
    suspend fun getOrder(@Path("id") id: Int): OrderDto
    
    @GET("api/Orders/Table/{tableId}")
    suspend fun getOrdersByTable(@Path("tableId") tableId: Int): List<OrderDto>
    
    @POST("api/Orders")
    suspend fun createOrder(@Body request: CreateOrderRequest): OrderDto
    
    @PUT("api/Orders/{id}/Complete")
    suspend fun completeOrder(
        @Path("id") id: Int,
        @Body request: CompleteOrderRequest
    ): OrderDto
    
    @PATCH("api/Orders/{orderId}/Items/{itemId}")
    suspend fun updateItemQuantity(
        @Path("orderId") orderId: Int,
        @Path("itemId") itemId: Int,
        @Body quantity: Int
    ): OrderDto
    
    @DELETE("api/Orders/{orderId}/Items/{itemId}")
    suspend fun removeItemFromOrder(
        @Path("orderId") orderId: Int,
        @Path("itemId") itemId: Int
    ): OrderDto

    @PUT("api/Orders/{id}/Status")
    suspend fun updateOrderStatus(
        @Path("id") id: Int,
        @Body request: com.example.restaurantpos.restaurantpo.smartorder.data.remote.dto.UpdateOrderStatusRequest
    ): OrderDto
}
