import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Order } from '../../types';
import { tableService } from '../../services/tableService';
import { useToast } from '../../contexts/ToastContext';
import TakeawayModal from './TakeawayModal';
import TableDetailModal from './TableDetailModal'; // ✅ Import Modal
import './TableList.css';

const TableList: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [tables, setTables] = useState<Table[]>([]);
    const [selectedTable, setSelectedTable] = useState<Table | null>(null); // ✅ For Detail Modal
    const [takeawayTable, setTakeawayTable] = useState<Table | null>(null);
    const [loading, setLoading] = useState(true);
    const [showTakeawayModal, setShowTakeawayModal] = useState(false); // Legacy modal (can keep or remove)
    const [selectedFloor, setSelectedFloor] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // A-Z or Z-A

    useEffect(() => {
        loadTables();
    }, []);

    const loadTables = async () => {
        try {
            setLoading(true);
            const allTables = await tableService.getAll();
            
            // Separate "Mang về" from regular tables (like Desktop)
            // Use includes() for better Vietnamese character handling
            const takeaway = allTables.find(t => {
                const normalizedNumber = t.tableNumber?.toLowerCase().trim() || '';
                return normalizedNumber.includes('mang') || 
                       normalizedNumber === 'takeaway' ||
                       t.id === 100; // Fallback: check by ID
            });

            if (takeaway) {
                setTakeawayTable(takeaway);
                // Remove ALL takeaway tables from regular list (not just first match)
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
            showToast('Lỗi tải danh sách bàn', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleTableClick = (table: Table) => {
        // ✅ Show Modal instead of navigating directly
        setSelectedTable(table);
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

    const handleTakeawayClick = () => {
        if (takeawayTable) {
            setShowTakeawayModal(true);
        } else {
            // If no takeaway table exists, try to create order without table ID (or specific signal)
            navigate(`/orders/new?takeaway=true`);
        }
    };

    const handleSelectTakeawayOrder = async (order: Order) => {
        // Navigate to edit existing takeaway order
        navigate(`/orders/${order.id}`);
    };

    const handleCreateNewTakeaway = () => {
        if (!takeawayTable) return;
        // Navigate to create new takeaway order
        navigate(`/orders/new?tableId=${takeawayTable.id}&takeaway=true`);
    };

    const toggleSortOrder = () => {
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    };

    // Filter and sort tables
    const filteredTables = tables
        .filter(table => {
            const floorMatch = selectedFloor === 'All' || table.floor === selectedFloor;
            const searchMatch = searchQuery === '' || 
                table.tableNumber.toLowerCase().includes(searchQuery.toLowerCase());
            return floorMatch && searchMatch;
        })
        .sort((a, b) => {
            // Natural sort for table numbers (B10 < B2 would be wrong, this fixes it)
            const aNum = a.tableNumber.match(/\d+/);
            const bNum = b.tableNumber.match(/\d+/);
            const aPrefix = a.tableNumber.replace(/\d+/g, '');
            const bPrefix = b.tableNumber.replace(/\d+/g, '');
            
            // Compare prefixes first (B vs T, etc.)
            if (aPrefix !== bPrefix) {
                return sortOrder === 'asc' 
                    ? aPrefix.localeCompare(bPrefix)
                    : bPrefix.localeCompare(aPrefix);
            }
            
            // Same prefix, compare numbers
            const aNumber = aNum ? parseInt(aNum[0]) : 0;
            const bNumber = bNum ? parseInt(bNum[0]) : 0;
            
            return sortOrder === 'asc' ? aNumber - bNumber : bNumber - aNumber;
        });

    // Get unique floors (exclude "Mang về" since it's handled separately)
    const floors = ['All', ...Array.from(new Set(
        tables
            .map(t => t.floor)
            .filter(floor => floor && !floor.toLowerCase().includes('mang'))
    ))];

    // Loading disabled - render content immediately
    // if (loading) {
    //     return <Loading message="Đang tải sơ đồ bàn..." fullScreen={true} />;
    // }

    return (
        <div className="table-list-container">
            <div className="table-list-header">
                <div className="header-left">
                    <h2>
                        <i className="fas fa-th"></i>
                        Sơ đồ bàn
                    </h2>
                    <span className="table-count">
                        {tables.length} bàn • {tables.filter(t => !t.isAvailable).length} đang phục vụ
                    </span>
                </div>
                <div className="header-actions">
                    <button 
                        className="btn-takeaway"
                        onClick={handleTakeawayClick}
                    >
                        <i className="fas fa-shopping-bag"></i>
                        Mang về
                    </button>
                    <button 
                        className="btn-sort" 
                        onClick={toggleSortOrder}
                        title={sortOrder === 'asc' ? 'Sắp xếp A-Z' : 'Sắp xếp Z-A'}
                    >
                        <i className={`fas fa-sort-alpha-${sortOrder === 'asc' ? 'down' : 'up'}`}></i>
                    </button>
                    <button className="btn-refresh" onClick={loadTables}>
                        <i className="fas fa-sync"></i>
                    </button>
                </div>
            </div>

            <div className="table-filters">
                <div className="floor-filters">
                    {floors.map(floor => (
                        <button
                            key={floor}
                            className={`filter-btn ${selectedFloor === floor ? 'active' : ''}`}
                            onClick={() => setSelectedFloor(floor)}
                        >
                            {floor}
                        </button>
                    ))}
                </div>
                <div className="search-box">
                    <i className="fas fa-search"></i>
                    <input
                        type="text"
                        placeholder="Tìm bàn..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="tables-grid">
                {filteredTables.map(table => (
                    <div
                        key={table.id}
                        className={`table-card ${table.isAvailable ? 'available' : 'occupied'} ${table.isMerged ? 'merged' : ''}`}
                        onClick={() => handleTableClick(table)}
                    >
                        <div className="table-card-header">
                            <span className="table-number">{table.tableNumber}</span>
                            {table.isMerged && (
                                <span className="merge-badge">
                                    <i className="fas fa-link"></i>
                                </span>
                            )}
                        </div>
                        <div className="table-card-body">
                            <div className="table-capacity">
                                <i className="fas fa-user"></i>
                                <span>{table.capacity}</span>
                            </div>
                            <div className={`table-status ${table.isAvailable ? 'available' : 'occupied'}`}>
                                {table.isAvailable ? 'Trống' : 'Đang phục vụ'}
                            </div>
                        </div>
                        {!table.isAvailable && table.occupiedAt && (
                            <div className="table-duration">
                                <i className="far fa-clock"></i>
                                <span>{calculateDuration(table.occupiedAt)}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {showTakeawayModal && takeawayTable && (
                <TakeawayModal
                    takeawayTableId={takeawayTable.id}
                    onClose={() => setShowTakeawayModal(false)}
                    onSelectOrder={handleSelectTakeawayOrder}
                    onCreateNew={handleCreateNewTakeaway}
                />
            )}

            {/* ✅ Table Detail Modal */}
            {selectedTable && (
                <TableDetailModal
                    table={selectedTable}
                    onClose={() => setSelectedTable(null)}
                    onSelectOrder={handleSelectOrder}
                    onCreateOrder={handleConfirmCreateOrder}
                />
            )}
        </div>
    );
};

// Helper function
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
