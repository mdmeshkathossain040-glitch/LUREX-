package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.*
import com.example.ui.LurexViewModel
import com.example.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SellerScreen(
  viewModel: LurexViewModel,
  modifier: Modifier = Modifier
) {
  val availableBalance by viewModel.repository.sellerAvailableBalance.collectAsState()
  val pendingBalance by viewModel.repository.sellerPendingBalance.collectAsState()
  val products by viewModel.repository.products.collectAsState()
  val orders by viewModel.repository.orders.collectAsState()
  val showAddProduct by viewModel.showAddProductDialog.collectAsState()
  val showWithdrawal by viewModel.showWithdrawalDialog.collectAsState()

  Scaffold(
    modifier = modifier,
    floatingActionButton = {
      ExtendedFloatingActionButton(
        onClick = { viewModel.setAddProductDialog(true) },
        icon = { Icon(Icons.Default.Add, contentDescription = null) },
        text = { Text("Add Product") },
        containerColor = LurexEmerald,
        contentColor = Color.White,
        modifier = Modifier.testTag("seller_add_product_fab")
      )
    }
  ) { innerPadding ->
    LazyColumn(
      modifier = Modifier
        .fillMaxSize()
        .padding(innerPadding)
        .padding(16.dp),
      verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
      // Shop Identity Card
      item {
        Card(
          shape = RoundedCornerShape(16.dp),
          colors = CardDefaults.cardColors(containerColor = LurexSlate)
        ) {
          Column(modifier = Modifier.padding(20.dp)) {
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween,
              verticalAlignment = Alignment.CenterVertically
            ) {
              Column {
                Text("Dhaka Gadget Hub", color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                Text("Proprietor: Tanvir Hossain (+8801711223344)", color = Color.White.copy(alpha = 0.7f), fontSize = 12.sp)
              }
              Surface(
                color = Color(0xFF10B981),
                shape = RoundedCornerShape(12.dp)
              ) {
                Text("APPROVED SHOP", color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp))
              }
            }

            Spacer(modifier = Modifier.height(16.dp))
            Divider(color = Color.White.copy(alpha = 0.15f))
            Spacer(modifier = Modifier.height(16.dp))

            // Wallet Row
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween
            ) {
              Column {
                Text("Available Balance", color = Color.White.copy(alpha = 0.7f), fontSize = 12.sp)
                Text("৳ ${availableBalance.toInt()}", color = Color.White, fontSize = 24.sp, fontWeight = FontWeight.ExtraBold)
              }
              Column(horizontalAlignment = Alignment.End) {
                Text("Pending Clearance", color = Color.White.copy(alpha = 0.7f), fontSize = 12.sp)
                Text("৳ ${pendingBalance.toInt()}", color = LurexLightGold, fontSize = 18.sp, fontWeight = FontWeight.Bold)
              }
            }

            Spacer(modifier = Modifier.height(16.dp))
            Button(
              onClick = { viewModel.setWithdrawalDialog(true) },
              colors = ButtonDefaults.buttonColors(containerColor = LurexEmerald),
              shape = RoundedCornerShape(8.dp),
              modifier = Modifier.fillMaxWidth().testTag("request_payout_button")
            ) {
              Icon(Icons.Default.AccountBalanceWallet, contentDescription = null)
              Spacer(modifier = Modifier.width(8.dp))
              Text("Request Payout (bKash / Bank)", fontWeight = FontWeight.Bold)
            }
          }
        }
      }

      // Marketplace Commission Info Banner
      item {
        Surface(
          color = Color(0xFFDCFCE7),
          shape = RoundedCornerShape(12.dp),
          border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFBBF7D0))
        ) {
          Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
          ) {
            Icon(Icons.Default.Verified, contentDescription = null, tint = Color(0xFF166534))
            Spacer(modifier = Modifier.width(12.dp))
            Text(
              "Transparent 5% platform commission on settled orders. Net proceeds automatically credited to your seller wallet.",
              fontSize = 12.sp,
              color = Color(0xFF166534),
              lineHeight = 16.sp
            )
          }
        }
      }

      // Active Shop Orders
      item {
        Text("Active Customer Orders", fontWeight = FontWeight.Bold, fontSize = 18.sp)
      }

      items(orders) { ord ->
        Card(
          shape = RoundedCornerShape(12.dp),
          colors = CardDefaults.cardColors(containerColor = Color.White),
          border = androidx.compose.foundation.BorderStroke(1.dp, LurexCardBorder)
        ) {
          Column(modifier = Modifier.padding(14.dp)) {
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.SpaceBetween
            ) {
              Text("Order #${ord.id}", fontWeight = FontWeight.Bold, fontSize = 14.sp)
              Text("৳ ${ord.totalAmount.toInt()}", fontWeight = FontWeight.Bold, color = LurexEmerald)
            }
            Text("Customer: ${ord.customerName} (${ord.customerPhone})", fontSize = 12.sp, color = LurexMuted)
            Text("Address: ${ord.shippingAddress}", fontSize = 12.sp, color = LurexSlate)

            Spacer(modifier = Modifier.height(10.dp))
            Row(
              modifier = Modifier.fillMaxWidth(),
              horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
              OutlinedButton(
                onClick = { viewModel.repository.updateOrderStatus(ord.id, OrderStatus.PROCESSING) },
                shape = RoundedCornerShape(6.dp),
                modifier = Modifier.weight(1f)
              ) {
                Text("Processing", fontSize = 11.sp)
              }
              Button(
                onClick = { viewModel.repository.updateOrderStatus(ord.id, OrderStatus.SHIPPED) },
                colors = ButtonDefaults.buttonColors(containerColor = LurexGold),
                shape = RoundedCornerShape(6.dp),
                modifier = Modifier.weight(1f)
              ) {
                Text("Ship Order", fontSize = 11.sp)
              }
              Button(
                onClick = { viewModel.repository.updateOrderStatus(ord.id, OrderStatus.DELIVERED) },
                colors = ButtonDefaults.buttonColors(containerColor = LurexEmerald),
                shape = RoundedCornerShape(6.dp),
                modifier = Modifier.weight(1f)
              ) {
                Text("Delivered", fontSize = 11.sp)
              }
            }
          }
        }
      }

      // Inventory
      item {
        Text("Shop Inventory (${products.size} Items)", fontWeight = FontWeight.Bold, fontSize = 18.sp)
      }

      items(products) { prod ->
        Card(
          shape = RoundedCornerShape(10.dp),
          colors = CardDefaults.cardColors(containerColor = Color.White),
          border = androidx.compose.foundation.BorderStroke(1.dp, LurexCardBorder)
        ) {
          Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
          ) {
            Column(modifier = Modifier.weight(1f)) {
              Text(prod.name, fontWeight = FontWeight.SemiBold, fontSize = 14.sp, maxLines = 1)
              Text("Category: ${prod.categoryName}", fontSize = 11.sp, color = LurexMuted)
              Text("Price: ৳ ${prod.activePrice.toInt()}", fontWeight = FontWeight.Bold, color = LurexEmerald, fontSize = 13.sp)
            }
            Surface(
              color = if (prod.stockQuantity > 5) Color(0xFFDCFCE7) else Color(0xFFFEE2E2),
              shape = RoundedCornerShape(8.dp)
            ) {
              Text(
                "${prod.stockQuantity} in stock",
                color = if (prod.stockQuantity > 5) Color(0xFF166534) else Color(0xFF991B1B),
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
              )
            }
          }
        }
      }
    }
  }

  // Add Product Dialog
  if (showAddProduct) {
    AddProductDialog(
      onDismiss = { viewModel.setAddProductDialog(false) },
      onAdd = { name, category, price, discount, stock, desc ->
        val newProd = Product(
          name = name,
          categoryId = category.lowercase(),
          categoryName = category,
          shopId = "s-2",
          shopName = "Dhaka Gadget Hub",
          price = price,
          discountPrice = discount,
          stockQuantity = stock,
          description = desc
        )
        viewModel.repository.addProduct(newProd)
        viewModel.setAddProductDialog(false)
      }
    )
  }

  // Withdrawal Dialog
  if (showWithdrawal) {
    WithdrawalDialog(
      availableBalance = availableBalance,
      onDismiss = { viewModel.setWithdrawalDialog(false) },
      onSubmit = { method, account, amount ->
        viewModel.repository.requestWithdrawal(method, account, amount)
        viewModel.setWithdrawalDialog(false)
      }
    )
  }
}

