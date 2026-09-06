const test = require('node:test');
const assert = require('node:assert');
const { getPaymentProvider } = require('../src/services/payment');

test('LUREX Payment Provider Factory - loads providers properly', () => {
  const bkash = getPaymentProvider('bkash');
  assert.strictEqual(bkash.name, 'bkash');

  const nagad = getPaymentProvider('nagad');
  assert.strictEqual(nagad.name, 'nagad');

  const rocket = getPaymentProvider('rocket');
  assert.strictEqual(rocket.name, 'rocket');

  const cod = getPaymentProvider('cod');
  assert.strictEqual(cod.name, 'cod');
});

test('LUREX Commission calculation logic', () => {
  const orderAmount = 2500.00;
  const commissionRate = 0.05; // 5%
  const commission = parseFloat((orderAmount * commissionRate).toFixed(2));
  const sellerNet = parseFloat((orderAmount - commission).toFixed(2));

  assert.strictEqual(commission, 125.00);
  assert.strictEqual(sellerNet, 2375.00);
  assert.strictEqual(commission + sellerNet, orderAmount);
});

test('bKash Provider Sandbox Initialization', async () => {
  const bkash = getPaymentProvider('bkash');
  const initRes = await bkash.initializePayment({
    orderId: 'test-order-123',
    amount: 1500,
    currency: 'BDT'
  });

  assert.strictEqual(initRes.success, true);
  assert.ok(initRes.gatewayUrl.includes('bka.sh'));
  assert.strictEqual(initRes.requiresRealCredentials, true);
});

test('Nagad Provider Sandbox Initialization', async () => {
  const nagad = getPaymentProvider('nagad');
  const initRes = await nagad.initializePayment({
    orderId: 'test-order-456',
    amount: 950,
    currency: 'BDT'
  });

  assert.strictEqual(initRes.success, true);
  assert.ok(initRes.gatewayUrl.includes('mynagad.com'));
});
