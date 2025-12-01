#  Firebase Integration Guide for Restaurant POS

Since you are using **SQL Server** for the backend and **SQLite (Room)** for local storage, we will use **Firebase** primarily for:
1.  **Firebase Cloud Messaging (FCM)**: To send real-time push notifications to devices (e.g., notifying the kitchen when a new order is placed, or notifying waiters when food is ready).
2.  **Firebase Crashlytics**: To track app crashes and stability issues.

##  Step 1: Firebase Console Setup (You need to do this)

1.  Go to [Firebase Console](https://console.firebase.google.com/).
2.  Click **"Add project"** and name it `RestaurantPOS`.
3.  Enable Google Analytics (recommended for Crashlytics) and finish creation.
4.  Click the **Android** icon to add an Android app.
5.  **Package Name**: Enter `com.example.restaurantpos.restaurantpo` (This MUST match your `build.gradle` applicationId).
6.  **App Nickname**: `Restaurant POS Android`.
7.  **SHA-1 Certificate**: (Optional for now, but good for security).
8.  Click **Register app**.
9.  **Download `google-services.json`**.
10. **Place this file** in your project at: `RestaurantPOS.Android/app/google-services.json`.

##  Step 2: Add Dependencies (I will do this)

I will update your gradle files to include:
- `com.google.gms:google-services` plugin.
- `com.google.firebase:firebase-bom` (Bill of Materials).
- `com.google.firebase:firebase-messaging` (FCM).
- `com.google.firebase:firebase-crashlytics`.

##  Step 3: Implement Messaging Service (I will do this)

I will create a `MyFirebaseMessagingService` class to:
- Receive notifications when the app is in the foreground.
- Handle token generation (this token is sent to your backend to target this specific device).

##  Step 4: Backend Integration (Future Step)

Your **ASP.NET Core Backend** will need to use the **Firebase Admin SDK** to send messages to these Android devices.
- When an order is created -> Backend sends message to "Kitchen" topic.
- When order is ready -> Backend sends message to specific Waiter's device token.
