# 📱 Android POS Application Requirements & Specifications

## 1. 🎯 Project Overview
- **Topic Name:** Xây dựng ứng dụng Android POS hỗ trợ hoạt động ngoại tuyến (Offline-First) và đồng bộ thời gian thực cho nhà hàng.
- **App Name:** SmartOrder
- **Goal:** Build a professional, offline-capable POS mobile application for restaurant staff (waiters/kitchen).
- **Target Audience:** Waiters, Kitchen Staff.

## 2. 🛠️ Technology Stack (Modern Android)
- **Language:** Kotlin
- **UI Framework:** Jetpack Compose (Material Design 3)
- **Architecture:** Clean Architecture + MVVM
- **Dependency Injection:** Hilt
- **Local Database:** Room Database (SQLite)
- **Networking:** Retrofit + OkHttp
- **Async Processing:** Coroutines + Flow
- **Background Sync:** WorkManager
- **Real-time:** SignalR Client
- **Icons:** Lucide Icons (KiotViet style)
- **Cloud Services:** 
  - Firebase Cloud Messaging (FCM) - Push Notifications
  - Firebase Crashlytics - Error Reporting

## 3. 📱 Features Scope

### ✅ Core Features (Phase 1)
1.  **Authentication**
    - Login with Email/Password
    - JWT Token management (EncryptedSharedPreferences)
    - Auto-login (Session persistence)
    - User Profile view

2.  **Product Management**
    - View Product List
    - Filter by Category
    - Search Products
    - View Product Details

3.  **Table Management**
    - View Table Map/List
    - Real-time Table Status (Empty, Occupied, Reserved)
    - Open Table / Select Table

4.  **Order Management**
    - Add items to cart
    - Add notes (e.g., "No spicy", "Less ice")
    - Update quantity
    - Send Order to Kitchen
    - View Order History

### ⭐ Killer Features (Phase 2)
5.  **Offline-First Architecture**
    - Full functionality without internet
    - Local data persistence (Room)
    - Auto-sync when online (WorkManager)
    - Conflict resolution strategy

6.  **Kitchen Display System (KDS)**
    - Dedicated view for Kitchen staff
    - Real-time incoming orders
    - Update status (Preparing -> Ready)
    - Push notifications for new orders

### ❌ Out of Scope (For now)
- Physical Hardware Integration (Printer, Scanner) -> Use Camera/PDF alternatives.
- E-commerce Integration (Shopee, Grab).
- Admin/Management features (Keep on Web).

## 4. 🎨 UI/UX Design Guidelines
- **Style:** Professional, Minimalist, High Contrast (KiotViet Style).
- **Icons:** Lucide Icons (Stroke style).
- **Theme:** 
  - Light Mode (Default for day shift)
  - Dark Mode (Optional for night shift)
- **Navigation:** Bottom Navigation Bar for main screens.

## 5. 🔄 Data Flow & Architecture
- **Pattern:** Repository Pattern with Offline Support.
- **Flow:** `UI` <-> `ViewModel` <-> `UseCase` <-> `Repository` <-> `Local DataSource (Room)` <-> `Remote DataSource (API)`
- **Principle:** Single Source of Truth is **Room Database**. UI always observes Room. API updates Room.

## 6. 📅 Milestones
- **Week 1-2:** Project Setup, Auth, Basic UI.
- **Week 3-4:** Core Features (Menu, Table, Order).
- **Week 5-6:** Offline Logic & Sync.
- **Week 7-8:** Real-time & Kitchen Display.
- **Week 9-10:** Polish, Testing, Documentation.
