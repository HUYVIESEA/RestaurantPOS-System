import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Order } from '../../types';
import { tableService } from '../../services/tableService';
import { useToast } from '../../contexts/ToastContext';
import { TABLE_MESSAGES } from '../../constants/messages';
import TakeawayModal from './TakeawayModal';
import TableDetailModal from './TableDetailModal';
import { useSignalR } from '../../contexts/SignalRContext';
import { usePermissions } from '../../hooks/usePermissions';

const TableList: React.FC = () => {
    const navigate = useNavigate();
    const permissions = usePermissions();
    const { showToast } = useToast();
    const [tables, setTables] = useState<Table[]>([]);
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);
    const [takeawayTable, setTakeawayTable] = useState<Table | null>(null);
    const [showTakeawayModal, setShowTakeawayModal] = useState(false);
    const [selectedFloor, setSelectedFloor] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    
    const { connection, isConnected } = useSignalR();

    useEffect(() => {
        loadTables();
    }, []);

    useEffect(() => {
        if (connection && isConnected) {
            const handleTableUpdate = () => {
                console.log('⚡ Realtime update: Tables changed');
                loadTables();
            };

            connection.on('tableupdated', handleTableUpdate);
            connection.on('ordercreated', handleTableUpdate);
            connection.on('orderupdated', handleTableUpdate);
            connection.on('ordercompleted', handleTableUpdate);

            return () => {
                connection.off('tableupdated', handleTableUpdate);
                connection.off('ordercreated', handleTableUpdate);
                connection.off('orderupdated', handleTableUpdate);
                connection.off('ordercompleted', handleTableUpdate);
            };
        }
    }, [connection, isConnected]);

    const loadTables = async () => {
        try {
            const allTables = await tableService.getAll();
            
            const takeaway = allTables.find(t => {
                const normalizedNumber = t.tableNumber?.toLowerCase().trim() || '';
                return normalizedNumber.includes('mang') || 
                       normalizedNumber === 'takeaway' ||
                       t.id === 100;
            });

            if (takeaway) {
                setTakeawayTable(takeaway);
                const filtered = allTables.filter(t => {
                    const normalizedNumber = t.tableNumber?.toLowerCase().trim() || '';
                    return !normalizedNumber.includes('mang') && 
                           normalizedNumber !== 'takeaway' &&
                           t.id !== 100 && t.id !== 51;
                });
                setTables(filtered);
            } else {
                setTables(allTables);
            }
        } catch (err) {
            console.error('Error loading tables:', err);
            showToast(TABLE_MESSAGES.LOAD_ERROR, 'error');
        }
    };

    const handleTableClick = (table: Table) => {
        if (table.isAvailable) {
            navigate(`/orders/new?tableId=${table.id}`);
        } else {
            setSelectedTable(table);
        }
    };

    const handleConfirmCreateOrder = () => {
        if (selectedTable) {
            navigate(`/orders/new?tableId=${selectedTable.id}`);
            setSelectedTable(null);
        }
    };

    const handleSelectOrder = (order: Order) => {
        navigate(`/orders/${order.id}`);
        setSelectedTable(null);
    };

    const handlePaymentOrder = (order: Order) => {
        navigate(`/orders/${order.id}?action=payment`);
        setSelectedTable(null);
    };

    const handleTakeawayClick = () => {
        if (takeawayTable) {
            setShowTakeawayModal(true);
        } else {
            navigate(`/orders/new?takeaway=true`);
        }
    };

    const handleSelectTakeawayOrder = async (order: Order) => {
        navigate(`/orders/${order.id}`);
    };

    const handleCreateNewTakeaway = () => {
        if (!takeawayTable) return;
        navigate(`/orders/new?tableId=${takeawayTable.id}&takeaway=true`);
    };

    const toggleSortOrder = () => {
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    };

    const filteredTables = tables
        .filter(table => {
            const floorMatch = selectedFloor === 'All' || table.floor === selectedFloor;
            const searchMatch = searchQuery === '' || 
                table.tableNumber.toLowerCase().includes(searchQuery.toLowerCase());
            return floorMatch && searchMatch;
        })
        .sort((a, b) => {
            const aNum = a.tableNumber.match(/\d+/);
            const bNum = b.tableNumber.match(/\d+/);
            const aPrefix = a.tableNumber.replace(/\d+/g, '');
            const bPrefix = b.tableNumber.replace(/\d+/g, '');
            
            if (aPrefix !== bPrefix) {
                return sortOrder === 'asc' 
                    ? aPrefix.localeCompare(bPrefix)
                    : bPrefix.localeCompare(aPrefix);
            }
            
            const aNumber = aNum ? parseInt(aNum[0]) : 0;
            const bNumber = bNum ? parseInt(bNum[0]) : 0;
            
            return sortOrder === 'asc' ? aNumber - bNumber : bNumber - aNumber;
        });

    const floors = ['All', ...Array.from(new Set(
        tables
            .map(t => t.floor)
            .filter(floor => floor && !floor.toLowerCase().includes('mang'))
    ))];

    return (
        <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-64px)] transition-colors">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <i className="fas fa-th text-blue-600 dark:text-blue-500"></i>
                        Sơ đồ bàn
                    </h2>
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 block">
                        {tables.length} bàn • {tables.filter(t => !t.isAvailable).length} đang phục vụ
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    {permissions.tables.canCreate && (
                        <button 
                            className="flex-1 md:flex-none min-h-[44px] px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                            onClick={() => navigate('/tables/new')}
                        >
                            <i className="fas fa-plus"></i>
                            Thêm bàn
                        </button>
                    )}
                    <button 
                        className="flex-1 md:flex-none min-h-[44px] px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                        onClick={handleTakeawayClick}
                    >
                        <i className="fas fa-shopping-bag"></i>
                        Mang về
                    </button>
                    <button 
                        className="min-h-[44px] w-11 h-11 flex-shrink-0 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl shadow-sm transition-colors flex items-center justify-center"
                        onClick={toggleSortOrder}
                        title={sortOrder === 'asc' ? 'Sắp xếp A-Z' : 'Sắp xếp Z-A'}
                    >
                        <i className={`fas fa-sort-alpha-${sortOrder === 'asc' ? 'down' : 'up'}`}></i>
                    </button>
                    <button 
                        className="min-h-[44px] w-11 h-11 flex-shrink-0 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl shadow-sm transition-colors flex items-center justify-center"
                        onClick={loadTables}
                        title="Làm mới"
                    >
                        <i className="fas fa-sync"></i>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {floors.map(floor => (
                        <button
                            key={floor}
                            className={`min-h-[44px] px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                                selectedFloor === floor 
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' 
                                    : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                            }`}
                            onClick={() => setSelectedFloor(floor)}
                        >
                            {floor === 'All' ? 'Tất cả tầng' : floor}
                        </button>
                    ))}
                </div>
                <div className="relative md:ml-auto md:w-64">
                    <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input
                        type="text"
                        placeholder="Tìm bàn..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors"
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                {filteredTables.map(table => {
                    const statusColor = table.isAvailable 
                        ? 'bg-blue-50 text-blue-700 border-blue-100 hover:border-blue-300 dark:bg-blue-900/20 dark:text-blue-500 dark:border-blue-900/50' 
                        : (table.isMerged 
                            ? 'bg-purple-50 text-purple-600 border-purple-100 hover:border-purple-300 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800/50' 
                            : 'bg-rose-50 text-rose-600 border-rose-100 hover:border-rose-300 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/50');
                    
                    const dotColor = table.isAvailable ? 'bg-blue-600' : (table.isMerged ? 'bg-purple-500' : 'bg-rose-500');

                    // Logic tính số lượng ghế (hiển thị đối xứng trên/dưới)
                    const capacity = table.capacity || 4;
                    const topChairs = Math.ceil(capacity / 2);
                    const bottomChairs = Math.floor(capacity / 2);

                    // Thay đổi hình dáng bàn (Tròn cho <=2 người, Vuông/Chữ nhật cho >=4 người)
                    const isRound = capacity <= 2;
                    const tableShapeClass = isRound ? 'rounded-full w-14 h-14' : 'rounded-xl w-20 h-14';

                    return (
                        <div
                            key={table.id}
                            className={`relative group flex flex-col items-center justify-center p-2 h-32 rounded-xl cursor-pointer transition-all transform hover:-translate-y-1 hover:shadow-md border ${statusColor}`}
                            onClick={() => handleTableClick(table)}
                        >
                            {/* Khu vực trung tâm: Bàn và Ghế */}
                            <div className="relative flex items-center justify-center w-full mt-2">
                                {/* Ghế phía trên */}
                                <div className="absolute -top-2.5 left-0 right-0 flex justify-center gap-1.5">
                                    {Array.from({length: Math.min(topChairs, 4)}).map((_, i) => (
                                        <div key={`top-${i}`} className={`w-4 h-2.5 rounded-t-md opacity-80 ${dotColor}`}></div>
                                    ))}
                                </div>

                                {/* Mặt bàn */}
                                <div className={`relative flex items-center justify-center border-2 border-current shadow-sm bg-white/60 dark:bg-slate-800/60 z-10 ${tableShapeClass}`}>
                                    <span className="text-base font-bold text-slate-800 dark:text-slate-100">
                                        {table.tableNumber}
                                    </span>
                                </div>

                                {/* Ghế phía dưới */}
                                <div className="absolute -bottom-2.5 left-0 right-0 flex justify-center gap-1.5">
                                    {Array.from({length: Math.min(bottomChairs, 4)}).map((_, i) => (
                                        <div key={`bottom-${i}`} className={`w-4 h-2.5 rounded-b-md opacity-80 ${dotColor}`}></div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Sức chứa hiển thị như badge nhỏ phía dưới */}
                            <div className="mt-5 flex items-center gap-1.5 bg-white/80 dark:bg-slate-800/80 px-2 py-0.5 rounded-full text-[10px] font-semibold text-slate-600 dark:text-slate-300 shadow-sm border border-slate-100 dark:border-slate-700">
                                <i className="fas fa-user-friends opacity-70"></i>
                                <span>{capacity}</span>
                            </div>

                            {!table.isAvailable && table.occupiedAt && (
                                <div className="absolute -top-2 -right-2 z-20">
                                    <div className="bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm border border-rose-100 dark:border-rose-800 flex items-center gap-1">
                                        <i className="far fa-clock"></i>
                                        {calculateDuration(table.occupiedAt)}
                                    </div>
                                </div>
                            )}

                            {/* Edit Button for Admin/Manager */}
                            {permissions.tables.canEdit && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/tables/edit/${table.id}`);
                                    }}
                                    className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all rounded-lg hover:bg-white/50 dark:hover:bg-slate-800/50"
                                    title="Sửa bàn"
                                >
                                    <i className="fas fa-pen-to-square text-xs"></i>
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Legend Map below grid like the image */}
            <div className="mt-6 flex items-center justify-center sm:justify-start gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-600"></span> Trống
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500"></span> Có khách
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-purple-500"></span> Đang nhập / Ghép
                </div>
            </div>

            {filteredTables.length === 0 && (
                <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                        <i className="fas fa-search text-2xl text-slate-400"></i>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Không tìm thấy bàn nào phù hợp.</p>
                </div>
            )}

            {showTakeawayModal && takeawayTable && (
                <TakeawayModal
                    takeawayTableId={takeawayTable.id}
                    onClose={() => setShowTakeawayModal(false)}
                    onSelectOrder={handleSelectTakeawayOrder}
                    onCreateNew={handleCreateNewTakeaway}
                />
            )}

            {selectedTable && (
                <TableDetailModal
                    table={selectedTable}
                    onClose={() => setSelectedTable(null)}
                    onSelectOrder={handleSelectOrder}
                    onCreateOrder={handleConfirmCreateOrder}
                    onPayment={handlePaymentOrder}
                />
            )}
        </div>
    );
};

const calculateDuration = (occupiedAt: string): string => {
    const start = new Date(occupiedAt).getTime();
    const now = new Date().getTime();
    const minutes = Math.floor((now - start) / 60000);
    
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
};

export default TableList;
