package com.example.restaurantpos.restaurantpo.smartorder.data.remote

import android.util.Log
import com.example.restaurantpos.restaurantpo.smartorder.data.local.TokenManager
import com.microsoft.signalr.HubConnection
import com.microsoft.signalr.HubConnectionBuilder
import com.microsoft.signalr.HubConnectionState
import io.reactivex.rxjava3.core.Single
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import javax.inject.Inject
import javax.inject.Singleton

sealed class SignalREvent {
    data class OrderCreated(val orderId: Int) : SignalREvent()
    data class OrderUpdated(val orderId: Int) : SignalREvent()
    data class OrderCompleted(val orderId: Int) : SignalREvent()
    data class TableUpdated(val tableId: Int) : SignalREvent()
}

@Singleton
class SignalRService @Inject constructor(
    private val tokenManager: TokenManager
) {
    private var hubConnection: HubConnection? = null
    private val _events = MutableSharedFlow<SignalREvent>(replay = 0)
    val events: SharedFlow<SignalREvent> = _events.asSharedFlow()

    private val TAG = "SignalRService"

    fun connect(baseUrl: String) {
        if (hubConnection?.connectionState == HubConnectionState.CONNECTED) {
            Log.d(TAG, "Already connected")
            return
        }

        val hubUrl = "$baseUrl/restaurantHub"

        hubConnection = HubConnectionBuilder.create(hubUrl)
            .withAccessTokenProvider(
                // SignalR requires RxJava Single<String>
                Single.fromCallable {
                    runBlocking {
                        tokenManager.token.first() ?: ""
                    }
                }
            )
            .build()
            
        // Handle reconnection
        hubConnection?.onClosed { error ->
             Log.e(TAG, "SignalR connection closed", error)
             // Simple Manual Reconnect Strategy
             CoroutineScope(Dispatchers.IO).launch {
                 var retryCount = 0
                 while (retryCount < 5 && hubConnection?.connectionState == HubConnectionState.DISCONNECTED) {
                     try {
                         kotlinx.coroutines.delay(5000) // Wait 5 seconds
                         Log.d(TAG, "Attempting to reconnect (Attempt ${retryCount + 1})...")
                         hubConnection?.start()?.blockingAwait()
                         Log.d(TAG, "Reconnected successfully")
                         return@launch
                     } catch (e: Exception) {
                         Log.e(TAG, "Reconnect failed", e)
                         retryCount++
                     }
                 }
             }
        }

        // Register event handlers
        hubConnection?.on("OrderCreated", { orderId: Int ->
            Log.d(TAG, "OrderCreated: $orderId")
            _events.tryEmit(SignalREvent.OrderCreated(orderId))
        }, Int::class.javaObjectType)

        hubConnection?.on("OrderUpdated", { orderId: Int ->
            Log.d(TAG, "OrderUpdated: $orderId")
            _events.tryEmit(SignalREvent.OrderUpdated(orderId))
        }, Int::class.javaObjectType)

        hubConnection?.on("OrderCompleted", { orderId: Int ->
            Log.d(TAG, "OrderCompleted: $orderId")
            _events.tryEmit(SignalREvent.OrderCompleted(orderId))
        }, Int::class.javaObjectType)

        hubConnection?.on("TableUpdated", { tableId: Int ->
            Log.d(TAG, "TableUpdated: $tableId")
            _events.tryEmit(SignalREvent.TableUpdated(tableId))
        }, Int::class.javaObjectType)

        // Start connection
        try {
            hubConnection?.start()?.blockingAwait()
            Log.d(TAG, "SignalR connected to $hubUrl")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to connect to SignalR: ${e.message}", e)
        }
    }

    fun disconnect() {
        hubConnection?.stop()
        hubConnection = null
        Log.d(TAG, "SignalR disconnected")
    }

    fun isConnected(): Boolean {
        return hubConnection?.connectionState == HubConnectionState.CONNECTED
    }
}
