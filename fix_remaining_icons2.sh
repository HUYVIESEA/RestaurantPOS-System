#!/bin/bash

# Swap some remaining charts
sed -i 's/fa-chart-line/fa-chart-simple/g' restaurant-pos-client/src/components/Analytics/Analytics.tsx
sed -i 's/fa-chart-line/fa-chart-simple/g' restaurant-pos-client/src/components/Reports/Reports.tsx
sed -i 's/fa-chart-line/fa-chart-simple/g' restaurant-pos-client/src/components/Reports/Statistics.tsx

# Convert fa-plus to fa-plus-circle
sed -i 's/fa-plus /fa-circle-plus /g' restaurant-pos-client/src/components/Inventory/InventoryList.tsx

# Replace fa-user-circle with fa-circle-user (v6)
find restaurant-pos-client/src/components -type f -name "*.tsx" -exec sed -i 's/fa-user-circle/fa-circle-user/g' {} +

# Replace fa-exclamation-triangle with fa-triangle-exclamation
find restaurant-pos-client/src/components -type f -name "*.tsx" -exec sed -i 's/fa-exclamation-triangle/fa-triangle-exclamation/g' {} +

# Change fa-folder to fa-layer-group if missed
find restaurant-pos-client/src/components -type f -name "*.tsx" -exec sed -i 's/fa-folder /fa-layer-group /g' {} +
find restaurant-pos-client/src/components -type f -name "*.tsx" -exec sed -i 's/fa-folder-open/fa-layer-group/g' {} +
find restaurant-pos-client/src/components -type f -name "*.tsx" -exec sed -i 's/fa-folder"/fa-layer-group"/g' {} +