@Composable
fun AddProductDialog(
  onDismiss: () -> Unit,
  onAdd: (String, String, Double, Double?, Int, String) -> Unit
) {
  var name by remember { mutableStateOf("") }
  var category by remember { mutableStateOf("Electronics") }
  var priceStr by remember { mutableStateOf("") }
  var discountStr by remember { mutableStateOf("") }
  var stockStr by remember { mutableStateOf("10") }
  var desc by remember { mutableStateOf("") }

  AlertDialog(
    onDismissRequest = onDismiss,
    confirmButton = {
      Button(
        onClick = {
          val price = priceStr.toDoubleOrNull() ?: 100.0
          val discount = discountStr.toDoubleOrNull()
          val stock = stockStr.toIntOrNull() ?: 10
          if (name.isNotBlank()) {
            onAdd(name, category, price, discount, stock, desc)
          }
        },
        colors = ButtonDefaults.buttonColors(containerColor = LurexEmerald),
        modifier = Modifier.testTag("confirm_add_product_button")
      ) {
        Text("Publish Product")
      }
    },
    dismissButton = {
      TextButton(onClick = onDismiss) { Text("Cancel") }
    },
    title = { Text("Add New Product to LUREX") },
    text = {
      Column {
        OutlinedTextField(
          value = name,
          onValueChange = { name = it },
          label = { Text("Product Title") },
          modifier = Modifier.fillMaxWidth().padding(bottom = 6.dp)
        )
        OutlinedTextField(
          value = priceStr,
          onValueChange = { priceStr = it },
          label = { Text("Regular Price (BDT)") },
          modifier = Modifier.fillMaxWidth().padding(bottom = 6.dp)
        )
        OutlinedTextField(
          value = discountStr,
          onValueChange = { discountStr = it },
          label = { Text("Discounted Price (Optional)") },
          modifier = Modifier.fillMaxWidth().padding(bottom = 6.dp)
        )
        OutlinedTextField(
          value = stockStr,
          onValueChange = { stockStr = it },
          label = { Text("Initial Stock Units") },
          modifier = Modifier.fillMaxWidth().padding(bottom = 6.dp)
        )
        OutlinedTextField(
          value = desc,
          onValueChange = { desc = it },
          label = { Text("Product Description & Warranty") },
          modifier = Modifier.fillMaxWidth()
        )
      }
    }
  )
}

