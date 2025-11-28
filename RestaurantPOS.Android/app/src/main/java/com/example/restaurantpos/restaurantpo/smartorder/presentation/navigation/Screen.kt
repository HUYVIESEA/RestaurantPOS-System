package com.example.restaurantpos.restaurantpo.smartorder.presentation.navigation

sealed class Screen(val route: String) {
    object Login : Screen("login")
    object Home : Screen("home")
    object Tables : Screen("tables")
    object Menu : Screen("menu")
    object Order : Screen("order/{tableId}?orderId={orderId}") {
        fun createRoute(tableId: Int, orderId: Int? = null) = 
            if (orderId != null) "order/$tableId?orderId=$orderId" 
            else "order/$tableId"
    }
    object CurrentOrder : Screen("current_order/{tableId}") {
        fun createRoute(tableId: Int) = "current_order/$tableId"
    }
}
