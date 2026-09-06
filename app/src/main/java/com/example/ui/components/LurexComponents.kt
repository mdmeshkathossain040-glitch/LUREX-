package com.example.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.data.Category
import com.example.data.Product
import com.example.ui.AppMode
import com.example.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LurexTopBar(
  currentMode: AppMode,
  onModeChange: (AppMode) -> Unit
) {
  var showModeMenu by remember { mutableStateOf(false) }

  Surface(
    color = LurexEmerald,
    shadowElevation = 4.dp
  ) {
    Row(
      modifier = Modifier
        .fillMaxWidth()
        .statusBarsPadding()
        .padding(horizontal = 16.dp, vertical = 12.dp),
      verticalAlignment = Alignment.CenterVertically,
      horizontalArrangement = Arrangement.SpaceBetween
    ) {
      Row(verticalAlignment = Alignment.CenterVertically) {
        Box(
          modifier = Modifier
            .size(36.dp)
            .clip(RoundedCornerShape(8.dp))
            .background(Color.White),
          contentAlignment = Alignment.Center
        ) {
          Text(
            text = "L",
            fontWeight = FontWeight.Black,
            fontSize = 20.sp,
            color = LurexEmerald
          )
        }
        Spacer(modifier = Modifier.width(10.dp))
        Column {
          Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
              text = "LUREX",
              color = Color.White,
              fontWeight = FontWeight.ExtraBold,
              fontSize = 18.sp,
              letterSpacing = 1.sp
            )
            Spacer(modifier = Modifier.width(6.dp))
            Surface(
              color = LurexGold,
              shape = RoundedCornerShape(4.dp)
            ) {
              Text(
                text = "BD",
                color = Color.White,
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
              )
            }
          }
          Text(
            text = "BUY • SELL • GROW",
            color = Color.White.copy(alpha = 0.85f),
            fontSize = 9.sp,
            fontWeight = FontWeight.SemiBold,
            letterSpacing = 0.5.sp
          )
        }
      }

      // Mode Switcher Button
      Box {
        Surface(
          onClick = { showModeMenu = true },
          color = Color.White.copy(alpha = 0.2f),
          shape = RoundedCornerShape(20.dp),
          modifier = Modifier.testTag("mode_selector_button")
        ) {
          Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
          ) {
            Icon(
              imageVector = when (currentMode) {
                AppMode.BUYER -> Icons.Default.ShoppingCart
                AppMode.SELLER -> Icons.Default.Storefront
                AppMode.ADMIN -> Icons.Default.AdminPanelSettings
              },
              contentDescription = "Switch Mode",
              tint = Color.White,
              modifier = Modifier.size(16.dp)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
              text = when (currentMode) {
                AppMode.BUYER -> "Buyer"
                AppMode.SELLER -> "Seller"
                AppMode.ADMIN -> "Admin"
              },
              color = Color.White,
              fontSize = 12.sp,
              fontWeight = FontWeight.Bold
            )
            Icon(
              imageVector = Icons.Default.ArrowDropDown,
              contentDescription = "Open modes",
              tint = Color.White,
              modifier = Modifier.size(16.dp)
            )
          }
        }

        DropdownMenu(
          expanded = showModeMenu,
          onDismissRequest = { showModeMenu = false }
        ) {
          DropdownMenuItem(
            text = { Text("🛒 Buyer Marketplace") },
            onClick = {
              onModeChange(AppMode.BUYER)
              showModeMenu = false
            },
            leadingIcon = { Icon(Icons.Default.ShoppingCart, contentDescription = null) }
          )
          DropdownMenuItem(
            text = { Text("🏪 Seller Hub (Shop & Wallet)") },
            onClick = {
              onModeChange(AppMode.SELLER)
              showModeMenu = false
            },
            leadingIcon = { Icon(Icons.Default.Storefront, contentDescription = null) }
          )
          DropdownMenuItem(
            text = { Text("⚙️ Admin Control Portal") },
            onClick = {
              onModeChange(AppMode.ADMIN)
              showModeMenu = false
            },
            leadingIcon = { Icon(Icons.Default.AdminPanelSettings, contentDescription = null) }
          )
        }
      }
    }
  }
}

@Composable
fun HeroBanner() {
  Card(
    modifier = Modifier
      .fillMaxWidth()
      .padding(horizontal = 16.dp, vertical = 10.dp),
    shape = RoundedCornerShape(16.dp),
    colors = CardDefaults.cardColors(containerColor = Color.Transparent)
  ) {
    Box(
      modifier = Modifier
        .background(
          Brush.linearGradient(
            listOf(LurexDarkGreen, LurexSlate)
          )
        )
        .padding(18.dp)
    ) {
      Column {
        Surface(
          color = LurexGold,
          shape = RoundedCornerShape(20.dp)
        ) {
          Text(
            text = "BANGLADESH MULTI-VENDOR",
            color = Color.White,
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
          )
        }
        Spacer(modifier = Modifier.height(10.dp))
        Text(
          text = "Premium Goods Direct From Verified Shops",
          color = Color.White,
          fontWeight = FontWeight.Bold,
          fontSize = 19.sp,
          lineHeight = 24.sp
        )
        Spacer(modifier = Modifier.height(6.dp))
        Text(
          text = "Fast delivery across all 64 districts • 100% genuine goods • bKash, Nagad, Rocket & COD",
          color = Color.White.copy(alpha = 0.8f),
          fontSize = 12.sp
        )
      }
    }
  }
}

