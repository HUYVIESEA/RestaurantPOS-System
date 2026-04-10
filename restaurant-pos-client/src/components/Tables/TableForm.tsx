import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { tableService } from '../../services/tableService';
import { Table } from '../../types';

const TableForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    tableNumber: '',
    capacity: '',
    floor: 'Tầng 1',
    isAvailable: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingFloors, setExistingFloors] = useState<string[]>([]); // ✅ Dynamic floors
  const [showCustomFloor, setShowCustomFloor] = useState(false); // ✅ Custom floor input
  const [customFloorName, setCustomFloorName] = useState('');

  // ✅ Suggested floor names
  const suggestedFloors = [
    'Tầng 1', 'Tầng 2', 'Tầng 3', 'Tầng 4', 'Tầng 5',
    'Tầng trệt', 'Tầng lửng', 'Sân thượng', 
    'Khu VIP', 'Khu ngoài trời', 'Khu gia đình'
  ];

  useEffect(() => {
    fetchExistingFloors();
    if (isEditMode) {
      fetchTable();
    }
  }, [id]);

  // ✅ Fetch existing floors from current tables
  const fetchExistingFloors = async () => {
    try {
      const tables = await tableService.getAll();
      const floors = Array.from(new Set(tables.map(t => t.floor))).sort();
      setExistingFloors(floors);
    } catch (err) {
      console.error('Error fetching floors:', err);
    }
  };

  const fetchTable = async () => {
    try {
      const table = await tableService.getById(Number(id));
      setFormData({
        tableNumber: table.tableNumber,
        capacity: table.capacity.toString(),
        floor: table.floor,
        isAvailable: table.isAvailable,
      });
    } catch (err) {
      setError('Không thể tải thông tin bàn');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const capacityValue = Number(formData.capacity);
    if (isNaN(capacityValue) || capacityValue < 1 || capacityValue > 20) {
      setError('Sức chứa phải từ 1-20 người');
      setLoading(false);
      return;
    }

    // ✅ Use custom floor name if provided
    const finalFloor = showCustomFloor && customFloorName.trim() 
    ? customFloorName.trim() 
      : formData.floor;

    if (!finalFloor) {
      setError('Vui lòng chọn hoặc nhập tên tầng');
      setLoading(false);
      return;
    }

    try {
      const tableData: Partial<Table> = {
        tableNumber: formData.tableNumber,
        capacity: capacityValue,
 floor: finalFloor,
        isAvailable: formData.isAvailable,
        id: isEditMode ? Number(id) : 0,
      };

 if (isEditMode) {
   await tableService.update(Number(id), tableData as Table);
      } else {
        await tableService.create(tableData as Omit<Table, 'id'>);
      }

      navigate('/tables');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đã xảy ra lỗi');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
  ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (name === 'capacity') {
      if (value === '' || /^\d+$/.test(value)) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
  setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // ✅ Merge existing and suggested floors, remove duplicates
  const allFloorOptions = Array.from(new Set([
    ...existingFloors,
    ...suggestedFloors.filter(sf => !existingFloors.includes(sf))
  ]));

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6 sm:mb-8">
     <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{isEditMode ? 'Cập nhật bàn' : 'Thêm bàn mới'}</h2>
  <button onClick={() => navigate('/tables')} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium py-2 px-4 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors touch-manipulation">
          ← Quay lại
        </button>
      </div>

      {error && <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl mb-6">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="tableNumber" className="text-sm font-medium text-gray-700 dark:text-gray-300">Số bàn *</label>
            <input
        type="text"
          id="tableNumber"
     name="tableNumber"
      value={formData.tableNumber}
  onChange={handleChange}
  required
     placeholder="VD: B01, B02..."
       maxLength={20}
       className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
     />
          </div>

          <div className="flex flex-col gap-2">
        <label htmlFor="capacity" className="text-sm font-medium text-gray-700 dark:text-gray-300">Số người *</label>
            <input
      type="text"
              id="capacity"
          name="capacity"
              value={formData.capacity}
     onChange={handleChange}
        required
              placeholder="Số người"
      inputMode="numeric"
      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          />
 {formData.capacity && (
   <small className="text-xs text-gray-500 dark:text-gray-400 mt-1">
      👥 {formData.capacity} người
              </small>
            )}
          </div>
        </div>

   {/* ✅ Enhanced Floor Selection */}
      <div className="flex flex-col gap-2">
          <label htmlFor="floor" className="text-sm font-medium text-gray-700 dark:text-gray-300">Tầng / Khu vực *</label>
      
 {!showCustomFloor ? (
<>
   <select
   id="floor"
      name="floor"
       value={formData.floor}
      onChange={handleChange}
      required
      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
    >
     {allFloorOptions.map(floor => (
<option key={floor} value={floor}>
   {floor}
  {existingFloors.includes(floor) ? ' (đang sử dụng)' : ''}
</option>
        ))}
 </select>
        <button
                type="button"
            className="mt-2 text-sm text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 hover:text-blue-800 dark:hover:text-blue-300 py-2 touch-manipulation"
        onClick={() => setShowCustomFloor(true)}
    >
         ➕ Thêm tầng mới
           </button>
     </>
          ) : (
   <>
  <input
                type="text"
      value={customFloorName}
        onChange={(e) => setCustomFloorName(e.target.value)}
    placeholder="Nhập tên tầng mới (VD: Tầng 3, Khu VIP...)"
      maxLength={50}
                autoFocus
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
           <div className="flex items-center justify-between mt-2">
     <button
  type="button"
    className="text-sm text-red-500 hover:text-red-700 py-1 px-2 rounded touch-manipulation"
        onClick={() => {
               setShowCustomFloor(false);
  setCustomFloorName('');
       }}
         >
        ✗ Hủy
        </button>
                <small className="text-xs text-gray-500 dark:text-gray-400">
          💡 Tầng mới sẽ tự động xuất hiện trong danh sách
          </small>
              </div>
        </>
          )}
        </div>

        {/* ✅ Show existing floors count */}
        {existingFloors.length > 0 && !showCustomFloor && (
  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800/50 mt-2">
   <small className="text-sm text-gray-700 dark:text-gray-300">
      📊 Hiện có <strong className="font-bold">{existingFloors.length} tầng</strong>: {existingFloors.join(', ')}
       </small>
          </div>
        )}

        <div className="mt-6">
      <label className="flex items-center gap-3 cursor-pointer select-none p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
       <input
type="checkbox"
              name="isAvailable"
          checked={formData.isAvailable}
 onChange={handleChange}
 className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
   />
     <span className="text-gray-800 dark:text-white font-medium">Bàn đang trống</span>
          </label>
     </div>

  <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100 dark:border-gray-700 mt-8">
          <button type="button" onClick={() => navigate('/tables')} className="py-3 px-6 rounded-xl font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex-1 text-center touch-manipulation">
            Hủy
    </button>
   <button type="submit" disabled={loading} className="py-3 px-6 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-1 text-center touch-manipulation">
 {loading ? 'Đang xử lý...' : (isEditMode ? 'Cập nhật' : 'Thêm mới')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TableForm;
