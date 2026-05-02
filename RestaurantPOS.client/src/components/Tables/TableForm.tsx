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
  const [existingFloors, setExistingFloors] = useState<string[]>([]);
  const [isFloorDropdownOpen, setIsFloorDropdownOpen] = useState(false);

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

    // ✅ Use the current floor input
    const finalFloor = formData.floor.trim();

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
  <button onClick={() => navigate('/tables')} className="text-blue-700 dark:text-blue-500 hover:text-blue-900 dark:hover:text-blue-300 font-medium py-2 px-4 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors touch-manipulation">
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
       className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
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
      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
          />
 {formData.capacity && (
   <small className="text-xs text-gray-500 dark:text-gray-400 mt-1">
      👥 {formData.capacity} người
              </small>
            )}
          </div>
        </div>

   {/* ✅ Custom Combobox for Floor Selection */}
      <div className="flex flex-col gap-2 relative">
          <label htmlFor="floor" className="text-sm font-medium text-gray-700 dark:text-gray-300">Tầng / Khu vực *</label>
          <div className="relative">
            <input
              type="text"
              id="floor"
              name="floor"
              value={formData.floor}
              onChange={handleChange}
              onFocus={() => setIsFloorDropdownOpen(true)}
              onBlur={() => setTimeout(() => setIsFloorDropdownOpen(false), 200)}
              required
              placeholder="Chọn hoặc nhập khu vực mới (VD: Tầng 3...)"
              maxLength={50}
              className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
              autoComplete="off"
            />
            <div 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer p-2 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
              onMouseDown={(e) => {
                e.preventDefault(); // Giữ focus cho input
                setIsFloorDropdownOpen(!isFloorDropdownOpen);
              }}
            >
              <i className={`fas fa-chevron-${isFloorDropdownOpen ? 'up' : 'down'} text-sm`}></i>
            </div>
          </div>
          
          {isFloorDropdownOpen && (
            <div className="absolute top-[84px] left-0 right-0 z-50 mt-1 max-h-60 overflow-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl">
              {allFloorOptions
                .filter(floor => 
                  !formData.floor || 
                  allFloorOptions.includes(formData.floor) || // Nếu đã chọn/có sẵn tên hoàn chỉnh thì hiện tất cả
                  floor.toLowerCase().includes(formData.floor.toLowerCase())
                )
                .map(floor => (
                <div 
                  key={floor} 
                  className={`px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer text-gray-800 dark:text-gray-200 transition-colors ${formData.floor === floor ? 'bg-blue-50 dark:bg-gray-700 font-medium text-blue-700 dark:text-blue-400' : ''}`}
                  onClick={() => {
                    setFormData(prev => ({ ...prev, floor }));
                    setIsFloorDropdownOpen(false);
                  }}
                >
                  {floor} {existingFloors.includes(floor) && <span className="text-xs text-blue-600 dark:text-blue-400 ml-2">(đang dùng)</span>}
                </div>
              ))}
              {formData.floor && !allFloorOptions.includes(formData.floor) && (
                <div 
                  className="px-4 py-3 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 italic font-medium cursor-pointer"
                  onClick={() => setIsFloorDropdownOpen(false)}
                >
                  <i className="fas fa-plus-circle mr-2"></i>
                  Tạo khu vực mới: "{formData.floor}"
                </div>
              )}
            </div>
          )}
          <small className="text-xs text-gray-500 dark:text-gray-400">
             <i className="fa-solid fa-lightbulb text-yellow-500 mr-1"></i> Bạn có thể bấm mũi tên để chọn, hoặc gõ trực tiếp tên khu vực mới vào ô.
          </small>
        </div>

        {/* ✅ Show existing floors count */}
        {existingFloors.length > 0 && (
  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900/50 mt-2">
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
 className="w-5 h-5 text-blue-700 rounded border-gray-300 focus:ring-blue-600 dark:border-gray-600 dark:bg-gray-700"
   />
     <span className="text-gray-800 dark:text-white font-medium">Bàn đang trống</span>
          </label>
     </div>

  <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100 dark:border-gray-700 mt-8">
          <button type="button" onClick={() => navigate('/tables')} className="py-3 px-6 rounded-xl font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex-1 text-center touch-manipulation">
            Hủy
    </button>
   <button type="submit" disabled={loading} className="py-3 px-6 rounded-xl font-semibold text-white bg-blue-700 hover:bg-blue-800 shadow-md shadow-blue-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-1 text-center touch-manipulation">
 {loading ? 'Đang xử lý...' : (isEditMode ? 'Cập nhật' : 'Thêm mới')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TableForm;
