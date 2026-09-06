try {
  require('dotenv').config();
} catch (e) {
  // Dotenv optional in standalone container environments
}

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  DATABASE_URL: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/lurex_db',
  JWT_SECRET: process.env.JWT_SECRET || 'lurex_super_secret_jwt_key_bd_market_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || 'lurex_super_secret_refresh_key_2026',
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  MARKETPLACE_COMMISSION_RATE: parseFloat(process.env.MARKETPLACE_COMMISSION_RATE || '0.05'),
  
  // Payment Gateways
  BKASH: {
    BASE_URL: process.env.BKASH_BASE_URL || 'https://tokenized.sandbox.bka.sh/v1.2.0-beta',
    APP_KEY: process.env.BKASH_APP_KEY || '',
    APP_SECRET: process.env.BKASH_APP_SECRET || '',
    USERNAME: process.env.BKASH_USERNAME || '',
    PASSWORD: process.env.BKASH_PASSWORD || ''
  },
  NAGAD: {
    BASE_URL: process.env.NAGAD_BASE_URL || 'https://api.mynagad.com/api/dfs',
    MERCHANT_ID: process.env.NAGAD_MERCHANT_ID || '',
    MERCHANT_KEY: process.env.NAGAD_MERCHANT_KEY || '',
    PUBLIC_KEY: process.env.NAGAD_PUBLIC_KEY || ''
  },
  ROCKET: {
    BASE_URL: process.env.ROCKET_BASE_URL || 'https://api.rocket.com.bd/v1',
    MERCHANT_ID: process.env.ROCKET_MERCHANT_ID || '',
    MERCHANT_SECRET: process.env.ROCKET_MERCHANT_SECRET || ''
  }
};
