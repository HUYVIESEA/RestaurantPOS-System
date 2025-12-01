package com.example.restaurantpos.restaurantpo.smartorder.di

import android.content.Context
import androidx.room.Room
import com.example.restaurantpos.restaurantpo.smartorder.data.local.AppDatabase
import com.example.restaurantpos.restaurantpo.smartorder.data.local.dao.ProductDao
import com.example.restaurantpos.restaurantpo.smartorder.data.local.dao.TableDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideAppDatabase(@ApplicationContext context: Context): AppDatabase {
        return Room.databaseBuilder(
            context,
            AppDatabase::class.java,
            "restaurant_pos_db"
        )
        .fallbackToDestructiveMigration() // For development only
        .build()
    }

    @Provides
    @Singleton
    fun provideProductDao(database: AppDatabase): ProductDao {
        return database.productDao()
    }

    @Provides
    @Singleton
    fun provideTableDao(database: AppDatabase): TableDao {
        return database.tableDao()
    }

    @Provides
    @Singleton
    fun provideOrderDao(database: AppDatabase): com.example.restaurantpos.restaurantpo.smartorder.data.local.dao.OrderDao {
        return database.orderDao()
    }
}
