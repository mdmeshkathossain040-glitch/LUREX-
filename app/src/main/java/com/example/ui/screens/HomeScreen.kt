package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.*
import com.example.ui.BuyerTab
import com.example.ui.LurexViewModel
import com.example.ui.components.*
import com.example.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BuyerScreen(
  viewModel: LurexViewModel,
  modifier: Modifier = Modifier
) {
  val activeTab by viewModel.buyerTab.collectAsState()
  val cartItems by viewModel.repository.cartItems.collectAsState()
  val orders by viewModel.repository.orders.collectAsState()
  val selectedProduct by viewModel.selectedProduct.collectAsState()
  val showCheckout by viewModel.showCheckoutDialog.collectAsState()

  Scaffold(
    modifier = modifier,
    bottomBar = {
      NavigationBar(
        containerColor = Color.White,
        tonalElevation = 8.dp
      ) {
        NavigationBarItem(
          icon = { Icon(Icons.Default.Storefront, contentDescription = "Shop") },
          label = { Text("Shop") },
          selected = activeTab == BuyerTab.SHOP,
          onClick = { viewModel.setBuyerTab(BuyerTab.SHOP) },
          colors = NavigationBarItemDefaults.colors(selectedIconColor = LurexEmerald, selectedTextColor = LurexEmerald)
        )
        NavigationBarItem(
          icon = { Icon(Icons.Default.Category, contentDescription = "Categories") },
          label = { Text("Categories") },
          selected = activeTab == BuyerTab.CATEGORIES,
          onClick = { viewModel.setBuyerTab(BuyerTab.CATEGORIES) },
          colors = NavigationBarItemDefaults.colors(selectedIconColor = LurexEmerald, selectedTextColor = LurexEmerald)
        )
        NavigationBarItem(
          icon = {
            BadgedBox(
              badge = {
                if (cartItems.isNotEmpty()) {
                  Badge(containerColor = LurexGold) {
                    Text(cartItems.sumOf { it.quantity }.toString(), color = Color.White)
                  }
                }
              }
            ) {
              Icon(Icons.Default.ShoppingCart, contentDescription = "Cart")
            }
          },
          label = { Text("Cart") },
          selected = activeTab == BuyerTab.CART,
          onClick = { viewModel.setBuyerTab(BuyerTab.CART) },
          colors = NavigationBarItemDefaults.colors(selectedIconColor = LurexEmerald, selectedTextColor = LurexEmerald)
        )
        NavigationBarItem(
          icon = { Icon(Icons.Default.ReceiptLong, contentDescription = "Orders") },
          label = { Text("Orders") },
          selected = activeTab == BuyerTab.ORDERS,
          onClick = { viewModel.setBuyerTab(BuyerTab.ORDERS) },
          colors = NavigationBarItemDefaults.colors(selectedIconColor = LurexEmerald, selectedTextColor = LurexEmerald)
        )
        NavigationBarItem(
          icon = { Icon(Icons.Default.Person, contentDescription = "Profile") },
          label = { Text("Profile") },
          selected = activeTab == BuyerTab.PROFILE,
          onClick = { viewModel.setBuyerTab(BuyerTab.PROFILE) },
          colors = NavigationBarItemDefaults.colors(selectedIconColor = LurexEmerald, selectedTextColor = LurexEmerald)
        )
      }
    }
  ) { innerPadding ->
    Box(
      modifier = Modifier
        .fillMaxSize()
        .padding(innerPadding)
    ) {
      when (activeTab) {
        BuyerTab.SHOP -> ShopCatalogView(viewModel)
        BuyerTab.CATEGORIES -> CategoriesListView(viewModel)
        BuyerTab.CART -> CartView(viewModel)
        BuyerTab.ORDERS -> OrdersHistoryView(orders)
        BuyerTab.PROFILE -> ProfileView()
      }

      // Product Details Sheet/Dialog
      if (selectedProduct != null) {
        ProductDetailsDialog(
          product = selectedProduct!!,
          onDismiss = { viewModel.closeProductDetails() },
          onAddToCart = {
            viewModel.repository.addToCart(selectedProduct!!)
            viewModel.closeProductDetails()
          }
        )
      }

      // Checkout Dialog
      if (showCheckout) {
        CheckoutDialog(
          cartItems = cartItems,
          onDismiss = { viewModel.setCheckoutDialog(false) },
          onPlaceOrder = { name, phone, address, paymentMethod, coupon ->
            viewModel.repository.placeOrder(name, phone, address, paymentMethod, coupon)
            viewModel.setCheckoutDialog(false)
            viewModel.setBuyerTab(BuyerTab.ORDERS)
          }
        )
      }
    }
  }
}

