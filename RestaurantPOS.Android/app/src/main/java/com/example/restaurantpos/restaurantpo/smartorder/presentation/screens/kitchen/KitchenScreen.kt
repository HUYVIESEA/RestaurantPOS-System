package com.example.restaurantpos.restaurantpo.smartorder.presentation.screens.kitchen

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.ArrowBack
import androidx.compose.material.icons.rounded.CheckCircle
import androidx.compose.material.icons.rounded.PlayArrow
import androidx.compose.material.icons.rounded.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.restaurantpos.restaurantpo.smartorder.domain.model.Order
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun KitchenScreen(
    onNavigateBack: () -> Unit,
    viewModel: KitchenViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    var selectedTab by remember { mutableStateOf(0) }
    val tabs = listOf("Chờ chế biến (${uiState.pendingOrders.size})", "Đang chế biến (${uiState.processingOrders.size})")

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Bếp & Bar", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Rounded.ArrowBack, contentDescription = "Back", tint = Color.White)
                    }
                },
                actions = {
                    IconButton(onClick = { viewModel.loadOrders() }) {
                        Icon(Icons.Rounded.Refresh, contentDescription = "Refresh", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = Color.White
                )
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            TabRow(selectedTabIndex = selectedTab) {
                tabs.forEachIndexed { index, title ->
                    Tab(
                        selected = selectedTab == index,
                        onClick = { selectedTab = index },
                        text = { Text(title) }
                    )
                }
            }

            if (uiState.isLoading) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
            } else {
                val ordersToShow = if (selectedTab == 0) uiState.pendingOrders else uiState.processingOrders
                
                if (ordersToShow.isEmpty()) {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text("Không có đơn hàng nào", style = MaterialTheme.typography.bodyLarge, color = Color.Gray)
                    }
                } else {
                    LazyColumn(
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        items(ordersToShow) { order ->
                            KitchenOrderCard(
                                order = order,
                                isPending = selectedTab == 0,
                                onAction = { 
                                    // TODO: Implement status update action
                                }
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun KitchenOrderCard(
    order: Order,
    isPending: Boolean,
    onAction: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Bàn ${order.tableId}",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
                Text(
                    text = "#${order.id}",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color.Gray
                )
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = "Thời gian: ${SimpleDateFormat("HH:mm", Locale.getDefault()).format(order.orderDate)}",
                style = MaterialTheme.typography.bodySmall,
                color = Color.Gray
            )
            
            Divider(modifier = Modifier.padding(vertical = 12.dp))
            
            // Items
            // Note: Order model needs to have items list. Assuming it does or we fetch it.
            // Currently Order model in previous steps might not have items populated in the list view.
            // We might need to fetch details or ensure items are included.
            // For now, placeholder text
            Text("Chi tiết đơn hàng...", style = MaterialTheme.typography.bodyMedium)
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Button(
                onClick = onAction,
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (isPending) MaterialTheme.colorScheme.primary else Color(0xFF4CAF50)
                )
            ) {
                Icon(
                    if (isPending) Icons.Rounded.PlayArrow else Icons.Rounded.CheckCircle,
                    contentDescription = null
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(if (isPending) "Bắt đầu chế biến" else "Hoàn thành")
            }
        }
    }
}
