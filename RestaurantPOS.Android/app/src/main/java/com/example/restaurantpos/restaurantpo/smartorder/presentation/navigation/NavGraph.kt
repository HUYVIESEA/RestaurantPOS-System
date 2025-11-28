package com.example.restaurantpos.restaurantpo.smartorder.presentation.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.compose.material3.Text
import com.example.restaurantpos.restaurantpo.smartorder.presentation.screens.auth.LoginScreen
import androidx.navigation.navArgument
import androidx.navigation.NavType

@Composable
fun NavGraph(
    navController: NavHostController
) {
    NavHost(
        navController = navController,
        startDestination = Screen.Login.route
    ) {
        composable(Screen.Login.route) {
            LoginScreen(
                onLoginSuccess = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                }
            )
        }
        
        composable(Screen.Home.route) {
            com.example.restaurantpos.restaurantpo.smartorder.presentation.screens.home.HomeScreen(
                onNavigateToTables = {
                    navController.navigate(Screen.Tables.route)
                },
                onLogout = {
                    navController.navigate(Screen.Login.route) {
                        popUpTo(Screen.Home.route) { inclusive = true }
                    }
                }
            )
        }

        composable(Screen.Tables.route) {
            com.example.restaurantpos.restaurantpo.smartorder.presentation.screens.tables.TablesScreen(
                onTableClick = { tableId, isAvailable ->
                    // Smart navigation: empty table -> new order, occupied table -> current order
                    if (isAvailable) {
                        navController.navigate(Screen.Order.createRoute(tableId))
                    } else {
                        navController.navigate(Screen.CurrentOrder.createRoute(tableId))
                    }
                },
                onNavigateBack = {
                    navController.popBackStack()
                }
            )
        }
        
        composable(
            route = Screen.Order.route,
            arguments = listOf(
                navArgument("tableId") { type = NavType.IntType },
                navArgument("orderId") { 
                    type = NavType.IntType
                    defaultValue = -1
                }
            )
        ) { backStackEntry ->
            val tableId = backStackEntry.arguments?.getInt("tableId") ?: 0
            val orderIdArg = backStackEntry.arguments?.getInt("orderId") ?: -1
            val orderId = if (orderIdArg == -1) null else orderIdArg
            com.example.restaurantpos.restaurantpo.smartorder.presentation.screens.order.OrderScreen(
                tableId = tableId,
                existingOrderId = orderId,
                onNavigateBack = { navController.popBackStack() }
            )
        }
        
        composable(
            route = Screen.CurrentOrder.route,
            arguments = listOf(navArgument("tableId") { type = NavType.IntType })
        ) { backStackEntry ->
            val tableId = backStackEntry.arguments?.getInt("tableId") ?: 0
            com.example.restaurantpos.restaurantpo.smartorder.presentation.screens.currentorder.CurrentOrderScreen(
                tableId = tableId,
                onNavigateBack = { navController.popBackStack() },
                onAddMoreItems = { tId, orderId ->
                    navController.navigate(Screen.Order.createRoute(tId, orderId))
                }
            )
        }
    }
}
