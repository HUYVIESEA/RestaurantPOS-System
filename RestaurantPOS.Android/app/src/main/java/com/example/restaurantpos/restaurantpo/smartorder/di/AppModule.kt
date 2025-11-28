package com.example.restaurantpos.restaurantpo.smartorder.di

import android.content.Context
import com.example.restaurantpos.restaurantpo.smartorder.data.local.TokenManager
import com.example.restaurantpos.restaurantpo.smartorder.data.remote.api.AuthApi
import com.example.restaurantpos.restaurantpo.smartorder.data.repository.AuthRepositoryImpl
import com.example.restaurantpos.restaurantpo.smartorder.domain.repository.AuthRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    // Change this to your computer's IP address when testing on real device
    // For emulator: 10.0.2.2 points to localhost
    private const val BASE_URL = "http://192.168.0.101:5000/"
    private const val CLIENT_URL = "http://172.16.13.163:5000/"
    private const val EMULATOR_CLIENT_URL = "http://10.0.2.2:5000/"

    @Provides
    @Singleton
    fun provideTokenManager(@ApplicationContext context: Context): TokenManager {
        return TokenManager(context)
    }

    @Provides
    @Singleton
    fun provideOkHttpClient(tokenManager: TokenManager): OkHttpClient {
        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
        
        val authInterceptor = com.example.restaurantpos.restaurantpo.smartorder.data.remote.AuthInterceptor(tokenManager)
        
        return OkHttpClient.Builder()
            .addInterceptor(authInterceptor) // Add auth interceptor first
            .addInterceptor(logging)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    @Provides
    @Singleton
    fun provideRetrofit(okHttpClient: OkHttpClient): Retrofit {
        return Retrofit.Builder()
            .baseUrl(CLIENT_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    @Provides
    @Singleton
    fun provideAuthApi(retrofit: Retrofit): AuthApi {
        return retrofit.create(AuthApi::class.java)
    }

    @Provides
    @Singleton
    fun provideAuthRepository(
        api: AuthApi,
        tokenManager: TokenManager
    ): AuthRepository {
        return AuthRepositoryImpl(api, tokenManager)
    }
    
    @Provides
    @Singleton
    fun provideTablesApi(retrofit: Retrofit): com.example.restaurantpos.restaurantpo.smartorder.data.remote.api.TablesApi {
        return retrofit.create(com.example.restaurantpos.restaurantpo.smartorder.data.remote.api.TablesApi::class.java)
    }
    
    @Provides
    @Singleton
    fun provideTablesRepository(
        api: com.example.restaurantpos.restaurantpo.smartorder.data.remote.api.TablesApi
    ): com.example.restaurantpos.restaurantpo.smartorder.domain.repository.TablesRepository {
        return com.example.restaurantpos.restaurantpo.smartorder.data.repository.TablesRepositoryImpl(api)
    }
    
    @Provides
    @Singleton
    fun provideProductsApi(retrofit: Retrofit): com.example.restaurantpos.restaurantpo.smartorder.data.remote.api.ProductsApi {
        return retrofit.create(com.example.restaurantpos.restaurantpo.smartorder.data.remote.api.ProductsApi::class.java)
    }
    
    @Provides
    @Singleton
    fun provideProductsRepository(
        api: com.example.restaurantpos.restaurantpo.smartorder.data.remote.api.ProductsApi
    ): com.example.restaurantpos.restaurantpo.smartorder.domain.repository.ProductsRepository {
        return com.example.restaurantpos.restaurantpo.smartorder.data.repository.ProductsRepositoryImpl(api)
    }
    
    @Provides
    @Singleton
    fun provideOrdersApi(retrofit: Retrofit): com.example.restaurantpos.restaurantpo.smartorder.data.remote.api.OrdersApi {
        return retrofit.create(com.example.restaurantpos.restaurantpo.smartorder.data.remote.api.OrdersApi::class.java)
    }
    
    @Provides
    @Singleton
    fun provideOrdersRepository(
        api: com.example.restaurantpos.restaurantpo.smartorder.data.remote.api.OrdersApi
    ): com.example.restaurantpos.restaurantpo.smartorder.domain.repository.OrdersRepository {
        return com.example.restaurantpos.restaurantpo.smartorder.data.repository.OrdersRepositoryImpl(api)
    }
}
