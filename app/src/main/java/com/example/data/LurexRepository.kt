package com.example.data

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.util.UUID

class LurexRepository {
  private val _categories = listOf(
    Category("all", "All", "storefront"),
    Category("gadgets", "Electronics", "devices"),
    Category("fashion", "Fashion & Jamdani", "checkroom"),
    Category("groceries", "Groceries & Spices", "shopping_cart"),
    Category("home", "Home & Living", "home"),
    Category("beauty", "Beauty & Care", "spa")
  )
  val categories: List<Category> get() = _categories

  private val _products = MutableStateFlow<List<Product>>(
    listOf(
      Product(
        id = "p-1",
        name = "Dhaka Heritage Tangail Jamdani Saree",
        categoryId = "fashion",
        categoryName = "Fashion & Jamdani",
        shopId = "s-1",
        shopName = "Bengal Heritage Weaves",
        price = 5500.0,
        discountPrice = 4850.0,
        stockQuantity = 12,
        description = "Authentic handloom Jamdani saree woven by master artisans in Narayanganj. Pure fine cotton with intricate floral zari motifs.",
        rating = 4.9,
        isFeatured = true
      ),
      Product(
        id = "p-2",
        name = "ANC Hybrid Wireless Earbuds (38H Playtime)",
        categoryId = "gadgets",
        categoryName = "Electronics",
        shopId = "s-2",
        shopName = "Dhaka Gadget Hub",
        price = 2400.0,
        discountPrice = 1890.0,
        stockQuantity = 25,
        description = "Active Noise Cancellation up to 35dB with quad-mic ENC for crystal-clear calls on busy Dhaka streets. Fast USB-C charging.",
        rating = 4.8,
        isFeatured = true
      ),
      Product(
        id = "p-3",
        name = "Organic Cold Pressed Mustard Oil (1L Bottle)",
        categoryId = "groceries",
        categoryName = "Groceries & Spices",
        shopId = "s-3",
        shopName = "Shonar Bangla Organics",
        price = 360.0,
        discountPrice = 320.0,
        stockQuantity = 40,
        description = "100% pure deshi shorsher tel made from selected yellow mustard seeds. Rich pungent aroma ideal for traditional Bangladeshi cooking.",
        rating = 4.7
      ),
      Product(
        id = "p-4",
        name = "Fast Charging 20000mAh Power Bank (22.5W)",
        categoryId = "gadgets",
        categoryName = "Electronics",
        shopId = "s-2",
        shopName = "Dhaka Gadget Hub",
        price = 2200.0,
        discountPrice = 1750.0,
        stockQuantity = 18,
        description = "Dual USB-A and Type-C PD fast output. Airline approved lightweight high-density polymer battery.",
        rating = 4.9
      ),
      Product(
        id = "p-5",
        name = "Traditional Nakshi Kantha Hand-Embroidered Quilt",
        categoryId = "home",
        categoryName = "Home & Living",
        shopId = "s-1",
        shopName = "Bengal Heritage Weaves",
        price = 3200.0,
        discountPrice = 2800.0,
        stockQuantity = 8,
        description = "Handmade pure cotton Nakshi Kantha featuring village folklore motifs from Jamalpur artisans. Cozy and durable.",
        rating = 5.0
      ),
      Product(
        id = "p-6",
        name = "Pure Wild Honey (Sundarbans Kholisa)",
        categoryId = "groceries",
        categoryName = "Groceries & Spices",
        shopId = "s-3",
        shopName = "Shonar Bangla Organics",
        price = 850.0,
        discountPrice = 750.0,
        stockQuantity = 15,
        description = "Naturally harvested raw honey from the deep mangrove forests of Sundarbans. Certified pure without artificial sweeteners.",
        rating = 4.9
      )
    )
  )
  val products: StateFlow<List<Product>> = _products.asStateFlow()

  private val _cartItems = MutableStateFlow<List<CartItem>>(emptyList())
  val cartItems: StateFlow<List<CartItem>> = _cartItems.asStateFlow()

  private val _orders = MutableStateFlow<List<OrderRecord>>(
    listOf(
      OrderRecord(
        id = "LRX-782914",
        customerName = "Meshkat Hossain",
        customerPhone = "+8801700000000",
        shippingAddress = "House 42, Road 11, Banani, Dhaka-1213",
        items = listOf(
          OrderItemRecord("p-2", "ANC Hybrid Wireless Earbuds", "Dhaka Gadget Hub", 1, 1890.0, 1890.0)
        ),
        subtotal = 1890.0,
        deliveryCharge = 60.0,
        discountAmount = 100.0,
        totalAmount = 1850.0,
        status = OrderStatus.PROCESSING,
        paymentMethod = PaymentMethod.BKASH,
        createdAt = "Yesterday"
      )
    )
  )
  val orders: StateFlow<List<OrderRecord>> = _orders.asStateFlow()

  private val _shops = MutableStateFlow<List<ShopRecord>>(
    listOf(
      ShopRecord(
        id = "s-1",
        name = "Bengal Heritage Weaves",
        ownerName = "Nusrat Jahan",
        phone = "+8801822334455",
        description = "Authentic Jamdani, Handloom Cotton & Silk fabrics from Bangladesh.",
        status = "APPROVED",
        totalSales = 650000.0,
        rating = 4.9
      ),
      ShopRecord(
        id = "s-2",
        name = "Dhaka Gadget Hub",
        ownerName = "Tanvir Hossain",
        phone = "+8801711223344",
        description = "Genuine tech gadgets, accessories & audio gear with warranty.",
        status = "APPROVED",
        totalSales = 1240000.0,
        rating = 4.8
      ),
      ShopRecord(
        id = "s-3",
        name = "Shonar Bangla Organics",
        ownerName = "Kazi Aminur",
        phone = "+8801933445566",
        description = "Farm-fresh organic mustard oil, pure ghee, and Sundarbans honey.",
        status = "APPROVED",
        totalSales = 430000.0,
        rating = 4.7
      ),
      ShopRecord(
        id = "s-4",
        name = "Rajshahi Silk Gallery",
        ownerName = "Farhana Yasmin",
        phone = "+8801555667788",
        description = "Pure mulberry silk sarees and fabrics directly from Rajshahi.",
        status = "PENDING",
        totalSales = 0.0,
        rating = 5.0
      )
    )
  )
  val shops: StateFlow<List<ShopRecord>> = _shops.asStateFlow()

