# 📋 TODO List - Phase 2 Development

## 🎯 Android App Development (Priority: High)

### 1. 🏗️ Project Foundation (Week 1-2)
- [ ] **Project Setup**
  - [ ] Initialize Android Project (Kotlin DSL)
  - [ ] Configure Build Gradle (Hilt, Room, Retrofit, Compose)
  - [ ] Setup Clean Architecture Packages (Data, Domain, Presentation)
  - [ ] Configure Theme & Colors (Material 3)
  - [ ] Setup Navigation (Compose Navigation)

- [ ] **Authentication**
  - [ ] Login Screen UI (Jetpack Compose)
  - [ ] Auth API Integration (Retrofit)
  - [ ] Token Management (DataStore/EncryptedSharedPreferences)
  - [ ] User Session Handling
  - [ ] Logout Functionality

### 2. 📱 Core Features (Week 3-4)

- [x] **Data Layer Implementation**
  - [x] Setup Room Database (Entities, DAOs)
  - [x] Setup API Services
  - [x] Implement Repositories (Offline-first logic for Products & Tables)

- [x] **Product Catalog**
  - [x] Product List Screen
  - [x] Category Filter
  - [x] Product Search
  - [x] Product Detail Dialog

- [ ] **Table Management**
  - [x] Table Grid/List View
  - [x] Table Status Logic (Empty/Occupied)
  - [x] Table Selection Flow

- [x] **Order Management**
  - [x] Cart/Basket Logic
  - [x] Add Item with Notes
  - [x] Create Order API
  - [x] Order List/History

- [x] **Settings Screen**
  - [x] Configure Server IP
  - [x] Configure Printers

### 3.  Offline & Sync (Week 5-6)
- [ ] **Offline Logic**
  - [x] Local Order Creation
  - [x] Sync Status Tracking (isSynced flag)
  - [ ] Error Handling for Offline Actions

- [ ] **Background Sync**
  - [x] Setup WorkManager
  - [x] Implement SyncWorker
  - [x] Auto-sync on Network Reconnect

### 4. 🚀 Advanced Features (Week 7-8)
- [ ] **Real-time Updates**
  - [x] SignalR Client Integration
  - [x] Handle Order Updates
  - [x] Handle Table Status Updates

- [ ] **Kitchen Display System**
  - [x] Kitchen Order View
  - [x] Order Status Management (Preparing/Ready)
  - [x] Kitchen Notifications (FCM Integration)

- [ ] **Firebase Integration**
  - [x] Setup Firebase Project (Guide Created)
  - [x] Implement FCM (Service Created)
  - [x] Setup Crashlytics (Dependencies Added)

### 5. ✨ Polish & Release (Week 9-10)
- [ ] **UI/UX Refinement**
  - [x] Animations & Transitions
  - [x] Error/Loading States
  - [x] Dark Mode Support

- [x] **Admin Features**
  - [x] User Management (List, Add, Delete)
  - [x] Menu Management (CRUD Products)
  - [x] Reports Screen (Placeholder)
  - [x] Admin Navigation in Home Screen

- [ ] **Testing & Documentation**
  - [ ] Unit Tests (ViewModels, UseCases)
  - [x] User Guide
  - [ ] Final Build (APK/AAB)

---

## ⏳ Pending - Waiting for VNPay Approval
- [ ] **VNPay Production Credentials**
  - [ ] Submit business documents
  - [ ] Complete verification process
  - [ ] Receive production API keys
  - [ ] Update configuration
  - [ ] Test in production environment

- [ ] **Production Deployment**
  - [ ] Setup production server
  - [ ] Configure domain & SSL
  - [ ] Database migration
  - [ ] Environment variables
  - [ ] Monitoring setup

---

## 📝 Notes
- **Android Tech Stack:** Kotlin, Compose, Hilt, Room, Retrofit, WorkManager.
- **Icon Set:** Lucide Icons.
- **Architecture:** Offline-First Clean Architecture.

