package com.example.restaurantpos.restaurantpo.smartorder.domain.repository

interface NotificationRepository {
    suspend fun subscribeToTopic(topic: String)
    suspend fun unsubscribeFromTopic(topic: String)
}