@Composable
fun WithdrawalDialog(
  availableBalance: Double,
  onDismiss: () -> Unit,
  onSubmit: (String, String, Double) -> Unit
) {
  var method by remember { mutableStateOf("bKash Merchant") }
  var account by remember { mutableStateOf("+8801711223344") }
  var amountStr by remember { mutableStateOf("5000") }

  AlertDialog(
    onDismissRequest = onDismiss,
    confirmButton = {
      Button(
        onClick = {
          val amt = amountStr.toDoubleOrNull() ?: 500.0
          if (amt >= 500 && amt <= availableBalance) {
            onSubmit(method, account, amt)
          }
        },
        colors = ButtonDefaults.buttonColors(containerColor = LurexEmerald),
        modifier = Modifier.testTag("confirm_withdrawal_button")
      ) {
        Text("Submit Withdrawal")
      }
    },
    dismissButton = {
      TextButton(onClick = onDismiss) { Text("Cancel") }
    },
    title = { Text("Request Balance Withdrawal") },
    text = {
      Column {
        Text("Available to Withdraw: ৳ ${availableBalance.toInt()}", fontWeight = FontWeight.Bold, color = LurexEmerald)
        Text("Minimum payout amount is BDT 500.00", fontSize = 12.sp, color = LurexMuted)
        Spacer(modifier = Modifier.height(10.dp))
        OutlinedTextField(
          value = amountStr,
          onValueChange = { amountStr = it },
          label = { Text("Amount in BDT") },
          modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp)
        )
        OutlinedTextField(
          value = account,
          onValueChange = { account = it },
          label = { Text("bKash/Nagad Number or Bank Account") },
          modifier = Modifier.fillMaxWidth()
        )
      }
    }
  )
}
