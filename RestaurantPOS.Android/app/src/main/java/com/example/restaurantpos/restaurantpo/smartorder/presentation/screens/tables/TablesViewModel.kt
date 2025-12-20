package com.example.restaurantpos.restaurantpo.smartorder.presentation.screens.tables

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.restaurantpos.restaurantpo.smartorder.domain.model.Order
import com.example.restaurantpos.restaurantpo.smartorder.domain.model.Table
import com.example.restaurantpos.restaurantpo.smartorder.domain.usecase.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class TablesUiState(
    val allTables: List<Table> = emptyList(),
    val selectedFloor: String = "Tất cả",
    val selectedStatus: String = "Tất cả",
    val selectedTables: Set<Int> = emptySet(),
    val isLoading: Boolean = false,
    val error: String? = null,
    val successMessage: String? = null,
    
    // Take Away Support
    val takeAwayTable: Table? = null,
    val showTakeAwayDialog: Boolean = false,
    val takeAwayOrders: List<Order> = emptyList(),
    val isLoadingTakeAway: Boolean = false
) {
    val floors: List<String>
        get() = listOf("Tất cả") + allTables.map { it.floor }.distinct().sorted()

    val filteredTables: List<Table>
        get() = allTables.filter { table ->
            (selectedFloor == "Tất cả" || table.floor == selectedFloor) &&
            (when (selectedStatus) {
                "Trống" -> table.isAvailable
                "Đang dùng" -> !table.isAvailable
                else -> true
            })

        }.sortedWith { t1, t2 ->
            // Prioritize Take Away table
            val isTakeAway1 = t1.id == takeAwayTable?.id
            val isTakeAway2 = t2.id == takeAwayTable?.id
            
            when {
                isTakeAway1 && !isTakeAway2 -> -1
                !isTakeAway1 && isTakeAway2 -> 1
                else -> t1.tableNumber.compareTo(t2.tableNumber)
            }
        }
    
    // Legacy support for StatsRow using current view or all?
    // Usually admin wants to see stats for the CURRENT view (filtered by floor) or ALL?
    // The screenshot shows stats. Usually it's helpful to see stats for the selected floor.
    val tables: List<Table> get() = filteredTables // Alias for compatibility
}