@Composable
fun ShopCatalogView(viewModel: LurexViewModel) {
  val products by viewModel.filteredProducts.collectAsState()
  val categories = viewModel.repository.categories
  val selectedCat by viewModel.selectedCategory.collectAsState()
  val query by viewModel.searchQuery.collectAsState()

  LazyColumn(
    modifier = Modifier.fillMaxSize(),
    contentPadding = PaddingValues(bottom = 16.dp)
  ) {
    // Search Bar
    item {
      OutlinedTextField(
        value = query,
        onValueChange = { viewModel.setSearchQuery(it) },
        modifier = Modifier
          .fillMaxWidth()
          .padding(horizontal = 16.dp, vertical = 8.dp)
          .testTag("search_text_field"),
        placeholder = { Text("Search products, jamdani, gadgets, shops...") },
        leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = LurexMuted) },
        trailingIcon = {
          if (query.isNotEmpty()) {
            IconButton(onClick = { viewModel.setSearchQuery("") }) {
              Icon(Icons.Default.Clear, contentDescription = "Clear")
            }
          }
        },
        shape = RoundedCornerShape(12.dp),
        colors = OutlinedTextFieldDefaults.colors(
          focusedBorderColor = LurexEmerald,
          unfocusedBorderColor = LurexCardBorder
        ),
        singleLine = true
      )
    }

    // Hero Banner
    item {
      HeroBanner()
    }

    // Horizontal Categories
    item {
      Column(modifier = Modifier.padding(vertical = 6.dp)) {
        Text(
          text = "Categories",
          fontWeight = FontWeight.Bold,
          fontSize = 16.sp,
          color = LurexSlate,
          modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)
        )
        LazyRow(
          contentPadding = PaddingValues(horizontal = 16.dp),
          horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
          items(categories) { cat ->
            CategoryChip(
              category = cat,
              isSelected = cat.id == selectedCat,
              onSelect = { viewModel.selectCategory(cat.id) }
            )
          }
        }
      }
    }

    // Products Header
    item {
      Row(
        modifier = Modifier
          .fillMaxWidth()
          .padding(horizontal = 16.dp, vertical = 10.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
      ) {
        Text(
          text = if (selectedCat == "all") "Popular Products" else "Items in category",
          fontWeight = FontWeight.Bold,
          fontSize = 17.sp,
          color = LurexSlate
        )
        Text(
          text = "${products.size} available",
          fontSize = 12.sp,
          color = LurexMuted
        )
      }
    }

    // Product Grid items
    item {
      Column(modifier = Modifier.padding(horizontal = 16.dp)) {
        val chunked = products.chunked(2)
        chunked.forEach { rowItems ->
          Row(
            modifier = Modifier
              .fillMaxWidth()
              .padding(bottom = 12.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
          ) {
            rowItems.forEach { prod ->
              Box(modifier = Modifier.weight(1f)) {
                ProductCard(
                  product = prod,
                  onClick = { viewModel.openProductDetails(prod) },
                  onAddToCart = { viewModel.repository.addToCart(prod) }
                )
              }
            }
            if (rowItems.size == 1) {
              Spacer(modifier = Modifier.weight(1f))
            }
          }
        }
      }
    }
  }
}

