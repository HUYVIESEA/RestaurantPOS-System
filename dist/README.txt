========================================
 Restaurant POS - Production Build
========================================

Build Date: Thu 12/11/2025 10:48:56.55

Contents:
- frontend/ - React production build
- backend/  - .NET published app
- desktop/  - WPF Desktop POS app
- manager/  - WPF Manager Admin app

Deployment Instructions:

Frontend:
1. Upload contents of frontend/ to web server
2. Configure web server to serve index.html

Backend:
1. Upload contents of backend/ to server
2. Install .NET Runtime
3. Configure appsettings.json

Desktop:
1. Copy contents of desktop/ to client machines
2. Install .NET Desktop Runtime
3. Configure appsettings.json
4. Run RestaurantPOS.Desktop.exe

Manager:
1. Copy contents of manager/ to admin machines
2. Install .NET Desktop Runtime
3. Configure appsettings.json
4. Run RestaurantPOS.Manager.exe
