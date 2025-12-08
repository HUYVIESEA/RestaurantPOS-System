---
description: Workflow for running and testing the RestaurantPOS Desktop Application
---

# Running the Desktop Application

1.  **Prerequisites**:
    *   Ensure the `RestaurantPOS.API` is running on `http://localhost:5000`.
    *   Ensure the database is seeded with Users, Products, and Tables.

2.  **Start the Application**:
    *   Open a terminal in `RestaurantPOS.Desktop`.
    *   Run: `dotnet run`

3.  **Login**:
    *   Use valid credentials (e.g., `admin` / `password` or as configured in your database).
    *   Upon success, you will be redirected to the Table Selection screen.

4.  **POS Workflow**:
    *   **Select Table**: Click on a table to start an order.
        *   Green: Empty table.
        *   Red: Occupied table (loads existing order).
    *   **Add Items**: Click "Thêm" on products to add them to the cart.
    *   **Adjust Quantity**: Use `+` / `-` in the bill section.
    *   **Save Order**: Click "Lưu đơn" to save items to the kitchen without paying.
    *   **Checkout**: Click "Thanh toán" to complete the order and clear the table.
    *   **Back**: Use the arrow icon top-left to return to Table Selection.

5.  **Logout**:
    *   Click the "Sign Out" icon in the bottom-left sidebar to log out.
