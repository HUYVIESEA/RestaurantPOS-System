#!/bin/bash

# Update Analytics & Reports
sed -i 's/fa-chart-bar/fa-chart-area/g' restaurant-pos-client/src/components/Analytics/Analytics.tsx
sed -i 's/fa-chart-bar/fa-chart-area/g' restaurant-pos-client/src/components/Reports/Reports.tsx
sed -i 's/fa-file-pdf/fa-file-invoice/g' restaurant-pos-client/src/components/Reports/Reports.tsx

# Order List replacements
sed -i 's/fa-receipt/fa-file-invoice-dollar/g' restaurant-pos-client/src/components/Orders/OrderList.tsx
sed -i 's/fa-search/fa-search-dollar/g' restaurant-pos-client/src/components/Orders/OrderList.tsx

# Products
sed -i 's/fa-box/fa-hamburger/g' restaurant-pos-client/src/components/Products/ProductList.tsx
sed -i 's/fa-plus/fa-plus-circle/g' restaurant-pos-client/src/components/Products/ProductList.tsx

# Categories
sed -i 's/fa-folder/fa-layer-group/g' restaurant-pos-client/src/components/Categories/CategoryList.tsx
sed -i 's/fa-folder-open/fa-layer-group/g' restaurant-pos-client/src/components/Categories/CategoryList.tsx

# Tables
sed -i 's/fa-utensils/fa-concierge-bell/g' restaurant-pos-client/src/components/Tables/TableList.tsx
sed -i 's/fa-chair/fa-couch/g' restaurant-pos-client/src/components/Tables/TableList.tsx

# Inventory & Suppliers
sed -i 's/fa-warehouse/fa-boxes/g' restaurant-pos-client/src/components/Inventory/InventoryList.tsx
sed -i 's/fa-truck/fa-truck-loading/g' restaurant-pos-client/src/components/Suppliers/SupplierList.tsx

