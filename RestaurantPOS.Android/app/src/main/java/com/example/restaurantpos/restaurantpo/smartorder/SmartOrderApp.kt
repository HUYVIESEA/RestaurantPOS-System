package com.example.restaurantpos.restaurantpo.smartorder

import android.app.Application
import com.example.restaurantpos.restaurantpo.smartorder.data.remote.SignalRService
import dagger.hilt.android.HiltAndroidApp
import javax.inject.Inject

@HiltAndroidApp
class SmartOrderApp : Application() {
    
    @Inject
    lateinit var signalRService: SignalRService
    
    override fun onCreate() {
        super.onCreate()
        
        // Initialize SignalR connection
        // TODO: Get base URL from config or BuildConfig
        val baseUrl = "http://192.168.0.101:5000"
        val clientURL = "http://172.16.13.163:5000"
        val emulatorClientURL = "http://10.0.2.2:5000" // For emulator, use 10.0.2.2 to access localhost
        try {
            signalRService.connect(clientURL)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
    
    override fun onTerminate() {
        super.onTerminate()
        signalRService.disconnect()
    }
}
