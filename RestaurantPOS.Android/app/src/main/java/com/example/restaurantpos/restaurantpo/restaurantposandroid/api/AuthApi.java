package com.example.restaurantpos.restaurantpo.restaurantposandroid.api;

import com.example.restaurantpos.restaurantpo.restaurantposandroid.models.LoginRequest;
import com.example.restaurantpos.restaurantpo.restaurantposandroid.models.LoginResponse;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.POST;

public interface AuthApi {
    
    @POST("Auth/Login")
    Call<LoginResponse> login(@Body LoginRequest request);
    
    // Future endpoints can be added here
    // @POST("Auth/Register")
    // Call<UserResponse> register(@Body RegisterRequest request);
    
    // @POST("Auth/ForgotPassword")
    // Call<Void> forgotPassword(@Body ForgotPasswordRequest request);
    
    // @POST("Auth/ResetPassword")
    // Call<Void> resetPassword(@Body ResetPasswordRequest request);
}
