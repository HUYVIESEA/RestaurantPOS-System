package com.example.restaurantpos.restaurantpo.smartorder.data.repository

import com.example.restaurantpos.restaurantpo.smartorder.domain.repository.NotificationRepository
import com.google.firebase.messaging.FirebaseMessaging
import kotlinx.coroutines.tasks.await
import javax.inject.Inject

class NotificationRepositoryImpl @Inject constructor() : NotificationRepository {
    
    override suspend fun subscribeToTopic(topic: String) {
        try {
            FirebaseMessaging.getInstance().subscribeToTopic(topic).await()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    override suspend fun unsubscribeFromTopic(topic: String) {
        try {
            FirebaseMessaging.getInstance().unsubscribeFromTopic(topic).await()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