@Composable
fun CategoriesListView(viewModel: LurexViewModel) {
  val categories = viewModel.repository.categories
  LazyColumn(
    modifier = Modifier.fillMaxSize(),
    contentPadding = PaddingValues(16.dp)
  ) {
    item {
      Text(
        text = "Explore All Categories",
        fontWeight = FontWeight.Bold,
        fontSize = 20.sp,
        modifier = Modifier.padding(bottom = 12.dp)
      )
    }
    items(categories) { cat ->
      Card(
        modifier = Modifier
          .fillMaxWidth()
          .padding(bottom = 8.dp)
          .clickable {
            viewModel.selectCategory(cat.id)
            viewModel.setBuyerTab(BuyerTab.SHOP)
          },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        border = androidx.compose.foundation.BorderStroke(1.dp, LurexCardBorder)
      ) {
        Row(
          modifier = Modifier.padding(16.dp),
          verticalAlignment = Alignment.CenterVertically
        ) {
          Icon(Icons.Default.Category, contentDescription = null, tint = LurexEmerald)
          Spacer(modifier = Modifier.width(16.dp))
          Text(text = cat.name, fontWeight = FontWeight.SemiBold, fontSize = 16.sp)
          Spacer(modifier = Modifier.weight(1f))
          Icon(Icons.Default.ChevronRight, contentDescription = null, tint = LurexMuted)
        }
      }
    }
  }
}

@Composable
fun CartView(viewModel: LurexViewModel) {
  val cartItems by viewModel.repository.cartItems.collectAsState()
  val subtotal = cartItems.sumOf { it.totalPrice }
  val deliveryCharge = if (cartItems.isNotEmpty()) 60.0 else 0.0
  val total = subtotal + deliveryCharge

  if (cartItems.isEmpty()) {
    Box(
      modifier = Modifier
        .fillMaxSize()
        .padding(32.dp),
      contentAlignment = Alignment.Center
    ) {
      Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Icon(Icons.Outlined.ShoppingCart, contentDescription = null, modifier = Modifier.size(64.dp), tint = LurexMuted)
        Spacer(modifier = Modifier.height(16.dp))
        Text("Your shopping cart is empty", fontWeight = FontWeight.Bold, fontSize = 18.sp)
        Spacer(modifier = Modifier.height(8.dp))
        Text("Explore top Bangladeshi vendors and add items", color = LurexMuted, fontSize = 13.sp)
        Spacer(modifier = Modifier.height(20.dp))
        Button(
          onClick = { viewModel.setBuyerTab(BuyerTab.SHOP) },
          colors = ButtonDefaults.buttonColors(containerColor = LurexEmerald)
        ) {
          Text("Start Shopping")
        }
      }
    }
  } else {
    Column(modifier = Modifier.fillMaxSize()) {
      LazyColumn(
        modifier = Modifier
          .weight(1f)
          .padding(16.dp)
      ) {
        item {
          Text("My Shopping Bag (${cartItems.size})", fontWeight = FontWeight.Bold, fontSize = 20.sp, modifier = Modifier.padding(bottom = 12.dp))
        }
        items(cartItems) { item ->
          Card(
            modifier = Modifier
              .fillMaxWidth()
              .padding(bottom = 10.dp),
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            border = androidx.compose.foundation.BorderStroke(1.dp, LurexCardBorder)
          ) {
            Row(
              modifier = Modifier.padding(12.dp),
              verticalAlignment = Alignment.CenterVertically
            ) {
              Box(
                modifier = Modifier
                  .size(54.dp)
                  .background(Color(0xFFF1F5F9), RoundedCornerShape(8.dp)),
                contentAlignment = Alignment.Center
              ) {
                Icon(Icons.Default.ShoppingBag, contentDescription = null, tint = LurexEmerald)
              }
              Spacer(modifier = Modifier.width(12.dp))
              Column(modifier = Modifier.weight(1f)) {
                Text(item.product.name, fontWeight = FontWeight.SemiBold, fontSize = 14.sp, maxLines = 1)
                Text(item.product.shopName, fontSize = 11.sp, color = LurexMuted)
                Text("৳ ${item.product.activePrice.toInt()}", fontWeight = FontWeight.Bold, color = LurexEmerald, fontSize = 14.sp)
              }
              Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(
                  onClick = { viewModel.repository.updateCartQuantity(item.product.id, item.quantity - 1) },
                  modifier = Modifier.size(32.dp)
                ) {
                  Icon(Icons.Default.RemoveCircleOutline, contentDescription = "Decrease", tint = LurexEmerald)
                }
                Text(
                  text = item.quantity.toString(),
                  fontWeight = FontWeight.Bold,
                  fontSize = 14.sp,
                  modifier = Modifier.padding(horizontal = 6.dp)
                )
                IconButton(
                  onClick = { viewModel.repository.updateCartQuantity(item.product.id, item.quantity + 1) },
                  modifier = Modifier.size(32.dp)
                ) {
                  Icon(Icons.Default.AddCircleOutline, contentDescription = "Increase", tint = LurexEmerald)
                }
              }
            }
          }
        }
      }

      // Bottom Checkout summary
      Surface(
        color = Color.White,
        shadowElevation = 12.dp,
        border = androidx.compose.foundation.BorderStroke(1.dp, LurexCardBorder)
      ) {
        Column(modifier = Modifier.padding(16.dp)) {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
          ) {
            Text("Subtotal:", color = LurexMuted)
            Text("৳ ${subtotal.toInt()}", fontWeight = FontWeight.Bold)
          }
          Spacer(modifier = Modifier.height(4.dp))
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
          ) {
            Text("Delivery Fee (All Bangladesh):", color = LurexMuted)
            Text("৳ ${deliveryCharge.toInt()}", fontWeight = FontWeight.Bold)
          }
          Divider(modifier = Modifier.padding(vertical = 8.dp))
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Text("Total Amount:", fontWeight = FontWeight.Bold, fontSize = 16.sp)
            Text("৳ ${total.toInt()}", fontWeight = FontWeight.ExtraBold, fontSize = 19.sp, color = LurexEmerald)
          }
          Spacer(modifier = Modifier.height(12.dp))
          Button(
            onClick = { viewModel.setCheckoutDialog(true) },
            colors = ButtonDefaults.buttonColors(containerColor = LurexEmerald),
            shape = RoundedCornerShape(8.dp),
            modifier = Modifier
              .fillMaxWidth()
              .testTag("proceed_to_checkout_button")
          ) {
            Text("Proceed to Checkout (bKash/Nagad/COD)", fontWeight = FontWeight.Bold, fontSize = 15.sp)
          }
        }
      }
    }
  }
}

