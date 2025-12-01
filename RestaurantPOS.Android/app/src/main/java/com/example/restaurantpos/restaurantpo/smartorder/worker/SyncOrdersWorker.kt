package com.example.restaurantpos.restaurantpo.smartorder.worker

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.example.restaurantpos.restaurantpo.smartorder.data.local.dao.OrderDao
import com.example.restaurantpos.restaurantpo.smartorder.data.remote.api.OrdersApi
import com.example.restaurantpos.restaurantpo.smartorder.data.remote.dto.CreateOrderItemRequest
import com.example.restaurantpos.restaurantpo.smartorder.data.remote.dto.CreateOrderRequest
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject
import kotlinx.coroutines.flow.first

@HiltWorker
class SyncOrdersWorker @AssistedInject constructor(
    @Assisted appContext: Context,
    @Assisted workerParams: WorkerParameters,
    private val orderDao: OrderDao,
    private val ordersApi: OrdersApi
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result {
        return try {
            // 1. Get unsynced orders
            // We need a query for this. For now, let's filter in memory or add a query to DAO
            // Since DAO returns Flow, we take first()
            val allOrders = orderDao.getOrders().first()
            val unsyncedOrders = allOrders.filter { !it.order.isSynced }

            if (unsyncedOrders.isEmpty()) {
                return Result.success()
            }

            // 2. Sync each order
            unsyncedOrders.forEach { orderWithItems ->
                val order = orderWithItems.order
                val items = orderWithItems.items

                try {
                    val request = CreateOrderRequest(
                        tableId = order.tableId,
                        items = items.map {
                            CreateOrderItemRequest(
                                productId = it.productId,
                                quantity = it.quantity,
                                note = it.note
                            )
                        }
                    )

                    // Call API
                    val response = ordersApi.createOrder(request)

                    // 3. Update local order with remote ID and set synced = true
                    // We should probably delete the local order and insert the new one from server
                    // OR update the existing one.
                    // Updating is safer to keep local history consistent if we use localId elsewhere.
                    // But our OrderEntity has remoteId.
                    
                    val updatedOrder = order.copy(
                        remoteId = response.id,
                        status = response.status ?: order.status,
                        isSynced = true
                    )
                    
                    // Update items if needed (e.g. if server assigns IDs to items)
                    // For now just update order status
                    orderDao.insertOrder(updatedOrder)
                    
                } catch (e: Exception) {
                    e.printStackTrace()
                    // If one fails, we can continue or return retry. 
                    // Let's return retry to try again later.
                    return Result.retry()
                }
            }

            Result.success()
        } catch (e: Exception) {
            e.printStackTrace()
            Result.failure()
        }
    }
}
