# KiotViet UI Update - Implementation Plan

## 📋 Current Status (Updated Components)

✅ **Completed Components:**
1. **Navbar** - Blue gradient header, modern navigation
2. **KitchenView** - Android-style tabs, order cards with takeaway support
3. **TableList** - Grid layout, orange takeaway button, sorting feature
4. **TakeawayModal** - Modal for managing multiple takeaway orders
5. **OrderList** - Status cards, takeaway icon (partial update)
6. **Theme Variables** - Global KiotViet color palette in theme.css & index.css

## 🎯 Components To Update (Priority Order)

### **Priority 1: Core User Flows** (Most used)
1. **Dashboard** - Main overview page
2. **OrderForm** - Create/Edit orders (critical workflow)
3. **OrderDetail** - View order details
4. **Products/ProductList** - Product catalog
5. **Categories/CategoryList** - Category management

### **Priority 2: Admin & Reports**
6. **Analytics** - Analytics dashboard
7. **Reports** - Reporting interface
8. **Statistics** - Statistics cards
9. **Charts** - Chart components

### **Priority 3: User Management**
10. **UserList** - Employee management
11. **UserProfile** - User profile page
12. **UserForm** - Edit user form

### **Priority 4: Settings & Forms**
13. **ProductForm** - Add/Edit products
14. **CategoryForm** - Add/Edit categories
15. **TableForm** - Add/Edit tables

### **Priority 5: Auth & Misc**
16. **Login** - Login page (already has some styling)
17. **Register** - Registration page
18. **Payment Components** - VnPay integration UI

---

## 🎨 KiotViet Design Principles

### **Color Palette:**
- **Primary Blue**: `#0060C0` (main actions, headers)
- **Secondary Blue**: `#0078D4` (hover states)
- **Orange**: `#FF6F00` (highlights, warnings)
- **Green**: `#4CAF50` (success states)
- **Red**: `#F44336` (errors, delete)
- **Gray Scale**: Clean backgrounds, subtle borders

### **Components Style:**
- **Cards**: White bg, subtle shadow, 12px border-radius
- **Buttons**: Solid colors, 8px border-radius, hover lift
- **Tables/Grids**: Clean lines, hover highlights
- **Status Badges**: Rounded pills with semantic colors
- **Headers**: Blue gradient like navbar
- **Icons**: FontAwesome, consistent sizing

### **Layout:**
- **Spacing**: Generous padding (1.5-2rem)
- **Grid**: Responsive, auto-fill minmax
- **Typography**: Bold headers, clear hierarchy
- **Dark Mode**: Full support with `[data-theme="dark"]`

---

## 📝 Update Tasks (Step by Step)

### **Phase 1: Dashboard & Orders (Days 1-2)**

#### 1.1 Dashboard.tsx + Dashboard.css
- [ ] Welcome header with blue gradient
- [ ] Statistics cards grid (4 columns)
- [ ] Quick action buttons (large, colorful)
- [ ] Recent orders table (clean, modern)
- [ ] Revenue chart integration

#### 1.2 OrderForm.tsx + OrderForm.css
- [ ] Two-panel layout (products + cart)
- [ ] Product grid with search/filter
- [ ] Shopping cart sidebar (sticky)
- [ ] Customer name input (for takeaway)
- [ ] Table selector (handle takeaway=true param)
- [ ] Payment button (prominent, green)

#### 1.3 OrderDetail.tsx + OrderDetail.css
- [ ] Order header (status, time, customer)
- [ ] Items table (clean styling)
- [ ] Action buttons (Edit, Cancel, Print)
- [ ] Timeline/history section

---

### **Phase 2: Products & Categories (Days 3-4)**

#### 2.1 ProductList.tsx + ProductList.css
- [ ] Header with search, filter, add button
- [ ] Product cards grid or table view toggle
- [ ] Category filter pills
- [ ] Price display, stock status
- [ ] Quick edit buttons

#### 2.2 ProductForm.tsx + ProductForm.css
- [ ] Modern form layout
- [ ] Image upload preview
- [ ] Category dropdown
- [ ] Price/stock inputs
- [ ] Save/Cancel buttons

#### 2.3 CategoryList.tsx + CategoryList.css
- [ ] Simple card/table layout
- [ ] Add category modal
- [ ] Edit inline or modal
- [ ] Delete confirmation

#### 2.4 CategoryForm.tsx
- [ ] Modal or sidebar form
- [ ] Name, description inputs
- [ ] Color picker for category badge

---

### **Phase 3: Analytics & Reports (Day 5)**

#### 3.1 Analytics.tsx + Analytics.css
- [ ] Dashboard layout with charts
- [ ] Date range picker
- [ ] KPI cards
- [ ] Chart.js integration styling

#### 3.2 Reports.tsx + Reports.css
- [ ] Report selector
- [ ] Filter options
- [ ] Table view with export
- [ ] Print-friendly layout

#### 3.3 Statistics.tsx + Statistics.css
- [ ] Stat card components
- [ ] Trend indicators (up/down arrows)
- [ ] Comparison percentages

---

### **Phase 4: User Management (Day 6)**

#### 4.1 UserList.tsx + UserList.css
- [ ] Employee table with avatar
- [ ] Role badges
- [ ] Status indicators
- [ ] Action buttons

#### 4.2 UserProfile.tsx + UserProfile.css
- [ ] Profile header with avatar
- [ ] Info cards
- [ ] Activity timeline
- [ ] Edit button

#### 4.3 UserForm.tsx
- [ ] User details form
- [ ] Role selector
- [ ] Avatar upload

---

### **Phase 5: Forms & Misc (Day 7)**

#### 5.1 TableForm.tsx
- [ ] Simple form for table details
- [ ] Floor selector
- [ ] Capacity input

#### 5.2 Login.tsx + Login.css (refinement)
- [ ] Review and polish existing design
- [ ] Ensure KiotViet branding

#### 5.3 Payment Components
- [ ] VnPayButton styling
- [ ] PaymentResult success/failure pages

---

## 🚀 Implementation Strategy

1. **Start with most-used components** (Dashboard, OrderForm)
2. **Create reusable CSS patterns** (don't repeat)
3. **Test on both light and dark mode**
4. **Ensure mobile responsiveness**
5. **Keep debug logs minimal** (remove after testing)

---

## 📌 Notes

- All components should use `theme.css` variables
- Follow existing patterns from Kitchen, Tables, Navbar
- FontAwesome icons for consistency
- Test each component after updates
- Document any breaking changes

---

## ⏱️ Estimated Timeline: 7 days
- **Phase 1**: 2 days
- **Phase 2**: 2 days  
- **Phase 3**: 1 day
- **Phase 4**: 1 day
- **Phase 5**: 1 day

**Total Components to Update**: ~25 components
**Average Time per Component**: ~30-60 minutes

---

**Last Updated**: 2025-12-23 03:23:22
**Status**: Planning Phase
