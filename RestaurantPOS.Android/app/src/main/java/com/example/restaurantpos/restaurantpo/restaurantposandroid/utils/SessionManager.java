package com.example.restaurantpos.restaurantpo.restaurantposandroid.utils;

import android.content.Context;
import android.content.SharedPreferences;

import com.example.restaurantpos.restaurantpo.restaurantposandroid.models.LoginResponse;

public class SessionManager {
    
    private static final String PREF_NAME = "RestaurantPOSSession";
    private static final String KEY_TOKEN = "token";
    private static final String KEY_USER_ID = "user_id";
    private static final String KEY_USERNAME = "username";
    private static final String KEY_EMAIL = "email";
    private static final String KEY_FULL_NAME = "full_name";
    private static final String KEY_ROLE = "role";
    private static final String KEY_EXPIRES_AT = "expires_at";
    private static final String KEY_IS_LOGGED_IN = "is_logged_in";
    
    private SharedPreferences prefs;
    private SharedPreferences.Editor editor;
    private Context context;
    
    public SessionManager(Context context) {
        this.context = context;
        prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        editor = prefs.edit();
    }
    
    /**
     * Save login session
     */
    public void saveLoginSession(LoginResponse response) {
        editor.putBoolean(KEY_IS_LOGGED_IN, true);
        editor.putInt(KEY_USER_ID, response.getId());
        editor.putString(KEY_TOKEN, response.getToken());
        editor.putString(KEY_USERNAME, response.getUsername());
        editor.putString(KEY_EMAIL, response.getEmail());
        editor.putString(KEY_FULL_NAME, response.getFullName());
        editor.putString(KEY_ROLE, response.getRole());
        editor.putString(KEY_EXPIRES_AT, response.getExpiresAt());
        editor.apply();
    }
    
    /**
     * Check if user is logged in
     */
    public boolean isLoggedIn() {
        return prefs.getBoolean(KEY_IS_LOGGED_IN, false);
    }
    
    /**
     * Get auth token
     */
    public String getToken() {
        return prefs.getString(KEY_TOKEN, null);
    }
    
    /**
     * Get user ID
     */
    public int getUserId() {
        return prefs.getInt(KEY_USER_ID, -1);
    }
    
    /**
     * Get username
     */
    public String getUsername() {
        return prefs.getString(KEY_USERNAME, "");
    }
    
    /**
     * Get email
     */
    public String getEmail() {
        return prefs.getString(KEY_EMAIL, "");
    }
    
    /**
     * Get full name
     */
    public String getFullName() {
        return prefs.getString(KEY_FULL_NAME, "");
    }
    
    /**
     * Get user role
     */
    public String getRole() {
        return prefs.getString(KEY_ROLE, "");
    }
    
    /**
     * Check if user is admin
     */
    public boolean isAdmin() {
        return "Admin".equalsIgnoreCase(getRole());
    }
    
    /**
     * Clear session (logout)
     */
    public void clearSession() {
        editor.clear();
        editor.apply();
    }
    
    /**
     * Get all user data as LoginResponse object
     */
    public LoginResponse getUserData() {
        if (!isLoggedIn()) {
            return null;
        }
        
        LoginResponse response = new LoginResponse();
        response.setId(getUserId());
        response.setToken(getToken());
        response.setUsername(getUsername());
        response.setEmail(getEmail());
        response.setFullName(getFullName());
        response.setRole(getRole());
        response.setExpiresAt(prefs.getString(KEY_EXPIRES_AT, ""));
        
        return response;
    }
}
