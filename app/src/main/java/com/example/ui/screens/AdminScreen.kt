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
import com.example.ui.LurexViewModel
import com.example.ui.theme.*

@Composable
fun AdminScreen(
  viewModel: LurexViewModel,
  modifier: Modifier = Modifier
) {
  val shops by viewModel.repository.shops.collectAsState()
  val payouts by viewModel.repository.payouts.collectAsState()
  val orders by viewModel.repository.orders.collectAsState()

  LazyColumn(
    modifier = modifier
      .fillMaxSize()
      .padding(16.dp),
    verticalArrangement = Arrangement.spacedBy(16.dp)
  ) {
    // Top Banner
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
              Text("LUREX Admin Portal", color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Bold)
              Text("Bangladesh Multi-Vendor Control Center", color = Color.White.copy(alpha = 0.7f), fontSize = 12.sp)
            }
            Surface(
              color = Color(0xFF10B981),
              shape = RoundedCornerShape(12.dp)
            ) {
              Text("SUPERADMIN", color = Color.White, fontSize = 10.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp))
            }
          }
        }
      }
    }

    // Live Marketplace KPIs Grid
    item {
      Text("Platform Performance & Financials", fontWeight = FontWeight.Bold, fontSize = 17.sp)
      Spacer(modifier = Modifier.height(8.dp))
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
      ) {
        Card(
          modifier = Modifier.weight(1f),
          shape = RoundedCornerShape(12.dp),
          colors = CardDefaults.cardColors(containerColor = Color.White),
          border = androidx.compose.foundation.BorderStroke(1.dp, LurexCardBorder)
        ) {
          Column(modifier = Modifier.padding(14.dp)) {
            Text("Gross GMV", fontSize = 11.sp, color = LurexMuted)
            Text("৳ 34,50,000", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = LurexSlate)
            Text("+18.4% this mo.", fontSize = 10.sp, color = Color(0xFF166534), fontWeight = FontWeight.SemiBold)
          }
        }

        Card(
          modifier = Modifier.weight(1f),
          shape = RoundedCornerShape(12.dp),
          colors = CardDefaults.cardColors(containerColor = Color.White),
          border = androidx.compose.foundation.BorderStroke(1.dp, LurexCardBorder)
        ) {
          Column(modifier = Modifier.padding(14.dp)) {
            Text("Marketplace Comm (5%)", fontSize = 11.sp, color = LurexMuted)
            Text("৳ 1,72,500", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = LurexEmerald)
            Text("Net revenue", fontSize = 10.sp, color = LurexMuted)
          }
        }
      }
    }

    item {
      Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
      ) {
        Card(
          modifier = Modifier.weight(1f),
          shape = RoundedCornerShape(12.dp),
          colors = CardDefaults.cardColors(containerColor = Color.White),
          border = androidx.compose.foundation.BorderStroke(1.dp, LurexCardBorder)
        ) {
          Column(modifier = Modifier.padding(14.dp)) {
            Text("Total Orders", fontSize = 11.sp, color = LurexMuted)
            Text("${1180 + orders.size}", fontSize = 18.sp, fontWeight = FontWeight.Bold)
            Text("99.4% fulfill rate", fontSize = 10.sp, color = Color(0xFF166534))
          }
        }

        Card(
          modifier = Modifier.weight(1f),
          shape = RoundedCornerShape(12.dp),
          colors = CardDefaults.cardColors(containerColor = Color.White),
          border = androidx.compose.foundation.BorderStroke(1.dp, LurexCardBorder)
        ) {
          Column(modifier = Modifier.padding(14.dp)) {
            Text("Active Shops", fontSize = 11.sp, color = LurexMuted)
            Text("${shops.count { it.status == "APPROVED" }}", fontSize = 18.sp, fontWeight = FontWeight.Bold)
            Text("${shops.count { it.status == "PENDING" }} pending review", fontSize = 10.sp, color = LurexGold, fontWeight = FontWeight.SemiBold)
          }
        }
      }
    }

    // Shop Approvals
    item {
      Text("Seller Shop Approvals", fontWeight = FontWeight.Bold, fontSize = 17.sp)
    }

    items(shops) { shop ->
      Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        border = androidx.compose.foundation.BorderStroke(1.dp, LurexCardBorder)
      ) {
        Column(modifier = Modifier.padding(14.dp)) {
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Column {
              Text(shop.name, fontWeight = FontWeight.Bold, fontSize = 15.sp)
              Text("Owner: ${shop.ownerName} (${shop.phone})", fontSize = 12.sp, color = LurexMuted)
            }
            Surface(
              color = if (shop.status == "APPROVED") Color(0xFFDCFCE7) else Color(0xFFFEF3C7),
              shape = RoundedCornerShape(10.dp)
            ) {
              Text(
                shop.status,
                color = if (shop.status == "APPROVED") Color(0xFF166534) else Color(0xFF92400E),
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
              )
            }
          }

          if (shop.status == "PENDING") {
            Spacer(modifier = Modifier.height(10.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
              Button(
                onClick = { viewModel.repository.approveShop(shop.id) },
                colors = ButtonDefaults.buttonColors(containerColor = LurexEmerald),
                shape = RoundedCornerShape(6.dp),
                modifier = Modifier.weight(1f).testTag("approve_shop_${shop.id}")
              ) {
                Text("Approve Shop", fontSize = 12.sp)
              }
              OutlinedButton(
                onClick = { viewModel.repository.rejectShop(shop.id) },
                shape = RoundedCornerShape(6.dp),
                modifier = Modifier.weight(1f)
              ) {
                Text("Reject", fontSize = 12.sp, color = Color.Red)
              }
            }
          }
        }
      }
    }

    // Payout Requests
    item {
      Text("Seller Payout Requests", fontWeight = FontWeight.Bold, fontSize = 17.sp)
    }

    items(payouts) { p ->
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
            Column {
              Text(p.sellerName, fontWeight = FontWeight.Bold, fontSize = 14.sp)
              Text("Method: ${p.method} • Account: ${p.accountNumber}", fontSize = 12.sp, color = LurexMuted)
            }
            Text("৳ ${p.amount.toInt()}", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = LurexEmerald)
          }
          Spacer(modifier = Modifier.height(8.dp))
          Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
          ) {
            Surface(
              color = if (p.status == "PAID") Color(0xFFDCFCE7) else Color(0xFFFEF3C7),
              shape = RoundedCornerShape(8.dp)
            ) {
              Text(
                p.status,
                color = if (p.status == "PAID") Color(0xFF166534) else Color(0xFF92400E),
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
              )
            }
            if (p.status == "PENDING") {
              Button(
                onClick = { viewModel.repository.disbursePayout(p.id) },
                colors = ButtonDefaults.buttonColors(containerColor = LurexEmerald),
                shape = RoundedCornerShape(6.dp),
                modifier = Modifier.testTag("disburse_payout_${p.id}")
              ) {
                Text("Disburse Funds", fontSize = 12.sp)
              }
            }
          }
        }
      }
    }
  }
}
