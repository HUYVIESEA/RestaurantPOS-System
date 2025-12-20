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
    lateinit var settingsManager: com.example.restaurantpos.restaurantpo.smartorder.data.local.SettingsManager

    @Inject
    lateinit var workerFactory: androidx.hilt.work.HiltWorkerFactory
    
    override val workManagerConfiguration: Configuration
        get() = Configuration.Builder()
            .setWorkerFactory(workerFactory)
            .build()
    
    override fun onCreate() {
        super.onCreate()
        
        // Initialize SignalR connection with dynamic URL
        val baseUrl = settingsManager.getBaseUrl()
        try {
             // Ensure URL does not end with slash for SignalRService (it appends /restaurantHub)
             // Actually currently SignalRService appends. 
             // baseUrl from SettingsManager might or might not have slash.
             // Clean it up.
             val cleanUrl = baseUrl.removeSuffix("/")
            signalRService.connect(cleanUrl)
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
