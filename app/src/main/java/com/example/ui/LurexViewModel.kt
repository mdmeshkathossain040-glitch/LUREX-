package com.example.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.*
import kotlinx.coroutines.flow.*

enum class AppMode {
  BUYER, SELLER, ADMIN
}

enum class BuyerTab {
  SHOP, CATEGORIES, CART, ORDERS, PROFILE
}

class LurexViewModel(
  val repository: LurexRepository = LurexRepository()
) : ViewModel() {

  private val _appMode = MutableStateFlow(AppMode.BUYER)
  val appMode: StateFlow<AppMode> = _appMode.asStateFlow()

  private val _buyerTab = MutableStateFlow(BuyerTab.SHOP)
  val buyerTab: StateFlow<BuyerTab> = _buyerTab.asStateFlow()

  private val _selectedCategory = MutableStateFlow("all")
  val selectedCategory: StateFlow<String> = _selectedCategory.asStateFlow()

  private val _searchQuery = MutableStateFlow("")
  val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

  private val _selectedProduct = MutableStateFlow<Product?>(null)
  val selectedProduct: StateFlow<Product?> = _selectedProduct.asStateFlow()

  private val _showCheckoutDialog = MutableStateFlow(false)
  val showCheckoutDialog: StateFlow<Boolean> = _showCheckoutDialog.asStateFlow()

  private val _showAddProductDialog = MutableStateFlow(false)
  val showAddProductDialog: StateFlow<Boolean> = _showAddProductDialog.asStateFlow()

  private val _showWithdrawalDialog = MutableStateFlow(false)
  val showWithdrawalDialog: StateFlow<Boolean> = _showWithdrawalDialog.asStateFlow()

  private val _snackBarMessage = MutableSharedFlow<String>()
  val snackBarMessage: SharedFlow<String> = _snackBarMessage.asSharedFlow()

  // Filtered Products
  val filteredProducts: StateFlow<List<Product>> = combine(
    repository.products,
    _selectedCategory,
    _searchQuery
  ) { prods, cat, query ->
    prods.filter { p ->
      val matchesCat = (cat == "all" || p.categoryId == cat)
      val matchesQuery = query.isBlank() || 
        p.name.contains(query, ignoreCase = true) || 
        p.shopName.contains(query, ignoreCase = true) ||
        p.categoryName.contains(query, ignoreCase = true)
      matchesCat && matchesQuery
    }
  }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

  fun setAppMode(mode: AppMode) {
    _appMode.value = mode
  }

  fun setBuyerTab(tab: BuyerTab) {
    _buyerTab.value = tab
  }

  fun selectCategory(catId: String) {
    _selectedCategory.value = catId
  }

  fun setSearchQuery(q: String) {
    _searchQuery.value = q
  }

  fun openProductDetails(product: Product) {
    _selectedProduct.value = product
  }

  fun closeProductDetails() {
    _selectedProduct.value = null
  }

  fun setCheckoutDialog(show: Boolean) {
    _showCheckoutDialog.value = show
  }

  fun setAddProductDialog(show: Boolean) {
    _showAddProductDialog.value = show
  }

  fun setWithdrawalDialog(show: Boolean) {
    _showWithdrawalDialog.value = show
  }

  fun emitMessage(msg: String) {
    _snackBarMessage.tryEmit(msg)
  }
}
