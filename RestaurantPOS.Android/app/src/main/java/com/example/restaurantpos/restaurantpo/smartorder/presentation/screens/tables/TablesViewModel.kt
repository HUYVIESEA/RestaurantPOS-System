package com.example.restaurantpos.restaurantpo.smartorder.presentation.screens.tables

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.restaurantpos.restaurantpo.smartorder.domain.model.Table
import com.example.restaurantpos.restaurantpo.smartorder.domain.usecase.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class TablesUiState(
    val tables: List<Table> = emptyList(),
    val selectedFloor: String = "Tầng 1",
    val floors: List<String> = listOf(
        "Tầng 1", "Tầng 2", "Tầng 3", "Tầng 4", "Tầng 5", 
        "Tầng trệt", "Tầng lửng", "Sân thượng", 
        "Khu VIP", "Khu gia đình", "Khu ngoài trời"
    ),
    val selectedStatus: String = "Tất cả", // NEW: Status filter
    val selectedTables: Set<Int> = emptySet(),
    val isLoading: Boolean = false,
    val error: String? = null,
    val successMessage: String? = null
) {
    // Computed property for filtered tables
    val filteredTables: List<Table>
        get() = when (selectedStatus) {
            "Trống" -> tables.filter { it.isAvailable }
            "Đang dùng" -> tables.filter { !it.isAvailable }
            else -> tables // "Tất cả"
        }
}

@HiltViewModel
class TablesViewModel @Inject constructor(
    private val getTablesUseCase: GetTablesUseCase,
    private val getTablesByFloorUseCase: GetTablesByFloorUseCase,
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
                        // Reload tables when any order/table event occurs
                        loadTables()
                    }
                }
            }
        }
    }

    fun loadTables() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            val result = if (_uiState.value.selectedFloor == "Tất cả") {
                getTablesUseCase()
            } else {
                getTablesByFloorUseCase(_uiState.value.selectedFloor)
            }
            
            result.onSuccess { tables ->
                _uiState.value = _uiState.value.copy(
                    tables = tables,
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
        loadTables()
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

    fun clearMessages() {
        _uiState.value = _uiState.value.copy(error = null, successMessage = null)
    }
}
