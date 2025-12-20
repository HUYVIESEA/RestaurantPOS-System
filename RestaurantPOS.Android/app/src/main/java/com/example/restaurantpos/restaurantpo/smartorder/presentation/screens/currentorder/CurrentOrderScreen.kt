package com.example.restaurantpos.restaurantpo.smartorder.presentation.screens.currentorder

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
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
import com.example.restaurantpos.restaurantpo.smartorder.domain.model.Order
import com.example.restaurantpos.restaurantpo.smartorder.domain.model.OrderItem
import java.text.NumberFormat
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CurrentOrderScreen(
    tableId: Int,
    orderId: Int? = null,
    onNavigateBack: () -> Unit,
    onAddMoreItems: (Int, Int) -> Unit, // tableId, orderId
    viewModel: CurrentOrderViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val currencyFormatter = remember { NumberFormat.getCurrencyInstance(Locale("vi", "VN")) }
    val dateFormatter = remember { SimpleDateFormat("HH:mm - dd/MM/yyyy", Locale("vi", "VN")) }
    val snackbarHostState = remember { SnackbarHostState() }
    var showPaymentDialog by remember { mutableStateOf(false) }
    
    // State for dialogs
    var itemToUpdate by remember { mutableStateOf<OrderItem?>(null) }
    var pendingQuantity by remember { mutableStateOf(0) } // The new quantity user wants to set
    var showConfirmDialog by remember { mutableStateOf(false) } // Confirm decrease
    var showEditDialog by remember { mutableStateOf(false) } // Input specific quantity

    LaunchedEffect(tableId, orderId) {
        viewModel.loadCurrentOrder(tableId, orderId)
    }

    LaunchedEffect(uiState.successMessage, uiState.error) {
        uiState.successMessage?.let { message ->
            snackbarHostState.showSnackbar(
                message = message,
                duration = SnackbarDuration.Short
            )
            viewModel.clearMessages()
            onNavigateBack()
        }
        uiState.error?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.clearMessages()
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(hostState = snackbarHostState) },
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text("Đơn hàng", fontWeight = FontWeight.Bold)
                        Text(
                            "Bàn $tableId",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color.White.copy(alpha = 0.8f)
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Rounded.ArrowBack, contentDescription = "Back", tint = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    titleContentColor = Color.White
                )
            )
        },
        bottomBar = {
            if (uiState.order != null) {
                CurrentOrderBottomBar(
                    totalAmount = uiState.order!!.totalAmount,
                    currencyFormatter = currencyFormatter,
                    onAddMore = { onAddMoreItems(tableId, uiState.order!!.id) },
                    onPayment = { showPaymentDialog = true }
                )
            }
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            when {
                uiState.isLoading -> {
                    CircularProgressIndicator(
                        modifier = Modifier.align(Alignment.Center)
                    )
                }
                uiState.order == null -> {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(32.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Icon(
                            Icons.Rounded.Receipt,
                            contentDescription = null,
                            modifier = Modifier.size(64.dp),
                            tint = Color.Gray
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            "Không tìm thấy đơn hàng",
                            style = MaterialTheme.typography.titleMedium,
                            color = Color.Gray
                        )
                    }
                }
                else -> {
                    LazyColumn(
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        // Order Info Card
                        item {
                            OrderInfoCard(
                                order = uiState.order!!,
                                dateFormatter = dateFormatter
                            )
                        }

                        // Order Items
                        item {
                            Text(
                                "Món đã gọi",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(vertical = 8.dp)
                            )
                        }

                        items(uiState.order!!.items) { item ->
                            OrderItemCard(
                                item = item,
                                currencyFormatter = currencyFormatter,
                                onIncreaseQuantity = { viewModel.increaseItemQuantity(it.id) },
                                onDecreaseQuantity = { 
                                    // Decrease by 1 -> Confirm
                                    itemToUpdate = it
                                    pendingQuantity = it.quantity - 1
                                    showConfirmDialog = true
                                },
                                onQuantityClick = {
                                    itemToUpdate = it
                                    showEditDialog = true
                                }
                            )
                        }

                        // Spacing for bottom bar
                        item {
                            Spacer(modifier = Modifier.height(80.dp))
                        }
                    }
                }
            }
        }
    }

    // Dialog xác nhận giảm/hủy món
    if (showConfirmDialog && itemToUpdate != null) {
        val item = itemToUpdate!!
        val diff = item.quantity - pendingQuantity
        val title = if (pendingQuantity == 0) "Xác nhận xóa món" else "Xác nhận giảm số lượng"
        val message = if (pendingQuantity == 0) 
            "Bạn có chắc chắn muốn xóa món '${item.productName}'?" 
        else 
            "Bạn muốn hủy $diff phần '${item.productName}'?"

        AlertDialog(
            onDismissRequest = { 
                showConfirmDialog = false 
                itemToUpdate = null
            },
            title = { Text(title) },
            text = { Text(message) },
            confirmButton = {
                TextButton(
                    onClick = {
                        viewModel.updateItemQuantity(item.id, pendingQuantity)
                        showConfirmDialog = false
                        itemToUpdate = null
                    }
                ) {
                    Text("Đồng ý", color = MaterialTheme.colorScheme.error)
                }
            },
            dismissButton = {
                TextButton(onClick = { 
                    showConfirmDialog = false 
                    itemToUpdate = null
                }) {
                    Text("Hủy")
                }
            }
        )
    }

    // Dialog nhập số lượng
    if (showEditDialog && itemToUpdate != null) {
        EditQuantityDialog(
            initialQuantity = itemToUpdate!!.quantity,
            onDismiss = { 
                showEditDialog = false 
                itemToUpdate = null
            },
            onConfirm = { newQty ->
                showEditDialog = false
                if (newQty < itemToUpdate!!.quantity) {
                    // Decreasing -> Show confirm
                    pendingQuantity = newQty
                    showConfirmDialog = true
                } else if (newQty > itemToUpdate!!.quantity) {
                    // Increasing -> Just do it
                    viewModel.updateItemQuantity(itemToUpdate!!.id, newQty)
                    itemToUpdate = null
                } else {
                    itemToUpdate = null
                }
            }
        )
    }

    if (showPaymentDialog) {
        PaymentDialog(
            totalAmount = uiState.order?.totalAmount ?: 0.0,
            paymentSettings = uiState.paymentSettings,
            currencyFormatter = currencyFormatter,
            onDismiss = { showPaymentDialog = false },
            onConfirm = { receivedAmount, paymentMethod ->
                viewModel.processPayment(receivedAmount, paymentMethod)
                showPaymentDialog = false
            }
        )
    }
}

