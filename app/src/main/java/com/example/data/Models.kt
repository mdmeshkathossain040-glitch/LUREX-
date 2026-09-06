package com.example.data

import java.util.UUID

enum class UserRole {
  BUYER, SELLER, ADMIN
}

enum class OrderStatus {
  PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED
}

enum class PaymentMethod(val displayName: String) {
  BKASH("bKash"),
  NAGAD("Nagad"),
  ROCKET("DBBL Rocket"),
  BANK_TRANSFER("Bank Transfer"),
  COD("Cash on Delivery")
}

data class Category(
  val id: String,
  val name: String,
  val iconName: String
)

data class Product(
  val id: String = UUID.randomUUID().toString(),
  val name: String,
  val categoryId: String,
  val categoryName: String,
  val shopId: String,
  val shopName: String,
  val price: Double,
  val discountPrice: Double? = null,
  var stockQuantity: Int,
  val description: String,
  val rating: Double = 4.8,
  val totalReviews: Int = 24,
  val isFeatured: Boolean = false
) {
  val activePrice: Double
    get() = discountPrice ?: price
}

data class CartItem(
  val product: Product,
  var quantity: Int
) {
  val totalPrice: Double
    get() = product.activePrice * quantity
}

data class OrderItemRecord(
  val productId: String,
  val productName: String,
  val shopName: String,
  val quantity: Int,
  val unitPrice: Double,
  val totalPrice: Double
)

data class OrderRecord(
  val id: String = "LRX-${(100000..999999).random()}",
  val customerName: String,
  val customerPhone: String,
  val shippingAddress: String,
  val items: List<OrderItemRecord>,
  val subtotal: Double,
  val deliveryCharge: Double = 60.0,
  val discountAmount: Double = 0.0,
  val totalAmount: Double,
  var status: OrderStatus = OrderStatus.CONFIRMED,
  val paymentMethod: PaymentMethod,
  val paymentStatus: String = "PAID",
  val createdAt: String = "Just now"
)

data class ShopRecord(
  val id: String = UUID.randomUUID().toString(),
  val name: String,
  val ownerName: String,
  val phone: String,
  val description: String,
  var status: String = "APPROVED", // APPROVED, PENDING, REJECTED
  val totalSales: Double = 850000.0,
  val rating: Double = 4.9
)

data class PayoutRequest(
  val id: String = UUID.randomUUID().toString(),
  val sellerName: String,
  val method: String,
  val accountNumber: String,
  val amount: Double,
  var status: String = "PENDING", // PENDING, PAID, REJECTED
  val requestedAt: String = "Today"
)