@Composable
fun OrdersHistoryView(orders: List<OrderRecord>) {
  LazyColumn(
    modifier = Modifier.fillMaxSize(),
    contentPadding = PaddingValues(16.dp)
  ) {
    item {
      Text("Order History", fontWeight = FontWeight.Bold, fontSize = 20.sp, modifier = Modifier.padding(bottom = 12.dp))
    }
    items(orders) { order ->
      Card(
        modifier = Modifier
          .fillMaxWidth()
          .padding(bottom = 12.dp),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        border = androidx.compose.foundation.BorderStroke(1.dp, LurexCardBorder)
      ) {
        Column(modifier = Modifier.padding(16.dp)) {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Text("Order #${order.id}", fontWeight = FontWeight.Bold, fontSize = 15.sp)
            Surface(
              color = when (order.status) {
                OrderStatus.DELIVERED -> Color(0xFFDCFCE7)
                OrderStatus.CANCELLED -> Color(0xFFFEE2E2)
                else -> Color(0xFFFEF3C7)
              },
              shape = RoundedCornerShape(12.dp)
            ) {
              Text(
                text = order.status.name,
                color = when (order.status) {
                  OrderStatus.DELIVERED -> Color(0xFF166534)
                  OrderStatus.CANCELLED -> Color(0xFF991B1B)
                  else -> Color(0xFF92400E)
                },
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
              )
            }
          }
          Spacer(modifier = Modifier.height(8.dp))
          order.items.forEach { itm ->
            Text("• ${itm.quantity}x ${itm.productName} (${itm.shopName})", fontSize = 13.sp, color = LurexSlate)
          }
          Spacer(modifier = Modifier.height(8.dp))
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
          ) {
            Text("Payment: ${order.paymentMethod.displayName}", fontSize = 12.sp, color = LurexMuted)
            Text("Total: ৳ ${order.totalAmount.toInt()}", fontWeight = FontWeight.Bold, color = LurexEmerald)
          }
        }
      }
    }
  }
}