@Composable
fun EditQuantityDialog(
    initialQuantity: Int,
    onDismiss: () -> Unit,
    onConfirm: (Int) -> Unit
) {
    var quantityStr by remember { mutableStateOf(initialQuantity.toString()) }
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Chỉnh sửa số lượng") },
        text = {
            OutlinedTextField(
                value = quantityStr,
                onValueChange = { quantityStr = it.filter { char -> char.isDigit() } },
                label = { Text("Số lượng") },
                singleLine = true,
                keyboardOptions = androidx.compose.foundation.text.KeyboardOptions(
                    keyboardType = androidx.compose.ui.text.input.KeyboardType.Number
                ),
                modifier = Modifier.fillMaxWidth()
            )
        },
        confirmButton = {
            Button(
                onClick = { 
                    val qty = quantityStr.toIntOrNull() ?: initialQuantity
                    onConfirm(qty)
                }
            ) {
                Text("Lưu")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Hủy")
            }
        }
    )
}

@Composable
fun OrderInfoCard(
    order: Order,
    dateFormatter: SimpleDateFormat
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.primaryContainer
        )
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        "Mã đơn: #${order.id}",
                        fontWeight = FontWeight.Bold,
                        style = MaterialTheme.typography.titleMedium
                    )
                    if (!order.isSynced) {
                        Spacer(modifier = Modifier.width(8.dp))
                        Icon(
                            Icons.Rounded.CloudOff,
                            contentDescription = "Chưa đồng bộ",
                            tint = Color(0xFFFFA000), // Amber
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
                StatusChip(order.status)
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                "Thời gian: ${dateFormatter.format(order.orderDate)}",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onPrimaryContainer.copy(alpha = 0.7f)
            )
        }
    }
}

