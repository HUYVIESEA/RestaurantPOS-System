package com.example.restaurantpos.restaurantpo.restaurantposandroid;

import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Log;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.OnBackPressedCallback;
import androidx.appcompat.app.AppCompatActivity;

import com.example.restaurantpos.restaurantpo.restaurantposandroid.api.AuthApi;
import com.example.restaurantpos.restaurantpo.restaurantposandroid.api.RetrofitClient;
import com.example.restaurantpos.restaurantpo.restaurantposandroid.models.ErrorResponse;
import com.example.restaurantpos.restaurantpo.restaurantposandroid.models.LoginRequest;
import com.example.restaurantpos.restaurantpo.restaurantposandroid.models.LoginResponse;
import com.example.restaurantpos.restaurantpo.restaurantposandroid.utils.SessionManager;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.textfield.TextInputEditText;
import com.google.gson.Gson;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class LoginActivity extends AppCompatActivity {

    private static final String TAG = "LoginActivity";

    // UI Components
    private TextInputEditText etUsername;
    private TextInputEditText etPassword;
    private MaterialButton btnLogin;
    private TextView tvError;
    private TextView tvForgotPassword;
    private TextView tvRegister;
    private ProgressBar progressBar;

    // API and Session
    private AuthApi authApi;
    private SessionManager sessionManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Initialize session manager
        sessionManager = new SessionManager(this);
        
        // Check if already logged in
        if (sessionManager.isLoggedIn()) {
            navigateToMainActivity();
            return;
        }
        
        setContentView(R.layout.activity_login);

        // Initialize API
        authApi = RetrofitClient.getAuthApi();

        // Initialize views
        initializeViews();

        // Set up click listeners
        setupClickListeners();

        // Auto-fill demo credentials (for development)
        fillDemoCredentials();
        
        // Handle back button
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                // Prevent going back to previous activity
                finishAffinity();
            }
        });
    }

    private void initializeViews() {
        etUsername = findViewById(R.id.etUsername);
        etPassword = findViewById(R.id.etPassword);
        btnLogin = findViewById(R.id.btnLogin);
        tvError = findViewById(R.id.tvError);
        tvForgotPassword = findViewById(R.id.tvForgotPassword);
        tvRegister = findViewById(R.id.tvRegister);
        progressBar = findViewById(R.id.progressBar);
    }

    private void setupClickListeners() {
        // Login button click
        btnLogin.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                handleLogin();
            }
        });

        // Forgot password click
        tvForgotPassword.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // Navigate to ForgotPasswordActivity
                Toast.makeText(LoginActivity.this, 
                    "Chức năng quên mật khẩu đang được phát triển", 
                    Toast.LENGTH_SHORT).show();
                // Intent intent = new Intent(LoginActivity.this, ForgotPasswordActivity.class);
                // startActivity(intent);
            }
        });

        // Register click
        tvRegister.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // Navigate to RegisterActivity
                Toast.makeText(LoginActivity.this, 
                    "Chức năng đăng ký đang được phát triển", 
                    Toast.LENGTH_SHORT).show();
                // Intent intent = new Intent(LoginActivity.this, RegisterActivity.class);
                // startActivity(intent);
            }
        });
    }

    private void handleLogin() {
        // Hide error message
        tvError.setVisibility(View.GONE);

        // Get input values
        String username = etUsername.getText() != null ? etUsername.getText().toString().trim() : "";
        String password = etPassword.getText() != null ? etPassword.getText().toString().trim() : "";

        // Validate inputs
        if (TextUtils.isEmpty(username)) {
            showError("Vui lòng nhập tên đăng nhập");
            etUsername.requestFocus();
            return;
        }

        if (TextUtils.isEmpty(password)) {
            showError("Vui lòng nhập mật khẩu");
            etPassword.requestFocus();
            return;
        }

        // Show loading state
        setLoadingState(true);

        // Call API
        performLogin(username, password);
    }

    private void performLogin(String username, String password) {
        LoginRequest request = new LoginRequest(username, password);
        
        Call<LoginResponse> call = authApi.login(request);
        call.enqueue(new Callback<LoginResponse>() {
            @Override
            public void onResponse(Call<LoginResponse> call, Response<LoginResponse> response) {
                setLoadingState(false);
                
                if (response.isSuccessful() && response.body() != null) {
                    // Login successful
                    LoginResponse loginResponse = response.body();
                    
                    // Save session
                    sessionManager.saveLoginSession(loginResponse);
                    
                    Log.d(TAG, "Login successful for user: " + loginResponse.getUsername());
                    
                    Toast.makeText(LoginActivity.this, 
                        "Đăng nhập thành công! Xin chào " + loginResponse.getFullName(), 
                        Toast.LENGTH_SHORT).show();
                    
                    // Navigate to MainActivity
                    navigateToMainActivity();
                    
                } else {
                    // Login failed
                    handleLoginError(response);
                }
            }

            @Override
            public void onFailure(Call<LoginResponse> call, Throwable t) {
                setLoadingState(false);
                Log.e(TAG, "Login API call failed", t);
                
                String errorMessage = "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.";
                if (t.getMessage() != null && t.getMessage().contains("Unable to resolve host")) {
                    errorMessage = "Không thể kết nối đến server API. Vui lòng kiểm tra:\n" +
                                 "1. Backend đang chạy tại localhost:5000\n" +
                                 "2. Kết nối mạng";
                }
                
                showError(errorMessage);
                Toast.makeText(LoginActivity.this, errorMessage, Toast.LENGTH_LONG).show();
            }
        });
    }

    private void handleLoginError(Response<LoginResponse> response) {
        String errorMessage = "Tên đăng nhập hoặc mật khẩu không đúng";
        
        try {
            if (response.errorBody() != null) {
                String errorBody = response.errorBody().string();
                Log.e(TAG, "Error response: " + errorBody);
                
                // Try to parse error response
                Gson gson = new Gson();
                ErrorResponse errorResponse = gson.fromJson(errorBody, ErrorResponse.class);
                if (errorResponse != null && errorResponse.getMessage() != null) {
                    errorMessage = errorResponse.getMessage();
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error parsing error response", e);
        }
        
        showError(errorMessage);
    }

    private void navigateToMainActivity() {
        Intent intent = new Intent(LoginActivity.this, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish();
    }

    private void setLoadingState(boolean isLoading) {
        if (isLoading) {
            btnLogin.setEnabled(false);
            btnLogin.setText("Đang đăng nhập...");
            progressBar.setVisibility(View.VISIBLE);
            etUsername.setEnabled(false);
            etPassword.setEnabled(false);
        } else {
            btnLogin.setEnabled(true);
            btnLogin.setText("Đăng nhập");
            progressBar.setVisibility(View.GONE);
            etUsername.setEnabled(true);
            etPassword.setEnabled(true);
        }
    }

    private void showError(String message) {
        tvError.setText(message);
        tvError.setVisibility(View.VISIBLE);
    }

    private void fillDemoCredentials() {
        // Auto-fill for development/testing
        // Remove this in production
        etUsername.setText("admin");
        etPassword.setText("Admin@123");
    }
}
