package com.example.restaurantpos.restaurantpo.smartorder.presentation.screens.tables

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.restaurantpos.restaurantpo.smartorder.domain.model.Table
import com.example.restaurantpos.restaurantpo.smartorder.domain.model.Order
import java.text.SimpleDateFormat // Existing import
import java.util.*
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties

@OptIn(ExperimentalMaterial3Api::class, ExperimentalFoundationApi::class)
@Composable
fun TablesScreen(
    onTableClick: (Int, Boolean) -> Unit,
    onTakeAwayOrderClick: (Int, Int) -> Unit, // tableId, orderId
    onNavigateBack: () -> Unit,
    viewModel: TablesViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }

    // Reload tables when screen is displayed (to refresh status after payment)
    LaunchedEffect(Unit) {
        viewModel.loadTables()
    }

    // Show messages
    LaunchedEffect(uiState.error, uiState.successMessage) {
        uiState.error?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.clearMessages()
        }
        uiState.successMessage?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.clearMessages()
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(hostState = snackbarHostState) },
        topBar = {
            TopAppBar(
                title = { Text("Quản lý Bàn", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Rounded.ArrowBack, contentDescription = "Back", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = Color.White
                ),
                actions = {
                    if (uiState.selectedTables.isNotEmpty()) {
                        IconButton(onClick = { viewModel.clearSelection() }) {
                            Icon(Icons.Rounded.Close, "Clear selection", tint = Color.White)
                        }
                        if (uiState.selectedTables.size >= 2) {
                            TextButton(onClick = { viewModel.mergeTables() }) {
                                Text("Ghép bàn", color = Color.White, fontWeight = FontWeight.Bold)
                            }
                        }
                         // Add Take Away Button here
                        IconButton(onClick = { viewModel.openTakeAway() }) {
                            Icon(Icons.Rounded.ShoppingBag, "Mang về", tint = Color.White)
                        }
                    }
                    IconButton(onClick = { viewModel.loadTables() }) {
                        Icon(Icons.Rounded.Refresh, "Refresh", tint = Color.White)
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            // Floor Filter
            FloorFilterRow(
                floors = uiState.floors,
                selectedFloor = uiState.selectedFloor,
                onFloorSelected = { viewModel.selectFloor(it) }
            )
            
            // Status Filter
            StatusFilterRow(
                selectedStatus = uiState.selectedStatus,
                onStatusSelected = { viewModel.selectStatus(it) }
            )

            // Stats Row
            StatsRow(
                totalTables = uiState.tables.size,
                availableTables = uiState.tables.count { it.isAvailable },
                occupiedTables = uiState.tables.count { !it.isAvailable }
            )

            // Tables Grid
            if (uiState.isLoading) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            } else {
                LazyVerticalGrid(
                    columns = GridCells.Fixed(2),
                    contentPadding = PaddingValues(16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(
                        items = uiState.filteredTables,
                        key = { it.id }
                    ) { table ->
                        TableCard(
                            table = table,
                            isSelected = uiState.selectedTables.contains(table.id),
                            onTableClick = {
                                if (uiState.takeAwayTable != null && table.id == uiState.takeAwayTable!!.id) {
                                    viewModel.openTakeAway()
                                } else if (uiState.selectedTables.isNotEmpty()) {
                                    viewModel.toggleTableSelection(table.id)
                                } else {
                                    onTableClick(table.id, table.isAvailable)
                                }
                            },
                            onTableLongClick = {
                                viewModel.toggleTableSelection(table.id)
                            },
                            onReturnClick = {
                                viewModel.returnTable(table.id)
                            },
                            onSplitClick = {
                                table.mergedGroupId?.let { viewModel.splitTables(it) }
                            }
                        )
                    }
                }
            }
        }
        }

    
    // Take Away Dialog
    if (uiState.showTakeAwayDialog) {
        TakeAwayDialog(
            orders = uiState.takeAwayOrders,
            isLoading = uiState.isLoadingTakeAway,
            onDismiss = { viewModel.closeTakeAwayDialog() },
            onNewOrder = {
                viewModel.closeTakeAwayDialog()
                uiState.takeAwayTable?.let { table ->
                    // Navigate to Order screen with tableId. 
                    // Note: OrderViewModel creates new order for table.
                    // If multiple orders exist, we assume OrderScreen handles NEW order creation.
                    // But wait, OrderScreen takes tableId and checks for existing order logic?
                    // Actually OrderScreen is designed to CREATE order if we start adding items. 
                    // It doesn't auto-load existing unless programmed to.
                    // Wait, standard OrderScreen might load existing items if cart is empty?
                    // Let's assume OrderScreen is for NEW/Edit. 
                    // Ideally for TakeAway New Order, we want a clean state.
                    // We might need to ensure OrderViewModel clears cart if table is "Mang về".
                    // But let's navigate first.
                    // We use `Screen.Order.createRoute(table.id)` which is standard for "Adding items to table".
                    
                    // IMPORTANT: Standard tables: 1 table = 1 order. 
                    // TakeAway: 1 table = N orders.
                    // If we navigate to OrderScreen(tableId), OrderViewModel will fetch products. It treats it as "Adding to cart".
                    // Then submit -> Creates Order. This works for New Order.
                     onTableClick(table.id, true) // Treat as available for New Order
                }
            },
            onSelectOrder = { order ->
                viewModel.closeTakeAwayDialog()
                uiState.takeAwayTable?.let { table ->
                    onTakeAwayOrderClick(table.id, order.id)
                }
            }
        )
    }
}

@Composable
fun TakeAwayDialog(
    orders: List<Order>,
    isLoading: Boolean,
    onDismiss: () -> Unit,
    onNewOrder: () -> Unit,
    onSelectOrder: (Order) -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Đơn hàng Mang về") },
        text = {
            if (isLoading) {
                Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
            } else if (orders.isEmpty()) {
                Text("Chưa có đơn hàng nào đang phục vụ.")
            } else {
                LazyVerticalGrid(
                    columns = GridCells.Fixed(1),
                    modifier = Modifier.heightIn(max = 400.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(orders) { order ->
                        Card(
                            colors = CardDefaults.cardColors(
                                containerColor = MaterialTheme.colorScheme.surfaceVariant
                            ),
                            onClick = { onSelectOrder(order) }
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text("Đơn #${order.id}", fontWeight = FontWeight.Bold)
                                    Text(
                                        SimpleDateFormat("HH:mm", Locale.getDefault()).format(order.orderDate),
                                        style = MaterialTheme.typography.bodySmall
                                    )
                                }
                                Text(
                                    java.text.NumberFormat.getCurrencyInstance(Locale("vi", "VN")).format(order.totalAmount),
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.primary
                                )
                            }
                        }
                    }
                }
            }
        },
        confirmButton = {
            Button(onClick = onNewOrder) {
                Icon(Icons.Rounded.Add, null, modifier = Modifier.size(16.dp))
                Spacer(Modifier.width(4.dp))
                Text("Đơn mới")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Đóng")
            }
        }
    )
}

