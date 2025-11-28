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
- [ ] **Data Layer Implementation**
  - [ ] Setup Room Database (Entities, DAOs)
  - [ ] Setup API Services
  - [ ] Implement Repositories (Offline-first logic)

- [ ] **Product Catalog**
  - [ ] Product List Screen
  - [ ] Category Filter
  - [ ] Product Search
  - [ ] Product Detail Dialog

- [ ] **Table Management**
  - [ ] Table Grid/List View
  - [ ] Table Status Logic (Empty/Occupied)
  - [ ] Table Selection Flow

- [ ] **Order Management**
  - [ ] Cart/Basket Logic
  - [ ] Add Item with Notes
  - [ ] Create Order API
  - [ ] Order List/History

### 3. � Offline & Sync (Week 5-6)
- [ ] **Offline Logic**
  - [ ] Local Order Creation
  - [ ] Sync Status Tracking (isSynced flag)
  - [ ] Error Handling for Offline Actions

- [ ] **Background Sync**
  - [ ] Setup WorkManager
  - [ ] Implement SyncWorker
  - [ ] Auto-sync on Network Reconnect

### 4. 🚀 Advanced Features (Week 7-8)
- [ ] **Real-time Updates**
  - [ ] SignalR Client Integration
  - [ ] Handle Order Updates
  - [ ] Handle Table Status Updates

- [ ] **Kitchen Display System**
  - [ ] Kitchen Order View
  - [ ] Order Status Management (Preparing/Ready)
  - [ ] Kitchen Notifications

- [ ] **Firebase Integration**
  - [ ] Setup Firebase Project
  - [ ] Implement FCM (Push Notifications)
  - [ ] Setup Crashlytics

### 5. ✨ Polish & Release (Week 9-10)
- [ ] **UI/UX Refinement**
  - [ ] Animations & Transitions
  - [ ] Error/Loading States
  - [ ] Dark Mode Support

- [ ] **Testing & Documentation**
  - [ ] Unit Tests (ViewModels, UseCases)
  - [ ] User Guide
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

