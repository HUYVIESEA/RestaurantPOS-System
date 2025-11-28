package com.example.restaurantpos.restaurantpo.smartorder.data.remote.dto

import com.google.gson.annotations.SerializedName

data class TableDto(
    @SerializedName("id") val id: Int,
    @SerializedName("tableNumber") val tableNumber: String,
    @SerializedName("capacity") val capacity: Int,
    @SerializedName("isAvailable") val isAvailable: Boolean,
    @SerializedName("occupiedAt") val occupiedAt: String?,
    @SerializedName("floor") val floor: String,
    @SerializedName("isMerged") val isMerged: Boolean,
    @SerializedName("mergedGroupId") val mergedGroupId: Int?,
    @SerializedName("mergedTableNumbers") val mergedTableNumbers: String?
)

data class MergeTablesRequest(
    @SerializedName("tableIds") val tableIds: List<Int>
)

data class MergeTablesResponse(
    @SerializedName("groupId") val groupId: Int,
    @SerializedName("tableNumbers") val tableNumbers: String,
    @SerializedName("totalCapacity") val totalCapacity: Int,
    @SerializedName("tableCount") val tableCount: Int
)
