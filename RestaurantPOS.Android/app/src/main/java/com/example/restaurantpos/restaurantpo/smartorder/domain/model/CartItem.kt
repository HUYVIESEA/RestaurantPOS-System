package com.example.restaurantpos.restaurantpo.smartorder.domain.model

data class CartItem(
    val product: Product,
    val quantity: Int,
    val note: String = ""
) {
    val total: Double
        get() = product.price * quantity
}
