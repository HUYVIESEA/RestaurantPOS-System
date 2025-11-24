# 🖥️ Restaurant POS Desktop Application (WPF)

## ✅ Đã Hoàn Thành

### 1. Project Structure
```
RestaurantPOS.Desktop/
├── Views/              # XAML Views (Pages)
├── ViewModels/         # MVVM ViewModels
├── Models/             # Local models
├── Services/           # Business logic services
├── Data/               # Database context
├── Helpers/            # Utility classes
├── App.xaml           # Application resources & themes
└── MainWindow.xaml    # Main application window
```

### 2. NuGet Packages Installed
- ✅ **MaterialDesignThemes** (4.9.0) - Modern UI framework
- ✅ **MaterialDesignColors** (2.1.4) - Color themes
- ✅ **CommunityToolkit.Mvvm** (8.2.2) - MVVM helpers
- ✅ **Microsoft.EntityFrameworkCore.Sqlite** (8.0.0) - Offline database
- ✅ **Refit** (7.0.0) - HTTP client for API calls

### 3. Features Implemented

#### ✅ Material Design UI
- Modern, clean interface với Material Design
- Restaurant theme colors (Brown, Yellow, Green)
- Touch-friendly buttons (80px height)
- Responsive navigation drawer
- Custom styles cho Cards, Buttons, DataGrid

#### ✅ Navigation System
- Hamburger menu với drawer
- 6 main sections:
  - 📊 Dashboard
  - 🪑 Bàn ăn (Tables)
  - 🧾 Đơn hàng (Orders)
  - 🍜 thực đơn (Products)
  - 📈 Báo cáo (Reports)
  - 👥 Người dùng (Users)
  - ⚙️ Cài đặt (Settings)

#### ✅ Top AppBar
- Restaurant branding (BÚN ĐẬU MẸT)
- Sync status indicator
- Notifications badge
- User account menu

#### ✅ Status Bar
- Connection status (Online/Offline)
- Database sync status
- Version information

### 4. Shared Library
- ✅ **RestaurantPOS.Shared** - Models dùng chung với API
  - Order, OrderItem
  - Product, Category
  - Table, User
  - Offline sync properties

## 🚀 Cách Chạy

### 1. Build Project
```bash
cd RestaurantPOS.Desktop
dotnet build
```

### 2. Run Application
```bash
dotnet run
```

Hoặc mở trong Visual Studio và nhấn F5.

## 📋 Next Steps - Roadmap

### Phase 1: Core Views (Week 1)
- [ ] Create DashboardView.xaml
  - Statistics cards
  - Quick actions
  - Recent orders
  
- [ ] Create TablesView.xaml
  - Table grid layout
  - Available/Occupied status
  - Touch-friendly table buttons
  
- [ ] Create OrdersView.xaml
  - Orders DataGrid
  - Filter by status
  - Search functionality

### Phase 2: Services & Data (Week 2)
- [ ] Implement LocalDbContext (SQLite)
  - Configure Entity Framework
  - Create migrations
  - Seed initial data
  
- [ ] Implement ApiService (Refit)
  - Define API interfaces
  - Configure HttpClient
  - Handle authentication
  
- [ ] Implement SyncService
  - Auto-sync mechanism
  - Conflict resolution
  - Queue management

### Phase 3: ViewModels (Week 2)
- [ ] Create DashboardViewModel
- [ ] Create TablesViewModel
- [ ] Create OrdersViewModel
- [ ] Implement MVVM commands
- [ ] Add data binding

### Phase 4: Hardware Integration (Week 3)
- [ ] Thermal Printer Service
  - Install ESCPOS.NET package
  - Configure printer connection
  - Create receipt templates
  
- [ ] Barcode Scanner Support
  - USB/Serial input handling
  - Product lookup
  
- [ ] Cash Drawer Control
  - Printer-triggered opening

### Phase 5: Advanced Features (Week 3-4)
- [ ] Offline Mode
  - Local SQLite database
  - Queue unsaved changes
  - Auto-sync when online
  
- [ ] Multi-Window Support
  - Customer display
  - Kitchen display
  
- [ ] Auto-Update System
  - Squirrel.Windows integration
  - Version checking
  - Silent updates

### Phase 6: Polish & Deploy (Week 4)
- [ ] Error handling & logging
- [ ] User settings
- [ ] Keyboard shortcuts
- [ ] Create installer (WiX/Squirrel)
- [ ] User manual
- [ ] Training materials

## 🎨 Design Guidelines

### Colors
- **Primary**: `#8b5e34` (Bun Brown)
- **Secondary**: `#ffd700` (Bun Yellow)
- **Accent**: `#2e7d32` (Bun Green)

### Typography
- **Font Family**: Material Design Font (Roboto)
- **Touch Buttons**: 16px, SemiBold
- **Headers**: 24-32px, Bold
- **Body**: 14px, Regular

### Spacing
- **Card Padding**: 16px
- **Card Margin**: 8px
- **Button Height**: 40px (normal), 80px (touch)
- **Icon Size**: 24px (normal), 32px (large)

## 🔧 Configuration

### API Endpoint
Edit `appsettings.json` (to be created):
```json
{
  "ApiBaseUrl": "https://localhost:7001",
  "Database": {
    "ConnectionString": "Data Source=restaurant_pos.db"
  },
  "Printer": {
    "Type": "EPSON",
    "Interface": "USB",
    "Port": "COM3"
  }
}
```

## 📚 Resources

### Material Design
- [Material Design In XAML Toolkit](http://materialdesigninxaml.net/)
- [Material Design Icons](https://materialdesignicons.com/)

### MVVM
- [CommunityToolkit.Mvvm Docs](https://learn.microsoft.com/en-us/dotnet/communitytoolkit/mvvm/)

### Entity Framework
- [EF Core SQLite](https://learn.microsoft.com/en-us/ef/core/providers/sqlite/)

## 🐛 Known Issues
- ⚠️ Refit 7.0.0 has a known vulnerability - Consider upgrading to 7.1.0+
- ⚠️ Navigation views are placeholders - Need to implement actual views

## 📝 Notes
- This is a **Windows-only** application (WPF)
- Requires **.NET 8.0** or higher
- Designed for **touch screens** (buttons are 80px tall)
- Supports **offline mode** with local SQLite database
- Can integrate with **thermal printers** and **barcode scanners**

---

**Created**: 2025-11-22
**Version**: 1.0.0 (Foundation)
**Status**: ✅ Foundation Complete - Ready for View Development