@Composable
fun StatusChip(status: String) {
    val (color, text) = when (status.lowercase()) {
        "pending" -> Color(0xFFFF9800) to "Chờ xử lý"
        "completed" -> Color(0xFF4CAF50) to "Hoàn thành"
        "cancelled" -> Color(0xFFF44336) to "Đã hủy"
        else -> Color.Gray to status
    }

    Surface(
        color = color.copy(alpha = 0.2f),
        shape = RoundedCornerShape(12.dp)
    ) {
        Text(
            text = text,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp),
            color = color,
            fontWeight = FontWeight.Bold,
            fontSize = 12.sp
        )
    }
}

@Composable
fun OrderItemCard(
    item: OrderItem,
    currencyFormatter: NumberFormat,
    onIncreaseQuantity: (OrderItem) -> Unit = {},
    onDecreaseQuantity: (OrderItem) -> Unit = {},
    onQuantityClick: (OrderItem) -> Unit = {}
) {
    val total = item.price * item.quantity
    
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = item.productName,
                    fontWeight = FontWeight.Medium,
                    style = MaterialTheme.typography.bodyLarge
                )
                Text(
                    text = currencyFormatter.format(item.price),
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.Gray
                )
                if (!item.note.isNullOrEmpty()) {
                    Text(
                        text = "Ghi chú: ${item.note}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.primary,
                        fontStyle = androidx.compose.ui.text.font.FontStyle.Italic
                    )
                }
            }
            
            // Quantity controls
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // Decrease button
                IconButton(
                    onClick = { onDecreaseQuantity(item) },
                    modifier = Modifier.size(32.dp)
                ) {
                    Icon(
                        Icons.Rounded.Remove,
                        contentDescription = "Giảm",
                        tint = MaterialTheme.colorScheme.error,
                        modifier = Modifier.size(20.dp)
                    )
                }
                
                // Quantity display (Clickable)
                Surface(
                    onClick = { onQuantityClick(item) },
                    shape = RoundedCornerShape(4.dp),
                    color = Color.Transparent
                ) {
                    Text(
                        text = "${item.quantity}",
                        fontWeight = FontWeight.Bold,
                        style = MaterialTheme.typography.titleMedium,
                        modifier = Modifier
                            .width(32.dp)
                            .padding(vertical = 4.dp),
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                        textDecoration = androidx.compose.ui.text.style.TextDecoration.Underline
                    )
                }
                
                // Increase button
                IconButton(
                    onClick = { onIncreaseQuantity(item) },
                    modifier = Modifier.size(32.dp)
                ) {
                    Icon(
                        Icons.Rounded.Add,
                        contentDescription = "Tăng",
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
            
            Spacer(modifier = Modifier.width(8.dp))
            
            // Total price
            Text(
                text = currencyFormatter.format(total),
                fontWeight = FontWeight.Bold,
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.primary
            )
        }
    }
}