@Composable
fun FloorFilterRow(
    floors: List<String>,
    selectedFloor: String,
    onFloorSelected: (String) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        floors.forEach { floor ->
            FilterChip(
                selected = floor == selectedFloor,
                onClick = { onFloorSelected(floor) },
                label = { Text(floor) },
                leadingIcon = {
                    if (floor == selectedFloor) {
                        Icon(Icons.Rounded.Check, null, modifier = Modifier.size(18.dp))
                    }
                }
            )
        }
    }
}

@Composable
fun StatusFilterRow(
    selectedStatus: String,
    onStatusSelected: (String) -> Unit
) {
    val statuses = listOf("Tất cả", "Trống", "Đang dùng")
    
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 4.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        statuses.forEach { status ->
            val icon = when (status) {
                "Trống" -> Icons.Rounded.EventSeat
                "Đang dùng" -> Icons.Rounded.Person
                else -> Icons.Rounded.TableRestaurant
            }
            
            FilterChip(
                selected = status == selectedStatus,
                onClick = { onStatusSelected(status) },
                label = { Text(status) },
                leadingIcon = {
                    Icon(icon, null, modifier = Modifier.size(18.dp))
                }
            )
        }
    }
}

@Composable
fun StatsRow(
    totalTables: Int,
    availableTables: Int,
    occupiedTables: Int
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 10.dp, vertical = 2.dp),
        horizontalArrangement = Arrangement.SpaceEvenly
    ) {
        StatCard("Tổng số", totalTables, Color(0xFF2196F3))
        StatCard("Trống", availableTables, Color(0xFF4CAF50))
        StatCard("Đang dùng", occupiedTables, Color(0xFFFF9800))
    }
}

