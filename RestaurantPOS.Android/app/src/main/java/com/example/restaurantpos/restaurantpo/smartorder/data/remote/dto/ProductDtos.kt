package com.example.restaurantpos.restaurantpo.smartorder.data.remote.dto

import com.google.gson.annotations.SerializedName

data class ProductDto(
    @SerializedName("id") val id: Int,
    @SerializedName("name") val name: String,
    @SerializedName("description") val description: String?,
    @SerializedName("price") val price: Double,
    @SerializedName("categoryId") val categoryId: Int,
    @SerializedName("categoryName") val categoryName: String?,
    @SerializedName("imageUrl") val imageUrl: String?,
    @SerializedName("isAvailable") val isAvailable: Boolean
)
