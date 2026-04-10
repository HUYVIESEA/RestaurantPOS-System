#!/bin/bash

# This script replaces generic FontAwesome icons with more modern/fitting ones
# Note: Ensure the user's FontAwesome version supports these. We assume a decent v5/v6 Free set.

# Common Navbar replacements
sed -i 's/fa-chart-line/fa-chart-pie/g' restaurant-pos-client/src/components/Common/Navbar.tsx
sed -i 's/fa-utensils/fa-concierge-bell/g' restaurant-pos-client/src/components/Common/Navbar.tsx
sed -i 's/fa-receipt/fa-file-invoice-dollar/g' restaurant-pos-client/src/components/Common/Navbar.tsx
sed -i 's/fa-box/fa-hamburger/g' restaurant-pos-client/src/components/Common/Navbar.tsx
sed -i 's/fa-folder/fa-layer-group/g' restaurant-pos-client/src/components/Common/Navbar.tsx
sed -i 's/fa-warehouse/fa-boxes/g' restaurant-pos-client/src/components/Common/Navbar.tsx
sed -i 's/fa-truck/fa-truck-loading/g' restaurant-pos-client/src/components/Common/Navbar.tsx
sed -i 's/fa-fire/fa-fire-burner/g' restaurant-pos-client/src/components/Common/Navbar.tsx
sed -i 's/fa-chart-bar/fa-chart-area/g' restaurant-pos-client/src/components/Common/Navbar.tsx
sed -i 's/fa-users/fa-user-friends/g' restaurant-pos-client/src/components/Common/Navbar.tsx

# Dashboard generic replacements
sed -i 's/fa-dollar-sign/fa-wallet/g' restaurant-pos-client/src/components/Dashboard/Dashboard.tsx
sed -i 's/fa-shopping-cart/fa-shopping-basket/g' restaurant-pos-client/src/components/Dashboard/Dashboard.tsx
sed -i 's/fa-chart-line/fa-chart-pie/g' restaurant-pos-client/src/components/Dashboard/Dashboard.tsx