@Composable
fun StatCard(label: String, value: Int, color: Color) {
    Card(
        modifier = Modifier.width(110.dp),
        colors = CardDefaults.cardColors(containerColor = color.copy(alpha = 0.1f))
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = value.toString(),
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = color
            )
            Text(
                text = label,
                fontSize = 12.sp,
                color = color.copy(alpha = 0.8f)
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class, ExperimentalFoundationApi::class)
@Composable
fun TableCard(
    table: Table,
    isSelected: Boolean,
    onTableClick: () -> Unit,
    onTableLongClick: () -> Unit,
    onReturnClick: () -> Unit,
    onSplitClick: () -> Unit
) {
    var showMenu by remember { mutableStateOf(false) }
    
    // Calculate usage time for color coding
    val usageMinutes = remember(table.occupiedAt) {
        if (table.occupiedAt != null && !table.isAvailable) {
            val now = Date()
            val diffMs = now.time - table.occupiedAt.time
            (diffMs / (1000 * 60)).toInt() // Convert to minutes
        } else {
            0
        }
    }
    
    // Format elapsed time as HH:mm (like a timer)
    val elapsedTime = remember(usageMinutes) {
        if (usageMinutes > 0) {
            val hours = usageMinutes / 60
            val minutes = usageMinutes % 60
            String.format("%02d:%02d", hours, minutes)
        } else {
            "00:00"
        }
    }
    
    // Smart color based on usage time
    val borderColor = remember(isSelected, table.isMerged, table.isAvailable, usageMinutes) {
        when {
            isSelected -> Color.Blue
            table.isMerged -> Color(0xFFFF9800)
            !table.isAvailable -> {
                when {
                    usageMinutes > 90 -> Color(0xFFD32F2F)  // Red: > 90 mins
                    usageMinutes > 60 -> Color(0xFFFF6F00)  // Deep Orange: 60-90 mins
                    usageMinutes > 30 -> Color(0xFFFF9800)  // Orange: 30-60 mins
                    else -> Color(0xFFFFA726)               // Light Orange: < 30 mins
                }
            }
            else -> Color(0xFF4CAF50) // Green: Available
        }
    }
    
    val backgroundColor = remember(borderColor) {
        borderColor.copy(alpha = 0.1f)
    }

    Box {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .height(140.dp) // Increased height for more info
                .border(2.dp, borderColor, RoundedCornerShape(12.dp))
                .combinedClickable(
                    onClick = onTableClick,
                    onLongClick = { 
                        showMenu = true
                        onTableLongClick()
                    }
                ),
            colors = CardDefaults.cardColors(containerColor = backgroundColor),
            shape = RoundedCornerShape(12.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(12.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Table Number
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = table.tableNumber,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = borderColor
                    )
                    
                    // Status Icon
                    Icon(
                        imageVector = if (table.isAvailable) Icons.Rounded.EventSeat else Icons.Rounded.Person,
                        contentDescription = null,
                        tint = borderColor,
                        modifier = Modifier.size(24.dp)
                    )
                }
                
                Spacer(modifier = Modifier.height(4.dp))
                
                // Elapsed Time (if occupied) - displayed as HH:mm timer
                if (!table.isAvailable && table.occupiedAt != null) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.Start,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            Icons.Rounded.AccessTime,
                            contentDescription = null,
                            modifier = Modifier.size(14.dp),
                            tint = borderColor.copy(alpha = 0.7f)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = elapsedTime,
                            fontSize = 12.sp,
                            color = borderColor.copy(alpha = 0.8f),
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
                
                Spacer(modifier = Modifier.weight(1f))
                
                // Capacity
                Text(
                    text = "${table.capacity} chỗ",
                    fontSize = 12.sp,
                    color = borderColor.copy(alpha = 0.7f)
                )
                
                if (table.isMerged) {
                    Text(
                        text = "Ghép",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFFFF9800)
                    )
                }
                
                // Quick Actions (only for occupied tables)
                if (!table.isAvailable && !table.isMerged) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        // View Details
                        IconButton(
                            onClick = onTableClick,
                            modifier = Modifier
                                .size(32.dp)
                                .background(borderColor.copy(alpha = 0.2f), CircleShape)
                        ) {
                            Icon(
                                Icons.Rounded.Receipt,
                                contentDescription = "Chi tiết",
                                modifier = Modifier.size(16.dp),
                                tint = borderColor
                            )
                        }
                        
                        // Quick Payment
                        IconButton(
                            onClick = onTableClick, // Will navigate to CurrentOrderScreen where they can pay
                            modifier = Modifier
                                .size(32.dp)
                                .background(borderColor.copy(alpha = 0.2f), CircleShape)
                        ) {
                            Icon(
                                Icons.Rounded.Payments,
                                contentDescription = "Thanh toán",
                                modifier = Modifier.size(16.dp),
                                tint = borderColor
                            )
                        }
                    }
                }
            }
        }
        
        DropdownMenu(
            expanded = showMenu,
            onDismissRequest = { showMenu = false }
        ) {
            if (!table.isAvailable && !table.isMerged) {
                DropdownMenuItem(
                    text = { Text("Trả bàn") },
                    onClick = {
                        onReturnClick()
                        showMenu = false
                    },
                    leadingIcon = { Icon(Icons.Rounded.CleaningServices, null) }
                )
            }
            
            if (table.isMerged) {
                DropdownMenuItem(
                    text = { Text("Tách bàn") },
                    onClick = {
                        onSplitClick()
                        showMenu = false
                    },
                    leadingIcon = { Icon(Icons.Rounded.CallSplit, null) }
                )
            }
            
            if (table.isAvailable) {
                DropdownMenuItem(
                    text = { Text("Chọn để ghép") },
                    onClick = {
                        onTableLongClick() // Toggle selection
                        showMenu = false
                    },
                    leadingIcon = { Icon(Icons.Rounded.MergeType, null) }
                )
            }
        }
    }
}
