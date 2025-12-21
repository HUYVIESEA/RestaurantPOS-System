package com.example.restaurantpos.restaurantpo.smartorder.data.local

import android.content.Context
import android.content.SharedPreferences
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SettingsManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val prefs: SharedPreferences = context.getSharedPreferences("app_settings", Context.MODE_PRIVATE)

    companion object {
        private const val KEY_BASE_URL = "base_url"
        private const val DEFAULT_BASE_URL = "http://192.168.0.101:5000" // Default fallback
        private const val KEY_PRINTER_IP = "printer_ip"
        private const val KEY_PRINTER_PORT = "printer_port"
    }

    fun getBaseUrl(): String {
        return prefs.getString(KEY_BASE_URL, DEFAULT_BASE_URL) ?: DEFAULT_BASE_URL
    }

    fun saveBaseUrl(url: String) {
        prefs.edit().putString(KEY_BASE_URL, url).apply()
    }

    fun getPrinterIp(): String? {
        return prefs.getString(KEY_PRINTER_IP, null)
    }

    fun getPrinterPort(): Int? {
        val port = prefs.getInt(KEY_PRINTER_PORT, -1)
        return if (port != -1) port else null
    }

    fun savePrinterSettings(ip: String, port: Int) {
        prefs.edit()
            .putString(KEY_PRINTER_IP, ip)
            .putInt(KEY_PRINTER_PORT, port)
            .apply()
    }
}
