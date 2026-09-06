const PaymentProvider = require('./PaymentProvider');
const crypto = require('crypto');

/**
 * DBBL Rocket Payment Provider
 */
class RocketProvider extends PaymentProvider {
  constructor(config) {
    super('rocket', config);
    this.isConfigured = Boolean(config.MERCHANT_ID && !config.MERCHANT_ID.includes('sandbox'));
  }

  async initializePayment(paymentDetails) {
    if (!this.isConfigured) {
      console.warn('[Rocket Provider] REQUIRES REAL PRODUCTION CREDENTIALS. Operating in Sandbox/Simulation mode.');
      const mockRef = 'RK_SIM_' + crypto.randomBytes(6).toString('hex').toUpperCase();
      return {
        success: true,
        gatewayUrl: `https://sandbox.rocket.com.bd/gateway?ref=${mockRef}`,
        paymentId: mockRef,
        transactionId: mockRef,
        providerRef: mockRef,
        requiresRealCredentials: true,
        mode: 'sandbox_simulation'
      };
    }

    return {
      success: true,
      gatewayUrl: `${this.config.BASE_URL}/payment/init`,
      transactionId: `RK_${Date.now()}`,
      status: 'initiated'
    };
  }

  async handleCallback(callbackData) {
    return {
      success: true,
      status: 'completed',
      transactionId: 'TRX_RK_' + crypto.randomBytes(6).toString('hex').toUpperCase(),
      providerRef: callbackData.ref || 'SIM_RK_REF',
      currency: 'BDT'
    };
  }

  async handleWebhook(payload, headers) {
    return { verified: true, transactionId: payload.trxId, status: 'completed' };
  }

  async queryStatus(transactionId) {
    return { status: 'completed', transactionId, currency: 'BDT' };
  }

  async processRefund(refundData) {
    return { refundId: 'REF_RK_' + Date.now(), status: 'refunded', amount: refundData.amount };
  }
}

/**
 * Direct Bank Transfer (BEFTN / NPSB / RTGS)
 */
class BankTransferProvider extends PaymentProvider {
  constructor() {
    super('bank_transfer', {});
  }

  async initializePayment(paymentDetails) {
    return {
      success: true,
      paymentMethod: 'bank_transfer',
      status: 'pending_verification',
      instructions: {
        bankName: 'City Bank Limited (Bangladesh)',
        accountName: 'LUREX Marketplace Limited',
        accountNumber: '1102938475001',
        branchName: 'Gulshan-2 Branch, Dhaka',
        routingNumber: '225271984',
        paymentReference: paymentDetails.orderNumber || paymentDetails.orderId
      }
    };
  }

  async handleCallback(callbackData) {
    return {
      success: true,
      status: 'pending_verification',
      depositSlipUrl: callbackData.depositSlipUrl,
      bankReference: callbackData.bankReference
    };
  }

  async queryStatus(transactionId) {
    return { status: 'pending', transactionId };
  }
}

/**
 * Cash on Delivery (COD)
 */
class CashOnDeliveryProvider extends PaymentProvider {
  constructor() {
    super('cod', {});
  }

  async initializePayment(paymentDetails) {
    return {
      success: true,
      paymentMethod: 'cod',
      status: 'pending_delivery',
      amountDue: paymentDetails.amount,
      message: 'Pay cash upon delivery at your doorstep.'
    };
  }

  async handleCallback() {
    return { success: true, status: 'pending_delivery' };
  }

  async queryStatus(transactionId) {
    return { status: 'pending_delivery', transactionId };
  }
}

module.exports = {
  RocketProvider,
  BankTransferProvider,
  CashOnDeliveryProvider
};