@Composable
fun ProfileView() {
  LazyColumn(
    modifier = Modifier.fillMaxSize(),
    contentPadding = PaddingValues(16.dp)
  ) {
    item {
      Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = LurexEmerald)
      ) {
        Column(modifier = Modifier.padding(20.dp)) {
          Text("Meshkat Hossain", fontWeight = FontWeight.Bold, fontSize = 20.sp, color = Color.White)
          Text("+880 1700-000000", color = Color.White.copy(alpha = 0.8f), fontSize = 14.sp)
          Spacer(modifier = Modifier.height(8.dp))
          Surface(
            color = LurexGold,
            shape = RoundedCornerShape(12.dp)
          ) {
            Text("Verified Buyer", color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp))
          }
        }
      }
    }

    item {
      Spacer(modifier = Modifier.height(16.dp))
      Text("Account Details", fontWeight = FontWeight.Bold, fontSize = 16.sp, modifier = Modifier.padding(vertical = 8.dp))
    }

    item {
      Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        border = androidx.compose.foundation.BorderStroke(1.dp, LurexCardBorder)
      ) {
        Column {
          ListItem(
            headlineContent = { Text("Delivery Address") },
            supportingContent = { Text("House 42, Road 11, Banani, Dhaka-1213") },
            leadingContent = { Icon(Icons.Default.LocationOn, contentDescription = null, tint = LurexEmerald) }
          )
          Divider()
          ListItem(
            headlineContent = { Text("Saved Payment Cards & MFS") },
            supportingContent = { Text("bKash (+8801700000000)") },
            leadingContent = { Icon(Icons.Default.Payment, contentDescription = null, tint = LurexEmerald) }
          )
          Divider()
          ListItem(
            headlineContent = { Text("Help & Support") },
            supportingContent = { Text("24/7 Helpline: 16216 • support@lurex.com.bd") },
            leadingContent = { Icon(Icons.Default.SupportAgent, contentDescription = null, tint = LurexEmerald) }
          )
        }
      }
    }
  }
}

