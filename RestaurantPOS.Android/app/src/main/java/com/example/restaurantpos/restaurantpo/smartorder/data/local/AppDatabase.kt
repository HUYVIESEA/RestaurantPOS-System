package com.example.restaurantpos.restaurantpo.smartorder.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import com.example.restaurantpos.restaurantpo.smartorder.data.local.dao.OrderDao
import com.example.restaurantpos.restaurantpo.smartorder.data.local.dao.ProductDao
import com.example.restaurantpos.restaurantpo.smartorder.data.local.dao.TableDao
import com.example.restaurantpos.restaurantpo.smartorder.data.local.entity.OrderEntity
import com.example.restaurantpos.restaurantpo.smartorder.data.local.entity.OrderItemEntity
import com.example.restaurantpos.restaurantpo.smartorder.data.local.entity.ProductEntity
import com.example.restaurantpos.restaurantpo.smartorder.data.local.entity.TableEntity

@Database(
    entities = [ProductEntity::class, TableEntity::class, OrderEntity::class, OrderItemEntity::class],
    version = 3, // Increment version
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun productDao(): ProductDao
    abstract fun tableDao(): TableDao
    abstract fun orderDao(): OrderDao
}
