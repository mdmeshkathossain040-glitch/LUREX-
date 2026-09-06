const config = require('../../config/env');
const BkashProvider = require('./BkashProvider');
const NagadProvider = require('./NagadProvider');
const { RocketProvider, BankTransferProvider, CashOnDeliveryProvider } = require('./OtherProviders');

const providers = {
  bkash: new BkashProvider(config.BKASH),
  nagad: new NagadProvider(config.NAGAD),
  rocket: new RocketProvider(config.ROCKET),
  bank_transfer: new BankTransferProvider(),
  cod: new CashOnDeliveryProvider()
};

function getPaymentProvider(method) {
  const provider = providers[method.toLowerCase()];
  if (!provider) {
    throw new Error(`Unsupported payment method: ${method}. Available: bkash, nagad, rocket, bank_transfer, cod`);
  }
  return provider;
}

module.exports = {
  getPaymentProvider,
  providers
};