@Composable
fun ProductDetailsDialog(
  product: Product,
  onDismiss: () -> Unit,
  onAddToCart: () -> Unit
) {
  AlertDialog(
    onDismissRequest = onDismiss,
    confirmButton = {
      Button(
        onClick = onAddToCart,
        colors = ButtonDefaults.buttonColors(containerColor = LurexEmerald),
        modifier = Modifier.testTag("dialog_add_to_cart_button")
      ) {
        Text("Add to Cart")
      }
    },
    dismissButton = {
      TextButton(onClick = onDismiss) {
        Text("Close")
      }
    },
    title = {
      Text(product.name, fontWeight = FontWeight.Bold, fontSize = 17.sp)
    },
    text = {
      Column {
        Text("Shop: ${product.shopName}", color = LurexMuted, fontSize = 13.sp)
        Spacer(modifier = Modifier.height(6.dp))
        Row(verticalAlignment = Alignment.CenterVertically) {
          Text("৳ ${product.activePrice.toInt()}", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = LurexEmerald)
          if (product.discountPrice != null) {
            Spacer(modifier = Modifier.width(8.dp))
            Text("৳ ${product.price.toInt()}", fontSize = 13.sp, color = LurexMuted, textDecoration = TextDecoration.LineThrough)
          }
        }
        Spacer(modifier = Modifier.height(10.dp))
        Text(product.description, fontSize = 13.sp, color = LurexSlate, lineHeight = 18.sp)
        Spacer(modifier = Modifier.height(12.dp))
        Surface(
          color = Color(0xFFF1F5F9),
          shape = RoundedCornerShape(8.dp)
        ) {
          Row(
            modifier = Modifier
              .fillMaxWidth()
              .padding(8.dp),
            horizontalArrangement = Arrangement.SpaceBetween
          ) {
            Text("Stock: ${product.stockQuantity} units", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
            Text("7-Day Return Policy", fontSize = 12.sp, color = LurexEmerald, fontWeight = FontWeight.Bold)
          }
        }
      }
    }
  )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CheckoutDialog(
  cartItems: List<CartItem>,
  onDismiss: () -> Unit,
  onPlaceOrder: (String, String, String, PaymentMethod, Boolean) -> Unit
) {
  var name by remember { mutableStateOf("Meshkat Hossain") }
  var phone by remember { mutableStateOf("+8801700000000") }
  var address by remember { mutableStateOf("House 42, Road 11, Banani, Dhaka-1213") }
  var selectedMethod by remember { mutableStateOf(PaymentMethod.BKASH) }
  var couponCode by remember { mutableStateOf("") }
  var couponApplied by remember { mutableStateOf(false) }

  val subtotal = cartItems.sumOf { it.totalPrice }
  val discount = if (couponApplied) 100.0 else 0.0
  val total = (subtotal - discount + 60.0).coerceAtLeast(0.0)

  AlertDialog(
    onDismissRequest = onDismiss,
    confirmButton = {
      Button(
        onClick = { onPlaceOrder(name, phone, address, selectedMethod, couponApplied) },
        colors = ButtonDefaults.buttonColors(containerColor = LurexEmerald),
        modifier = Modifier.testTag("confirm_place_order_button")
      ) {
        Text("Confirm & Pay ৳ ${total.toInt()}")
      }
    },
    dismissButton = {
      TextButton(onClick = onDismiss) {
        Text("Cancel")
      }
    },
    title = {
      Text("LUREX Checkout", fontWeight = FontWeight.Bold)
    },
    text = {
      LazyColumn(modifier = Modifier.fillMaxWidth()) {
        item {
          OutlinedTextField(
            value = name,
            onValueChange = { name = it },
            label = { Text("Recipient Name") },
            modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp)
          )
        }
        item {
          OutlinedTextField(
            value = phone,
            onValueChange = { phone = it },
            label = { Text("Phone Number (+880)") },
            modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp)
          )
        }
        item {
          OutlinedTextField(
            value = address,
            onValueChange = { address = it },
            label = { Text("Full Delivery Address (District/Thana)") },
            modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp)
          )
        }

        // Coupon section
        item {
          Row(
            modifier = Modifier.fillMaxWidth().padding(bottom = 12.dp),
            verticalAlignment = Alignment.CenterVertically
          ) {
            OutlinedTextField(
              value = couponCode,
              onValueChange = { couponCode = it },
              placeholder = { Text("Try code: LUREX100") },
              modifier = Modifier.weight(1f),
              singleLine = true
            )
            Spacer(modifier = Modifier.width(8.dp))
            Button(
              onClick = {
                if (couponCode.trim().equals("LUREX100", ignoreCase = true)) {
                  couponApplied = true
                }
              },
              colors = ButtonDefaults.buttonColors(containerColor = if (couponApplied) Color(0xFF166534) else LurexGold)
            ) {
              Text(if (couponApplied) "Applied!" else "Apply")
            }
          }
        }

        // Payment Method Selector
        item {
          Text("Select Payment Gateway", fontWeight = FontWeight.Bold, fontSize = 14.sp, modifier = Modifier.padding(bottom = 6.dp))
          PaymentMethod.values().forEach { method ->
            Surface(
              onClick = { selectedMethod = method },
              shape = RoundedCornerShape(8.dp),
              color = if (selectedMethod == method) LurexEmerald.copy(alpha = 0.1f) else Color.White,
              border = androidx.compose.foundation.BorderStroke(
                1.dp,
                if (selectedMethod == method) LurexEmerald else LurexCardBorder
              ),
              modifier = Modifier.fillMaxWidth().padding(bottom = 6.dp)
            ) {
              Row(
                modifier = Modifier.padding(horizontal = 12.dp, vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically
              ) {
                RadioButton(
                  selected = selectedMethod == method,
                  onClick = { selectedMethod = method },
                  colors = RadioButtonDefaults.colors(selectedColor = LurexEmerald)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                  text = method.displayName,
                  fontWeight = if (selectedMethod == method) FontWeight.Bold else FontWeight.Normal
                )
                Spacer(modifier = Modifier.weight(1f))
                if (method == PaymentMethod.BKASH) {
                  Text("Instant MFS", fontSize = 10.sp, color = BkashPink, fontWeight = FontWeight.Bold)
                } else if (method == PaymentMethod.NAGAD) {
                  Text("Instant MFS", fontSize = 10.sp, color = NagadOrange, fontWeight = FontWeight.Bold)
                }
              }
            }
          }
        }
      }
    }
  )
}
