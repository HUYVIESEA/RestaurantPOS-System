#!/bin/bash

# Clean up other specific common icons
find restaurant-pos-client/src/components -type f -name "*.tsx" -exec sed -i 's/fa-sign-out-alt/fa-arrow-right-from-bracket/g' {} +
find restaurant-pos-client/src/components -type f -name "*.tsx" -exec sed -i 's/fa-user-edit/fa-user-pen/g' {} +
find restaurant-pos-client/src/components -type f -name "*.tsx" -exec sed -i 's/fa-trash-alt/fa-trash-can/g' {} +
find restaurant-pos-client/src/components -type f -name "*.tsx" -exec sed -i 's/fa-pen/fa-pen-to-square/g' {} +
find restaurant-pos-client/src/components -type f -name "*.tsx" -exec sed -i 's/fa-plus-circle/fa-circle-plus/g' {} +
find restaurant-pos-client/src/components -type f -name "*.tsx" -exec sed -i 's/fa-times/fa-xmark/g' {} +
find restaurant-pos-client/src/components -type f -name "*.tsx" -exec sed -i 's/fa-check-circle/fa-circle-check/g' {} +

