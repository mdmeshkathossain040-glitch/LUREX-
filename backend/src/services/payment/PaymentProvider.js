/**
 * Base Payment Provider Interface for LUREX Multi-Vendor Marketplace
 */
class PaymentProvider {
  constructor(name, config) {
    this.name = name;
    this.config = config;
  }

  /**
   * Initializes a payment session
   * @param {Object} paymentDetails - { orderId, amount, currency, customerPhone, customerEmail, callbackUrl }
   * @returns {Promise<Object>} { gatewayUrl, transactionId, providerRef, status }
   */
  async initializePayment(paymentDetails) {
    throw new Error('Method initializePayment() must be implemented by provider');
  }

  /**
   * Handles user callback or redirect return
   * @param {Object} callbackData - Query or body parameters from provider redirect
   * @returns {Promise<Object>} { success, transactionId, amount, providerRef, rawResponse }
   */
  async handleCallback(callbackData) {
    throw new Error('Method handleCallback() must be implemented by provider');
  }

  /**
   * Handles asynchronous server-to-server webhook
   * @param {Object} payload - Webhook body
   * @param {Object} headers - Request headers for signature verification
   * @returns {Promise<Object>} { verified, eventType, transactionId, status }
   */
  async handleWebhook(payload, headers) {
    throw new Error('Method handleWebhook() must be implemented by provider');
  }

  /**
   * Verifies cryptographic signature or authenticity of payload
   * @param {Object} payload 
   * @param {string} signature 
   * @returns {boolean}
   */
  verifySignature(payload, signature) {
    throw new Error('Method verifySignature() must be implemented by provider');
  }

  /**
   * Queries provider for real-time transaction status
   * @param {string} transactionId 
   * @returns {Promise<Object>} { status, amount, currency, paidAt }
   */
  async queryStatus(transactionId) {
    throw new Error('Method queryStatus() must be implemented by provider');
  }

  /**
   * Initiates a refund for an order
   * @param {Object} refundData - { transactionId, amount, reason }
   * @returns {Promise<Object>} { refundId, status, refundedAmount }
   */
  async processRefund(refundData) {
    throw new Error('Method processRefund() must be implemented by provider');
  }
}

module.exports = PaymentProvider;
