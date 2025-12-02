package com.example.restaurantpos.restaurantpo.smartorder

import android.app.Application
import androidx.work.Configuration
import androidx.work.Constraints
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import com.example.restaurantpos.restaurantpo.smartorder.worker.SyncOrdersWorker
import com.example.restaurantpos.restaurantpo.smartorder.data.remote.SignalRService
import dagger.hilt.android.HiltAndroidApp
import java.util.concurrent.TimeUnit
import javax.inject.Inject

@HiltAndroidApp
class SmartOrderApp : Application(), Configuration.Provider {
    
    @Inject
    lateinit var signalRService: SignalRService

    @Inject
    lateinit var workerFactory: androidx.hilt.work.HiltWorkerFactory
    
    override val workManagerConfiguration: Configuration
        get() = Configuration.Builder()
            .setWorkerFactory(workerFactory)
            .build()
    
    override fun onCreate() {
        super.onCreate()
        
        // Initialize SignalR connection
        // TODO: Get base URL from config or BuildConfig
        // Alternative URLs for testing:
        // - Production: http://192.168.0.101:5000
        // - Client: http://172.16.13.163:5000
        // - Emulator: http://10.0.2.2:5000
        val clientURL = "http://192.168.0.101:5000"
        try {
            signalRService.connect(clientURL)
        } catch (e: Exception) {
            e.printStackTrace()
        }

        setupSyncWorker()
    }

    private fun setupSyncWorker() {
        val constraints = Constraints.Builder()
            .setRequiredNetworkType(NetworkType.CONNECTED)
            .build()

        val syncRequest = PeriodicWorkRequestBuilder<SyncOrdersWorker>(15, TimeUnit.MINUTES)
            .setConstraints(constraints)
            .build()

        WorkManager.getInstance(this).enqueueUniquePeriodicWork(
            "SyncOrdersWork",
            androidx.work.ExistingPeriodicWorkPolicy.KEEP,
            syncRequest
        )
    }
    
    override fun onTerminate() {
        super.onTerminate()
        signalRService.disconnect()
    }
}
