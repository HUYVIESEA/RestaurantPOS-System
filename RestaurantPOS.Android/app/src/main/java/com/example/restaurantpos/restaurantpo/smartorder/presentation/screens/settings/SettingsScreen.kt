package com.example.restaurantpos.restaurantpo.smartorder.presentation.screens.settings

import android.widget.Toast
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.ArrowBack
import androidx.compose.material.icons.rounded.Print
import androidx.compose.material.icons.rounded.Save
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    userRole: String = "Staff",
    onNavigateBack: () -> Unit,
    viewModel: SettingsViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current

    LaunchedEffect(uiState.isSaved) {
        if (uiState.isSaved) {
            Toast.makeText(context, "Đã lưu cài đặt.", Toast.LENGTH_LONG).show()
            viewModel.resetSavedState()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Cài đặt", fontWeight = FontWeight.Bold) },
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
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Admin only: Server Config
            if (userRole.equals("Admin", ignoreCase = true)) {
                Text(
                    "Cấu hình máy chủ",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )

                OutlinedTextField(
                    value = uiState.baseUrl,
                    onValueChange = { viewModel.updateBaseUrl(it) },
                    label = { Text("API Base URL") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    supportingText = {
                        Text("Ví dụ: http://192.168.1.100:5000")
                    }
                )
                
                Spacer(modifier = Modifier.height(8.dp))
            }

            // Admin & Manager: Printer Config
            if (userRole.equals("Admin", ignoreCase = true) || userRole.equals("Manager", ignoreCase = true)) {
                Text(
                    "Cấu hình máy in",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )

                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Cấu hình máy in hóa đơn (LAN/WiFi)", fontWeight = FontWeight.Medium)
                        Spacer(modifier = Modifier.height(8.dp))
                        
                        OutlinedTextField(
                            value = uiState.printerIp,
                            onValueChange = { viewModel.updatePrinterIp(it) },
                            label = { Text("Địa chỉ IP Máy in") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            placeholder = { Text("192.168.1.200") }
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        OutlinedTextField(
                            value = uiState.printerPort,
                            onValueChange = { viewModel.updatePrinterPort(it) },
                            label = { Text("Cổng (Port)") },
                            modifier = Modifier.fillMaxWidth(),
                            singleLine = true,
                            placeholder = { Text("9100") }
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Button(
                            onClick = { 
                                viewModel.testPrint()
                                Toast.makeText(context, "Đã gửi lệnh in thử nghiệm (Giả lập)", Toast.LENGTH_SHORT).show() 
                            },
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.secondary)
                        ) {
                            Icon(Icons.Rounded.Print, contentDescription = null)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("In thử nghiệm")
                        }
                    }
                }
            }
            
            // Staff & Kitchen & Others: Info
            if (!userRole.equals("Admin", ignoreCase = true) && !userRole.equals("Manager", ignoreCase = true)) {
                 Text(
                    "Thông tin ứng dụng",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
                Card(
                     modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color.White)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Phiên bản: 1.0.0", style = MaterialTheme.typography.bodyMedium)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("Vai trò: $userRole", style = MaterialTheme.typography.bodyMedium)
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            if (userRole.equals("Admin", ignoreCase = true) || userRole.equals("Manager", ignoreCase = true)) {
                Button(
                    onClick = { viewModel.saveSettings() },
                    modifier = Modifier.fillMaxWidth(),
                    contentPadding = PaddingValues(16.dp)
                ) {
                    Icon(Icons.Rounded.Save, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Lưu thay đổi")
                }
                
                Text(
                    "Lưu ý: Hầu hết cài đặt sẽ có hiệu lực ngay lập tức.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}
