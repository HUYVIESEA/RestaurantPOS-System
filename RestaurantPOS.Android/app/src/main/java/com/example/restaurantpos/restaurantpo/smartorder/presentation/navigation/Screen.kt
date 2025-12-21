package com.example.restaurantpos.restaurantpo.smartorder.presentation.navigation

sealed class Screen(val route: String) {
    object Login : Screen("login")
    object Home : Screen("home")
    object Tables : Screen("tables")
    object Order : Screen("order/{tableId}?orderId={orderId}") {
        fun createRoute(tableId: Int, orderId: Int? = null) = 
            if (orderId != null) "order/$tableId?orderId=$orderId" 
            else "order/$tableId"
    }
    object CurrentOrder : Screen("current_order/{tableId}?orderId={orderId}") {
        fun createRoute(tableId: Int, orderId: Int? = null) = 
            if (orderId != null) "current_order/$tableId?orderId=$orderId" 
            else "current_order/$tableId"
    }
    object OrderHistory : Screen("order_history")
    object Settings : Screen("settings/{userRole}") {
        fun createRoute(userRole: String) = "settings/$userRole"
    }
    object Menu : Screen("menu")
    object Kitchen : Screen("kitchen")
    object UserManagement : Screen("user_management")
    object Reports : Screen("reports")
    object ScanQr : Screen("scan_qr")
}
