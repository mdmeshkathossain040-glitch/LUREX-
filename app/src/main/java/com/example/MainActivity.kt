package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.ui.AppMode
import com.example.ui.LurexViewModel
import com.example.ui.components.LurexTopBar
import com.example.ui.screens.AdminScreen
import com.example.ui.screens.BuyerScreen
import com.example.ui.screens.SellerScreen
import com.example.ui.theme.MyApplicationTheme

class MainActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()
    setContent {
      MyApplicationTheme {
        LurexMainApp()
      }
    }
  }
}

@Composable
fun LurexMainApp(
  viewModel: LurexViewModel = viewModel()
) {
  val currentMode by viewModel.appMode.collectAsState()

  Scaffold(
    modifier = Modifier.fillMaxSize(),
    topBar = {
      LurexTopBar(
        currentMode = currentMode,
        onModeChange = { viewModel.setAppMode(it) }
      )
    }
  ) { innerPadding ->
    Box(
      modifier = Modifier
        .fillMaxSize()
        .padding(innerPadding)
    ) {
      when (currentMode) {
        AppMode.BUYER -> BuyerScreen(viewModel = viewModel)
        AppMode.SELLER -> SellerScreen(viewModel = viewModel)
        AppMode.ADMIN -> AdminScreen(viewModel = viewModel)
      }
    }
  }
}