@Composable
fun PaymentDialog(
    totalAmount: Double,
    paymentSettings: com.example.restaurantpos.restaurantpo.smartorder.data.remote.dto.PaymentSettingsDto?,
    currencyFormatter: NumberFormat,
    onDismiss: () -> Unit,
    onConfirm: (Double, String) -> Unit
) {
    var receivedAmount by remember { mutableStateOf(totalAmount.toString()) }
    var selectedPaymentMethod by remember { mutableStateOf("Cash") } // "Cash" or "Transfer"
    
    val receivedDouble = receivedAmount.toDoubleOrNull() ?: 0.0
    val change = (receivedDouble - totalAmount).coerceAtLeast(0.0)

    // Bank Info
    val bankId = paymentSettings?.bankBin ?: "MB"
    val accountNo = paymentSettings?.accountNumber ?: "0000000000"
    val accountName = paymentSettings?.accountName ?: "RESTAURANT"
    
    // VietQR URL
    // Format: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png?amount=<AMOUNT>&addInfo=<CONTENT>
    val qrUrl = "https://img.vietqr.io/image/$bankId-$accountNo-compact2.png?amount=${totalAmount.toInt()}&addInfo=Thanh%20toan%20don%20hang"

    androidx.compose.ui.window.Dialog(
        onDismissRequest = onDismiss,
        properties = androidx.compose.ui.window.DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth(0.95f)
                .wrapContentHeight(),
            shape = RoundedCornerShape(16.dp),
            color = MaterialTheme.colorScheme.surface,
            tonalElevation = 6.dp
        ) {
            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .verticalScroll(androidx.compose.foundation.rememberScrollState())
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        "Thanh toán",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold
                    )
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Rounded.Close, contentDescription = "Đóng")
                    }
                }
                
                Divider(modifier = Modifier.padding(vertical = 12.dp))

                // Total Amount
                Text(
                    "Tổng tiền cần thu:",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color.Gray
                )
                Text(
                    currencyFormatter.format(totalAmount),
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
                
                Spacer(modifier = Modifier.height(20.dp))
                
                // Payment Method
                Text("Phương thức thanh toán:", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(8.dp))
                
                Row(modifier = Modifier.fillMaxWidth()) {
                    // Cash Option
                    Card(
                        modifier = Modifier
                            .weight(1f)
                            .clickable { selectedPaymentMethod = "Cash" }
                            .border(
                                width = if (selectedPaymentMethod == "Cash") 2.dp else 1.dp,
                                color = if (selectedPaymentMethod == "Cash") MaterialTheme.colorScheme.primary else Color.LightGray,
                                shape = RoundedCornerShape(8.dp)
                            ),
                        colors = CardDefaults.cardColors(containerColor = if (selectedPaymentMethod == "Cash") MaterialTheme.colorScheme.primaryContainer else Color.White)
                    ) {
                        Column(
                            modifier = Modifier.padding(12.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(
                                Icons.Rounded.Money, 
                                contentDescription = null,
                                tint = if (selectedPaymentMethod == "Cash") MaterialTheme.colorScheme.primary else Color.Gray
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text("Tiền mặt", fontWeight = FontWeight.Bold)
                        }
                    }
                    
                    Spacer(modifier = Modifier.width(12.dp))
                    
                    // Transfer Option
                    Card(
                        modifier = Modifier
                            .weight(1f)
                            .clickable { selectedPaymentMethod = "Transfer" }
                            .border(
                                width = if (selectedPaymentMethod == "Transfer") 2.dp else 1.dp,
                                color = if (selectedPaymentMethod == "Transfer") MaterialTheme.colorScheme.primary else Color.LightGray,
                                shape = RoundedCornerShape(8.dp)
                            ),
                         colors = CardDefaults.cardColors(containerColor = if (selectedPaymentMethod == "Transfer") MaterialTheme.colorScheme.primaryContainer else Color.White)
                    ) {
                        Column(
                            modifier = Modifier.padding(12.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(
                                Icons.Rounded.QrCode, 
                                contentDescription = null,
                                tint = if (selectedPaymentMethod == "Transfer") MaterialTheme.colorScheme.primary else Color.Gray
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text("Chuyển khoản", fontWeight = FontWeight.Bold)
                        }
                    }
                }
                
                Spacer(modifier = Modifier.height(24.dp))

                if (selectedPaymentMethod == "Transfer") {
                    // QR Code Section
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text("Quét mã VietQR:", fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(8.dp))
                        
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .aspectRatio(1f) // Square
                                .background(Color.White, RoundedCornerShape(12.dp))
                                .border(1.dp, Color.LightGray, RoundedCornerShape(12.dp))
                                .padding(8.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            coil.compose.AsyncImage(
                                model = qrUrl,
                                contentDescription = "VietQR",
                                modifier = Modifier.fillMaxSize(),
                                contentScale = androidx.compose.ui.layout.ContentScale.Fit
                            )
                        }
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        // Bank Account Info
                        Card(
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                                    Text("Ngân hàng:", color = Color.Gray, style = MaterialTheme.typography.bodySmall)
                                    Text(paymentSettings?.bankName ?: bankId, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.bodySmall)
                                }
                                Spacer(modifier = Modifier.height(4.dp))
                                Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                                    Text("Số tài khoản:", color = Color.Gray, style = MaterialTheme.typography.bodySmall)
                                    Text(accountNo, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.bodySmall)
                                }
                                Spacer(modifier = Modifier.height(4.dp))
                                Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                                    Text("Chủ tài khoản:", color = Color.Gray, style = MaterialTheme.typography.bodySmall)
                                    Text(accountName, fontWeight = FontWeight.Bold, style = MaterialTheme.typography.bodySmall)
                                }
                            }
                        }
                        
                        // Auto-fill full amount for Transfer
                        LaunchedEffect(selectedPaymentMethod) {
                            receivedAmount = totalAmount.toString()
                        }
                    }
                } else {
                    // Cash Input Section
                    OutlinedTextField(
                        value = receivedAmount,
                        onValueChange = { receivedAmount = it.filter { char -> char.isDigit() || char == '.' } },
                        label = { Text("Tiền khách đưa") },
                        singleLine = true,
                        keyboardOptions = androidx.compose.foundation.text.KeyboardOptions(
                            keyboardType = androidx.compose.ui.text.input.KeyboardType.Number
                        ),
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 8.dp),
                        textStyle = MaterialTheme.typography.titleMedium
                    )
                    
                    // Quick input buttons
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 8.dp)
                            .horizontalScroll(androidx.compose.foundation.rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        val suggestions = listOf(totalAmount, 50000.0, 100000.0, 200000.0, 500000.0)
                        suggestions.filter { it >= totalAmount }.forEach { amount ->
                             SuggestionChip(
                                onClick = { receivedAmount = amount.toInt().toString() },
                                label = { Text(currencyFormatter.format(amount)) }
                            )
                        }
                    }
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    if (receivedDouble >= totalAmount) {
                         Card(
                            colors = CardDefaults.cardColors(containerColor = Color(0xFFE8F5E9)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                             Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text("Tiền thừa trả khách:", color = Color(0xFF2E7D32), fontWeight = FontWeight.Bold)
                                Text(
                                    currencyFormatter.format(change),
                                    style = MaterialTheme.typography.titleLarge,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF2E7D32)
                                )
                            }
                        }
                    }
                }
                
                Spacer(modifier = Modifier.height(24.dp))
                
                // Action Buttons
                Row(modifier = Modifier.fillMaxWidth()) {
                    TextButton(
                        onClick = onDismiss,
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Hủy bỏ", color = Color.Gray)
                    }
                    
                    Spacer(modifier = Modifier.width(16.dp))
                    
                    Button(
                        onClick = { onConfirm(receivedDouble, selectedPaymentMethod) },
                        enabled = receivedDouble >= totalAmount,
                        modifier = Modifier.weight(1f),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (selectedPaymentMethod == "Transfer") Color(0xFF0068FF) else MaterialTheme.colorScheme.primary
                        )
                    ) {
                        Text(if (selectedPaymentMethod == "Transfer") "Đã nhận tiền" else "Hoàn thành")
                    }
                }
            }
        }
    }
}

@Composable
fun CurrentOrderBottomBar(
    totalAmount: Double,
    currencyFormatter: NumberFormat,
    onAddMore: () -> Unit,
    onPayment: () -> Unit
) {
    Surface(
        color = MaterialTheme.colorScheme.surface,
        shadowElevation = 8.dp,
        tonalElevation = 3.dp
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .navigationBarsPadding()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        "Tổng cộng",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color.Gray
                    )
                    Text(
                        currencyFormatter.format(totalAmount),
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedButton(
                    onClick = onAddMore,
                    modifier = Modifier.weight(1f),
                    contentPadding = PaddingValues(vertical = 12.dp)
                ) {
                    Icon(Icons.Rounded.Add, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Thêm món")
                }

                Button(
                    onClick = onPayment,
                    modifier = Modifier.weight(1f),
                    contentPadding = PaddingValues(vertical = 12.dp)
                ) {
                    Icon(Icons.Rounded.Payments, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Thanh toán")
                }
            }
        }
    }
}