@Composable
fun CategoryChip(
  category: Category,
  isSelected: Boolean,
  onSelect: () -> Unit
) {
  Surface(
    onClick = onSelect,
    shape = RoundedCornerShape(20.dp),
    color = if (isSelected) LurexEmerald else Color(0xFFF1F5F9),
    border = if (isSelected) null else androidx.compose.foundation.BorderStroke(1.dp, LurexCardBorder),
    modifier = Modifier.testTag("category_chip_${category.id}")
  ) {
    Row(
      verticalAlignment = Alignment.CenterVertically,
      modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp)
    ) {
      Text(
        text = category.name,
        color = if (isSelected) Color.White else LurexSlate,
        fontSize = 13.sp,
        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium
      )
    }
  }
}

@Composable
fun ProductCard(
  product: Product,
  onClick: () -> Unit,
  onAddToCart: () -> Unit
) {
  Card(
    onClick = onClick,
    shape = RoundedCornerShape(12.dp),
    colors = CardDefaults.cardColors(containerColor = Color.White),
    border = androidx.compose.foundation.BorderStroke(1.dp, LurexCardBorder),
    modifier = Modifier
      .fillMaxWidth()
      .testTag("product_card_${product.id}")
  ) {
    Column {
      // Image Placeholder Header
      Box(
        modifier = Modifier
          .fillMaxWidth()
          .height(120.dp)
          .background(Color(0xFFF8FAFC)),
        contentAlignment = Alignment.Center
      ) {
        Icon(
          imageVector = when (product.categoryId) {
            "fashion" -> Icons.Outlined.Checkroom
            "gadgets" -> Icons.Outlined.Devices
            "groceries" -> Icons.Outlined.ShoppingCart
            "home" -> Icons.Outlined.Home
            else -> Icons.Outlined.Storefront
          },
          contentDescription = null,
          tint = LurexEmerald.copy(alpha = 0.5f),
          modifier = Modifier.size(44.dp)
        )

        // Rating Badge
        Surface(
          color = Color.White.copy(alpha = 0.9f),
          shape = RoundedCornerShape(10.dp),
          modifier = Modifier
            .align(Alignment.TopEnd)
            .padding(8.dp)
        ) {
          Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
          ) {
            Icon(Icons.Default.Star, contentDescription = null, tint = LurexGold, modifier = Modifier.size(12.dp))
            Spacer(modifier = Modifier.width(2.dp))
            Text(text = product.rating.toString(), fontSize = 11.sp, fontWeight = FontWeight.Bold)
          }
        }
      }

      // Details
      Column(modifier = Modifier.padding(10.dp)) {
        Text(
          text = product.shopName,
          fontSize = 11.sp,
          color = LurexMuted,
          maxLines = 1,
          overflow = TextOverflow.Ellipsis
        )
        Spacer(modifier = Modifier.height(2.dp))
        Text(
          text = product.name,
          fontSize = 13.sp,
          fontWeight = FontWeight.SemiBold,
          color = LurexSlate,
          maxLines = 2,
          overflow = TextOverflow.Ellipsis,
          lineHeight = 17.sp
        )
        Spacer(modifier = Modifier.height(6.dp))

        // Pricing
        Row(verticalAlignment = Alignment.CenterVertically) {
          Text(
            text = "৳ ${product.activePrice.toInt()}",
            fontSize = 15.sp,
            fontWeight = FontWeight.ExtraBold,
            color = LurexEmerald
          )
          if (product.discountPrice != null) {
            Spacer(modifier = Modifier.width(6.dp))
            Text(
              text = "৳ ${product.price.toInt()}",
              fontSize = 11.sp,
              color = LurexMuted,
              textDecoration = TextDecoration.LineThrough
            )
          }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Add to cart button
        Button(
          onClick = onAddToCart,
          colors = ButtonDefaults.buttonColors(containerColor = LurexEmerald),
          shape = RoundedCornerShape(8.dp),
          contentPadding = PaddingValues(vertical = 6.dp),
          modifier = Modifier
            .fillMaxWidth()
            .testTag("add_to_cart_button_${product.id}")
        ) {
          Icon(Icons.Default.AddShoppingCart, contentDescription = null, modifier = Modifier.size(16.dp))
          Spacer(modifier = Modifier.width(4.dp))
          Text(text = "Add to Cart", fontSize = 12.sp, fontWeight = FontWeight.Bold)
        }
      }
    }
  }
}
