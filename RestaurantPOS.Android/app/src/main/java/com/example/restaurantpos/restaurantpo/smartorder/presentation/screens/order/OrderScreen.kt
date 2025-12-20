package com.example.restaurantpos.restaurantpo.smartorder.presentation.screens.order

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.AsyncImage
import com.example.restaurantpos.restaurantpo.smartorder.domain.model.CartItem
import com.example.restaurantpos.restaurantpo.smartorder.domain.model.Product
import java.text.NumberFormat
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrderScreen(
    tableId: Int,
    existingOrderId: Int? = null,
    onNavigateBack: () -> Unit,
    viewModel: OrderViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    var showCartSheet by remember { mutableStateOf(false) }
    // 1. Optimize: Remember formatter
    val currencyFormatter = remember { NumberFormat.getCurrencyInstance(Locale("vi", "VN")) }
    val snackbarHostState = remember { SnackbarHostState() }

    // 2. Optimize: Create a Map for O(1) lookup of quantities
    val cartQuantities = remember(uiState.cartItems) {
        uiState.cartItems.associate { it.product.id to it.quantity }
    }

    LaunchedEffect(true) {
        viewModel.uiEvent.collect { event ->
            when (event) {
                is OrderUiEvent.ShowSnackbar -> {
                    snackbarHostState.showSnackbar(event.message)
                }
                is OrderUiEvent.NavigateBack -> {
                    // Navigate back immediately for better UX
                    onNavigateBack()
                }
            }
        }
    }

    var showEditDialog by remember { mutableStateOf(false) }
    var editProductId by remember { mutableStateOf<Int?>(null) }
    var editInitialQuantity by remember { mutableStateOf(0) }
    var editInitialNote by remember { mutableStateOf("") }

    Scaffold(
        snackbarHost = { SnackbarHost(hostState = snackbarHostState) },
        topBar = {
            TopAppBar(
                title = { 
                    Column {
                        Text("Gọi món", fontWeight = FontWeight.Bold)
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
            if (uiState.cartItems.isNotEmpty()) {
                CartBottomBar(
                    totalItems = uiState.totalItems,
                    totalAmount = uiState.totalAmount,
                    currencyFormatter = currencyFormatter,
                    onViewCart = { showCartSheet = true },
                    onSubmitOrder = { viewModel.submitOrder() }
                )
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            // Search Bar
            SearchBar(
                searchQuery = uiState.searchQuery,
                onSearchQueryChange = { viewModel.updateSearchQuery(it) }
            )
            
            // Category Tabs
            if (uiState.categories.size > 1) {
                CategoryTabs(
                    categories = uiState.categories,
                    selectedCategory = uiState.selectedCategory,
                    onCategorySelected = { viewModel.selectCategory(it) }
                )
            }

            // Product List
            if (uiState.isLoading) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            } else {
                androidx.compose.foundation.lazy.LazyColumn(
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    items(
                        items = uiState.filteredProducts,
                        key = { it.id },
                        contentType = { "product" }
                    ) { product ->
                        // 3. Optimize: O(1) lookup
                        val quantity = cartQuantities[product.id] ?: 0
                        
                        ProductListItem(
                            product = product,
                            quantity = quantity,
                            currencyFormatter = currencyFormatter,
                            onAddClick = { viewModel.addToCart(product) },
                            onRemoveClick = { viewModel.updateQuantity(product.id, -1) },
                            onQuantityClick = {
                                editProductId = product.id
                                editInitialQuantity = quantity
                                editInitialNote = uiState.cartItems.find { it.product.id == product.id }?.note ?: ""
                                showEditDialog = true
                            }
                        )
                    }
                }
            }
        }
    }

    if (showCartSheet) {
        ModalBottomSheet(
            onDismissRequest = { showCartSheet = false }
        ) {
            CartSheetContent(
                cartItems = uiState.cartItems,
                totalAmount = uiState.totalAmount,
                currencyFormatter = currencyFormatter,
                onUpdateQuantity = { id, delta -> viewModel.updateQuantity(id, delta) },
                onEditItem = { id, qty, note ->
                    editProductId = id
                    editInitialQuantity = qty
                    editInitialNote = note
                    showEditDialog = true
                },
                onClearCart = { 
                    viewModel.clearCart()
                    showCartSheet = false
                },
                onSubmitOrder = {
                    viewModel.submitOrder()
                    showCartSheet = false
                }
            )
        }
    }

    if (showEditDialog && editProductId != null) {
        EditCartItemDialog(
            initialQuantity = editInitialQuantity,
            initialNote = editInitialNote,
            onDismiss = { 
                showEditDialog = false 
                editProductId = null
            },
            onConfirm = { newQty, newNote ->
                viewModel.setQuantity(editProductId!!, newQty)
                viewModel.updateNote(editProductId!!, newNote)
                showEditDialog = false
                editProductId = null
            }
        )
    }
}

@Composable
fun EditCartItemDialog(
    initialQuantity: Int,
    initialNote: String,
    onDismiss: () -> Unit,
    onConfirm: (Int, String) -> Unit
) {
    var quantityStr by remember { mutableStateOf(initialQuantity.toString()) }
    var note by remember { mutableStateOf(initialNote) }
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Chỉnh sửa món") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
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
                
                OutlinedTextField(
                    value = note,
                    onValueChange = { note = it },
                    label = { Text("Ghi chú") },
                    placeholder = { Text("Ví dụ: Ít đường, không đá...") },
                    modifier = Modifier.fillMaxWidth(),
                    maxLines = 3
                )
            }
        },
        confirmButton = {
            Button(
                onClick = { 
                    val qty = quantityStr.toIntOrNull() ?: initialQuantity
                    onConfirm(qty, note)
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
fun SearchBar(
    searchQuery: String,
    onSearchQueryChange: (String) -> Unit
) {
    OutlinedTextField(
        value = searchQuery,
        onValueChange = onSearchQueryChange,
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        placeholder = { Text("Tìm kiếm món ăn...") },
        leadingIcon = {
            Icon(Icons.Rounded.Search, contentDescription = "Search")
        },
        trailingIcon = {
            if (searchQuery.isNotEmpty()) {
                IconButton(onClick = { onSearchQueryChange("") }) {
                    Icon(Icons.Rounded.Close, contentDescription = "Clear")
                }
            }
        },
        singleLine = true,
        shape = RoundedCornerShape(12.dp),
        colors = OutlinedTextFieldDefaults.colors(
            focusedBorderColor = MaterialTheme.colorScheme.primary,
            unfocusedBorderColor = Color.LightGray
        )
    )
}

@Composable
fun CategoryTabs(
    categories: List<String>,
    selectedCategory: String,
    onCategorySelected: (String) -> Unit
) {
    LazyRow(
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 4.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(categories) { category ->
            FilterChip(
                selected = category == selectedCategory,
                onClick = { onCategorySelected(category) },
                label = { Text(category, fontWeight = if (category == selectedCategory) FontWeight.Bold else FontWeight.Normal) },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = MaterialTheme.colorScheme.primary,
                    selectedLabelColor = Color.White
                )
            )
        }
    }
}

@Composable
fun ProductListItem(
    product: Product,
    quantity: Int,
    currencyFormatter: NumberFormat,
    onAddClick: () -> Unit,
    onRemoveClick: () -> Unit,
    onQuantityClick: () -> Unit
) {
    val isOutOfStock = product.stockQuantity <= 0
    val canOrder = product.isAvailable && !isOutOfStock
    val isLowStock = product.isAvailable && product.stockQuantity < 10 && !isOutOfStock
    val maxReached = quantity >= product.stockQuantity

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(enabled = canOrder) { if (canOrder) onAddClick() },
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (canOrder) Color.White else Color(0xFFF5F5F5)
        )
    ) {
        Row(
            modifier = Modifier
                .padding(12.dp)
                .fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Image
            Box(
                modifier = Modifier
                    .size(60.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(Color.LightGray),
                contentAlignment = Alignment.Center
            ) {
                if (product.imageUrl != null) {
                    coil.compose.AsyncImage(
                        model = coil.request.ImageRequest.Builder(androidx.compose.ui.platform.LocalContext.current)
                            .data(product.imageUrl)
                            .crossfade(true)
                            .build(),
                        contentDescription = product.name,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier
                            .fillMaxSize()
                            .alpha(if (!canOrder) 0.5f else 1f)
                    )
                } else {
                    Icon(
                        Icons.Rounded.Fastfood,
                        contentDescription = null,
                        modifier = Modifier.size(24.dp),
                        tint = Color.Gray
                    )
                }
                
                if (!canOrder) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(Color.Black.copy(alpha = 0.3f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            Icons.Rounded.Block, 
                            contentDescription = "Unavailable", 
                            tint = Color.White,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.width(12.dp))

            // Info
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = product.name,
                    fontWeight = FontWeight.Bold,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    color = if (canOrder) Color.Black else Color.Gray
                )
                Text(
                    text = currencyFormatter.format(product.price),
                    color = if (canOrder) MaterialTheme.colorScheme.primary else Color.Gray,
                    fontWeight = FontWeight.Bold,
                    style = MaterialTheme.typography.bodyMedium
                )
                
                // Stock Status Labels
                if (!product.isAvailable) {
                     Text(
                        text = "Ngừng kinh doanh",
                        style = MaterialTheme.typography.labelSmall,
                        color = Color.Red
                    )
                } else if (isOutOfStock) {
                    Text(
                        text = "Hết hàng",
                        style = MaterialTheme.typography.labelSmall,
                        color = Color.Red
                    )
                } else {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "Tồn: ${product.stockQuantity}",
                            style = MaterialTheme.typography.labelSmall,
                            color = Color.Gray
                        )
                        if (isLowStock) {
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "(Sắp hết)",
                                style = MaterialTheme.typography.labelSmall,
                                color = Color(0xFFFF9800), // Orange
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }

            // Quantity Controls
            if (canOrder) {
                if (quantity > 0) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        IconButton(
                            onClick = onRemoveClick,
                            modifier = Modifier.size(32.dp).background(Color(0xFFEEEEEE), CircleShape)
                        ) {
                            Icon(Icons.Rounded.Remove, null, modifier = Modifier.size(16.dp))
                        }
                        
                        Surface(
                            onClick = onQuantityClick,
                            shape = RoundedCornerShape(4.dp),
                            color = Color.Transparent
                        ) {
                            Text(
                                text = quantity.toString(),
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp),
                                fontWeight = FontWeight.Bold,
                                textDecoration = androidx.compose.ui.text.style.TextDecoration.Underline,
                                color = if (maxReached) Color.Red else Color.Unspecified
                            )
                        }
                        
                        IconButton(
                            onClick = { if (!maxReached) onAddClick() },
                            modifier = Modifier.size(32.dp).background(
                                if (maxReached) Color.Gray else MaterialTheme.colorScheme.primary, 
                                CircleShape
                            ),
                            enabled = !maxReached
                        ) {
                            Icon(Icons.Rounded.Add, null, modifier = Modifier.size(16.dp), tint = Color.White)
                        }
                    }
                } else {
                    IconButton(
                        onClick = onAddClick,
                        modifier = Modifier.size(32.dp).background(MaterialTheme.colorScheme.primaryContainer, CircleShape)
                    ) {
                        Icon(Icons.Rounded.Add, null, modifier = Modifier.size(16.dp), tint = MaterialTheme.colorScheme.primary)
                    }
                }
            }
        }
    }
}

@Composable
fun CartBottomBar(
    totalItems: Int,
    totalAmount: Double,
    currencyFormatter: NumberFormat,
    onViewCart: () -> Unit,
    onSubmitOrder: () -> Unit
) {
    Surface(
        color = MaterialTheme.colorScheme.primaryContainer,
        shadowElevation = 8.dp,
        shape = RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .navigationBarsPadding()
                .padding(horizontal = 16.dp, vertical = 12.dp)
        ) {
            // Top row: Cart info
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.weight(1f)
                ) {
                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .background(MaterialTheme.colorScheme.primary, CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = totalItems.toString(),
                            color = Color.White,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(
                            text = "Tổng tiền",
                            style = MaterialTheme.typography.bodySmall
                        )
                        Text(
                            text = currencyFormatter.format(totalAmount),
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            // Bottom row: Action buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // View Cart button (outlined)
                OutlinedButton(
                    onClick = onViewCart,
                    modifier = Modifier.weight(1f),
                    contentPadding = PaddingValues(vertical = 12.dp)
                ) {
                    Icon(
                        Icons.Rounded.ShoppingCart,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Xem giỏ")
                }
                
                // Submit Order button (filled)
                Button(
                    onClick = onSubmitOrder,
                    modifier = Modifier.weight(1f),
                    contentPadding = PaddingValues(vertical = 12.dp)
                ) {
                    Icon(
                        Icons.Rounded.Check,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Đặt món")
                }
            }
        }
    }
}

@Composable
fun CartSheetContent(
    cartItems: List<CartItem>,
    totalAmount: Double,
    currencyFormatter: NumberFormat,
    onUpdateQuantity: (Int, Int) -> Unit,
    onEditItem: (Int, Int, String) -> Unit,
    onClearCart: () -> Unit,
    onSubmitOrder: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .navigationBarsPadding() // Push content up above navigation bar
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Giỏ hàng",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )
            TextButton(onClick = onClearCart) {
                Text("Xóa tất cả", color = Color.Red)
            }
        }
        
        Divider(modifier = Modifier.padding(vertical = 8.dp))
        
        // Cart Items List
        Column(
            modifier = Modifier
                .weight(1f, fill = false)
                .padding(vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            cartItems.forEach { item ->
                CartItemRow(
                    item = item,
                    currencyFormatter = currencyFormatter,
                    onIncrease = { onUpdateQuantity(item.product.id, 1) },
                    onDecrease = { onUpdateQuantity(item.product.id, -1) },
                    onEditClick = { onEditItem(item.product.id, item.quantity, item.note) }
                )
            }
        }
        
        Divider(modifier = Modifier.padding(vertical = 8.dp))
        
        // Total
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text("Tổng cộng:", fontWeight = FontWeight.Bold)
            Text(
                text = currencyFormatter.format(totalAmount),
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary,
                style = MaterialTheme.typography.titleLarge
            )
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Button(
            onClick = onSubmitOrder,
            modifier = Modifier.fillMaxWidth(),
            contentPadding = PaddingValues(16.dp)
        ) {
            Text("Đặt món", fontSize = 18.sp)
        }
        Spacer(modifier = Modifier.height(16.dp))
    }
}

@Composable
fun CartItemRow(
    item: CartItem,
    currencyFormatter: NumberFormat,
    onIncrease: () -> Unit,
    onDecrease: () -> Unit,
    onEditClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onEditClick)
            .padding(vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Quantity Controls
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier
                .border(1.dp, Color.LightGray, RoundedCornerShape(8.dp))
                .padding(4.dp)
        ) {
            IconButton(
                onClick = onDecrease,
                modifier = Modifier.size(24.dp)
            ) {
                Icon(Icons.Rounded.Remove, contentDescription = "Decrease", modifier = Modifier.size(16.dp))
            }
            
            Surface(
                color = Color.Transparent
            ) {
                Text(
                    text = item.quantity.toString(),
                    modifier = Modifier.padding(horizontal = 8.dp),
                    fontWeight = FontWeight.Bold
                )
            }
            
            IconButton(
                onClick = onIncrease,
                modifier = Modifier.size(24.dp)
            ) {
                Icon(Icons.Rounded.Add, contentDescription = "Increase", modifier = Modifier.size(16.dp))
            }
        }
        
        Spacer(modifier = Modifier.width(12.dp))
        
        // Product Info
        Column(modifier = Modifier.weight(1f)) {
            Text(text = item.product.name, fontWeight = FontWeight.Medium)
            Text(
                text = currencyFormatter.format(item.product.price),
                style = MaterialTheme.typography.bodySmall,
                color = Color.Gray
            )
            if (item.note.isNotEmpty()) {
                Text(
                    text = "Ghi chú: ${item.note}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.primary,
                    fontStyle = androidx.compose.ui.text.font.FontStyle.Italic
                )
            }
        }
        
        // Total Item Price
        Text(
            text = currencyFormatter.format(item.total),
            fontWeight = FontWeight.Bold
        )
    }
}

