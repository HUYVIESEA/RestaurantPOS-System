package com.example.restaurantpos.restaurantpo.smartorder.data.remote.discovery

import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.withContext
import java.net.DatagramPacket
import java.net.DatagramSocket
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ServerDiscovery @Inject constructor() {

    private val _serverUrl = MutableStateFlow<String?>(null)
    val serverUrl: StateFlow<String?> = _serverUrl

    private var socket: DatagramSocket? = null
    private var isListening = false
    
    suspend fun startListening() {
        if (isListening) return
        isListening = true
        
        withContext(Dispatchers.IO) {
            try {
                // Listen on port 48888
                socket = DatagramSocket(48888)
                socket?.broadcast = true
                Log.d("ServerDiscovery", "Started listening on port 48888")

                val buffer = ByteArray(1024)
                
                while (isListening) {
                    try {
                        val packet = DatagramPacket(buffer, buffer.size)
                        socket?.receive(packet)
                        
                        val message = String(packet.data, 0, packet.length)
                        Log.d("ServerDiscovery", "Received: $message")
                        
                        if (message.startsWith("RESTAURANT_POS_SERVER|")) {
                            val url = message.substringAfter("|")
                            if (url.isNotEmpty() && url != _serverUrl.value) {
                                _serverUrl.emit(url)
                                Log.i("ServerDiscovery", "Discovered Server URL: $url")
                            }
                        }
                    } catch (e: Exception) {
                        if (isListening) {
                            Log.e("ServerDiscovery", "Error receiving packet: ${e.message}")
                        }
                    }
                }
            } catch (e: Exception) {
                Log.e("ServerDiscovery", "Failed to start listener: ${e.message}")
            } finally {
                stopListening()
            }
        }
    }

    fun stopListening() {
        isListening = false
        socket?.close()
        socket = null
    }
}
