package com.example.restaurantpos.restaurantpo.smartorder.presentation.navigation

import androidx.compose.animation.AnimatedContentTransitionScope
import androidx.compose.animation.core.tween
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
        startDestination = Screen.Login.route,
        enterTransition = {
            slideIntoContainer(AnimatedContentTransitionScope.SlideDirection.Left, animationSpec = tween(300))
        },
        exitTransition = {
            slideOutOfContainer(AnimatedContentTransitionScope.SlideDirection.Left, animationSpec = tween(300))
        },
        popEnterTransition = {
            slideIntoContainer(AnimatedContentTransitionScope.SlideDirection.Right, animationSpec = tween(300))
        },
        popExitTransition = {
            slideOutOfContainer(AnimatedContentTransitionScope.SlideDirection.Right, animationSpec = tween(300))
        }
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
                onNavigateToKitchen = {
                    navController.navigate(Screen.Kitchen.route)
                },
                onNavigateToOrderHistory = {
                    navController.navigate(Screen.OrderHistory.route)
                },
                onNavigateToMenu = {
                    navController.navigate(Screen.Menu.route)
                },
                onNavigateToSettings = {
                    navController.navigate(Screen.Settings.route)
                },
                onNavigateToUserManagement = {
                    navController.navigate(Screen.UserManagement.route)
                },
                onNavigateToReports = {
                    navController.navigate(Screen.Reports.route)
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

        composable(Screen.OrderHistory.route) {
            com.example.restaurantpos.restaurantpo.smartorder.presentation.screens.orderhistory.OrderHistoryScreen(
                onNavigateBack = { navController.popBackStack() },
                onOrderClick = { tableId ->
                    // For now, navigate to CurrentOrder for that table
                    // Ideally we should have a read-only OrderDetail screen
                    navController.navigate(Screen.CurrentOrder.createRoute(tableId))
                }
            )
        }

        composable(Screen.Settings.route) {
            com.example.restaurantpos.restaurantpo.smartorder.presentation.screens.settings.SettingsScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(Screen.Menu.route) {
            com.example.restaurantpos.restaurantpo.smartorder.presentation.screens.menu.MenuScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(Screen.Kitchen.route) {
            com.example.restaurantpos.restaurantpo.smartorder.presentation.screens.kitchen.KitchenScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(Screen.UserManagement.route) {
            com.example.restaurantpos.restaurantpo.smartorder.presentation.screens.admin.UserManagementScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(Screen.Reports.route) {
            com.example.restaurantpos.restaurantpo.smartorder.presentation.screens.admin.ReportsScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }
    }
}