@HiltViewModel
class TablesViewModel @Inject constructor(
    private val getTablesUseCase: GetTablesUseCase,
    private val getOrdersByTableUseCase: GetOrdersByTableUseCase,
    // getTablesByFloorUseCase removed as we do client-side filtering
    private val returnTableUseCase: ReturnTableUseCase,
    private val mergeTablesUseCase: MergeTablesUseCase,
    private val splitTablesUseCase: SplitTablesUseCase,
    private val signalRService: com.example.restaurantpos.restaurantpo.smartorder.data.remote.SignalRService
) : ViewModel() {

    private val _uiState = MutableStateFlow(TablesUiState())
    val uiState: StateFlow<TablesUiState> = _uiState.asStateFlow()

    init {
        loadTables()
        listenToSignalREvents()
    }
    
    private fun listenToSignalREvents() {
        viewModelScope.launch {
            signalRService.events.collect { event ->
                when (event) {
                    is com.example.restaurantpos.restaurantpo.smartorder.data.remote.SignalREvent.OrderCreated,
                    is com.example.restaurantpos.restaurantpo.smartorder.data.remote.SignalREvent.OrderUpdated,
                    is com.example.restaurantpos.restaurantpo.smartorder.data.remote.SignalREvent.OrderCompleted,
                    is com.example.restaurantpos.restaurantpo.smartorder.data.remote.SignalREvent.TableUpdated -> {
                        loadTables()
                    }
                }
            }
        }
    }

    fun loadTables() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            // Always fetch ALL tables to support dynamic floors filtering
            getTablesUseCase().onSuccess { tables ->
                // Identify Take Away Table
                val takeAway = tables.find { 
                    it.tableNumber.equals("Mang về", ignoreCase = true) || 
                    it.tableNumber.equals("Mang ve", ignoreCase = true) ||
                    it.tableNumber.equals("Take Away", ignoreCase = true)
                }
                
                // Do NOT remove TakeAway from grid display, user wants it in grid
                // val displayTables = if (takeAway != null) tables.minus(takeAway) else tables

                _uiState.value = _uiState.value.copy(
                    allTables = tables, // Use full list
                    takeAwayTable = takeAway,
                    isLoading = false
                )
            }.onFailure { error ->
                _uiState.value = _uiState.value.copy(
                    error = error.message,
                    isLoading = false
                )
            }
        }
    }

    fun selectFloor(floor: String) {
        _uiState.value = _uiState.value.copy(selectedFloor = floor)
    }
    
    fun selectStatus(status: String) {
        _uiState.value = _uiState.value.copy(selectedStatus = status)
    }

    fun toggleTableSelection(tableId: Int) {
        val currentSelection = _uiState.value.selectedTables.toMutableSet()
        if (currentSelection.contains(tableId)) {
            currentSelection.remove(tableId)
        } else {
            currentSelection.add(tableId)
        }
        _uiState.value = _uiState.value.copy(selectedTables = currentSelection)
    }

    fun clearSelection() {
        _uiState.value = _uiState.value.copy(selectedTables = emptySet())
    }

    fun returnTable(tableId: Int) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            returnTableUseCase(tableId).onSuccess {
                _uiState.value = _uiState.value.copy(
                    successMessage = "Đã trả bàn thành công",
                    isLoading = false
                )
                loadTables()
            }.onFailure { error ->
                _uiState.value = _uiState.value.copy(
                    error = error.message,
                    isLoading = false
                )
            }
        }
    }

    fun mergeTables() {
        val selectedIds = _uiState.value.selectedTables.toList()
        if (selectedIds.size < 2) {
            _uiState.value = _uiState.value.copy(error = "Vui lòng chọn ít nhất 2 bàn để ghép")
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            mergeTablesUseCase(selectedIds).onSuccess { tableNumbers ->
                _uiState.value = _uiState.value.copy(
                    successMessage = "Đã ghép bàn $tableNumbers thành công",
                    selectedTables = emptySet(),
                    isLoading = false
                )
                loadTables()
            }.onFailure { error ->
                _uiState.value = _uiState.value.copy(
                    error = error.message,
                    isLoading = false
                )
            }
        }
    }

    fun splitTables(groupId: Int) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            splitTablesUseCase(groupId).onSuccess {
                _uiState.value = _uiState.value.copy(
                    successMessage = "Đã tách bàn thành công",
                    isLoading = false
                )
                loadTables()
            }.onFailure { error ->
                _uiState.value = _uiState.value.copy(
                    error = error.message,
                    isLoading = false
                )
            }
        }
    }

    fun openTakeAway() {
        val table = _uiState.value.takeAwayTable
        if (table == null) {
            _uiState.value = _uiState.value.copy(error = "Không tìm thấy bàn 'Mang về' trong hệ thống")
            return
        }
        
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(
                isLoadingTakeAway = true, 
                showTakeAwayDialog = true, 
                error = null
            )
            
            getOrdersByTableUseCase(table.id).onSuccess { orders ->
                 // Filter active orders
                 val activeOrders = orders.filter { it.status != "Completed" && it.status != "Cancelled" }
                 
                 _uiState.value = _uiState.value.copy(
                     takeAwayOrders = activeOrders,
                     isLoadingTakeAway = false
                 )
            }.onFailure {
                 _uiState.value = _uiState.value.copy(
                     isLoadingTakeAway = false,
                     error = "Lỗi tải đơn mang về: ${it.message}"
                 )
            }
        }
    }

    fun closeTakeAwayDialog() {
        _uiState.value = _uiState.value.copy(showTakeAwayDialog = false)
    }

    fun clearMessages() {
        _uiState.value = _uiState.value.copy(error = null, successMessage = null)
    }
}