  private val _payouts = MutableStateFlow<List<PayoutRequest>>(
    listOf(
      PayoutRequest(
        sellerName = "Tanvir Hossain (Dhaka Gadget Hub)",
        method = "bKash Merchant",
        accountNumber = "+8801711223344",
        amount = 45000.0,
        status = "PENDING"
      ),
      PayoutRequest(
        sellerName = "Nusrat Jahan (Bengal Heritage)",
        method = "City Bank Ltd",
        accountNumber = "1102938475001",
        amount = 28000.0,
        status = "PAID"
      )
    )
  )
  val payouts: StateFlow<List<PayoutRequest>> = _payouts.asStateFlow()

  // Seller balance
  val sellerAvailableBalance = MutableStateFlow(48500.0)
  val sellerPendingBalance = MutableStateFlow(7200.0)

  fun addToCart(product: Product, quantity: Int = 1) {
    val current = _cartItems.value.toMutableList()
    val existingIndex = current.indexOfFirst { it.product.id == product.id }
    if (existingIndex >= 0) {
      val item = current[existingIndex]
      val newQty = item.quantity + quantity
      if (newQty <= product.stockQuantity) {
        current[existingIndex] = item.copy(quantity = newQty)
      }
    } else {
      if (quantity <= product.stockQuantity) {
        current.add(CartItem(product, quantity))
      }
    }
    _cartItems.value = current
  }

  fun updateCartQuantity(productId: String, quantity: Int) {
    val current = _cartItems.value.toMutableList()
    val index = current.indexOfFirst { it.product.id == productId }
    if (index >= 0) {
      if (quantity <= 0) {
        current.removeAt(index)
      } else {
        val item = current[index]
        if (quantity <= item.product.stockQuantity) {
          current[index] = item.copy(quantity = quantity)
        }
      }
      _cartItems.value = current
    }
  }

  fun removeFromCart(productId: String) {
    _cartItems.value = _cartItems.value.filterNot { it.product.id == productId }
  }

  fun clearCart() {
    _cartItems.value = emptyList()
  }

  fun placeOrder(
    customerName: String,
    customerPhone: String,
    shippingAddress: String,
    paymentMethod: PaymentMethod,
    couponApplied: Boolean
  ): OrderRecord {
    val items = _cartItems.value
    val subtotal = items.sumOf { it.totalPrice }
    val discount = if (couponApplied) 100.0 else 0.0
    val delivery = 60.0
    val total = (subtotal - discount + delivery).coerceAtLeast(0.0)

    val orderItems = items.map {
      OrderItemRecord(
        productId = it.product.id,
        productName = it.product.name,
        shopName = it.product.shopName,
        quantity = it.quantity,
        unitPrice = it.product.activePrice,
        totalPrice = it.totalPrice
      )
    }

    // Deduct stocks
    val updatedProducts = _products.value.map { prod ->
      val cartItem = items.find { it.product.id == prod.id }
      if (cartItem != null) {
        prod.copy(stockQuantity = (prod.stockQuantity - cartItem.quantity).coerceAtLeast(0))
      } else {
        prod
      }
    }
    _products.value = updatedProducts

    val newOrder = OrderRecord(
      customerName = customerName,
      customerPhone = customerPhone,
      shippingAddress = shippingAddress,
      items = orderItems,
      subtotal = subtotal,
      deliveryCharge = delivery,
      discountAmount = discount,
      totalAmount = total,
      status = OrderStatus.CONFIRMED,
      paymentMethod = paymentMethod,
      paymentStatus = if (paymentMethod == PaymentMethod.COD) "UNPAID (COD)" else "PAID"
    )

    _orders.value = listOf(newOrder) + _orders.value
    clearCart()

    // Add to seller pending balance
    val sellerShare = total * 0.95 // 5% LUREX commission
    sellerPendingBalance.value += sellerShare

    return newOrder
  }

  fun addProduct(product: Product) {
    _products.value = listOf(product) + _products.value
  }

  fun updateOrderStatus(orderId: String, newStatus: OrderStatus) {
    _orders.value = _orders.value.map {
      if (it.id == orderId) it.copy(status = newStatus) else it
    }
  }

  fun approveShop(shopId: String) {
    _shops.value = _shops.value.map {
      if (it.id == shopId) it.copy(status = "APPROVED") else it
    }
  }

  fun rejectShop(shopId: String) {
    _shops.value = _shops.value.map {
      if (it.id == shopId) it.copy(status = "REJECTED") else it
    }
  }

  fun requestWithdrawal(method: String, account: String, amount: Double) {
    if (sellerAvailableBalance.value >= amount) {
      sellerAvailableBalance.value -= amount
      val req = PayoutRequest(
        sellerName = "Tanvir Hossain (My Shop)",
        method = method,
        accountNumber = account,
        amount = amount,
        status = "PENDING"
      )
      _payouts.value = listOf(req) + _payouts.value
    }
  }

  fun disbursePayout(payoutId: String) {
    _payouts.value = _payouts.value.map {
      if (it.id == payoutId) it.copy(status = "PAID") else it
    }
  }
}
