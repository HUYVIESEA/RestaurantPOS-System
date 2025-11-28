package com.example.restaurantpos.restaurantpo.smartorder.domain.usecase

import com.example.restaurantpos.restaurantpo.smartorder.domain.model.User
import com.example.restaurantpos.restaurantpo.smartorder.domain.repository.AuthRepository
import javax.inject.Inject

class LoginUseCase @Inject constructor(
    private val repository: AuthRepository
) {
    suspend operator fun invoke(username: String, password: String): Result<User> {
        if (username.isBlank() || password.isBlank()) {
            return Result.failure(IllegalArgumentException("Username and password cannot be empty"))
        }
        return repository.login(username, password)
    }
}
