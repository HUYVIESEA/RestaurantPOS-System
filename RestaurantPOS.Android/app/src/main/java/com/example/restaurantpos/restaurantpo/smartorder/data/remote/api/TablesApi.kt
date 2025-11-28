package com.example.restaurantpos.restaurantpo.smartorder.data.remote.api

import com.example.restaurantpos.restaurantpo.smartorder.data.remote.dto.MergeTablesRequest
import com.example.restaurantpos.restaurantpo.smartorder.data.remote.dto.MergeTablesResponse
import com.example.restaurantpos.restaurantpo.smartorder.data.remote.dto.TableDto
import retrofit2.http.*

interface TablesApi {
    @GET("api/Tables")
    suspend fun getTables(): List<TableDto>
    
    @GET("api/Tables/{id}")
    suspend fun getTable(@Path("id") id: Int): TableDto
    
    @GET("api/Tables/Available")
    suspend fun getAvailableTables(): List<TableDto>
    
    @GET("api/Tables/Floor/{floor}")
    suspend fun getTablesByFloor(@Path("floor") floor: String): List<TableDto>
    
    @POST("api/Tables/{id}/Return")
    suspend fun returnTable(@Path("id") id: Int)
    
    @POST("api/Tables/Merge")
    suspend fun mergeTables(@Body request: MergeTablesRequest): MergeTablesResponse
    
    @POST("api/Tables/Split/{groupId}")
    suspend fun splitTables(@Path("groupId") groupId: Int)
    
    @PATCH("api/Tables/{id}/Availability")
    suspend fun updateTableAvailability(@Path("id") id: Int, @Body isAvailable: Boolean)
}
