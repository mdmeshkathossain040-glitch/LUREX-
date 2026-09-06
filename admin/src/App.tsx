import React, { useState, useEffect } from 'react';
import { AnalyticsData, User, Shop, WithdrawalRequest } from './types';
import { AdminApi } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'shops' | 'withdrawals'>('overview');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>({
    total_buyers: 1420,
    total_sellers: 86,
    total_approved_shops: 64,
    pending_shops: 5,
    total_products: 480,
    total_orders: 1250,
    total_paid_orders: 1180,
    gross_merchandise_volume: 3450000,
    total_marketplace_commission: 172500,
    pending_withdrawals: 8,
    total_paid_withdrawals: 620000
  });

  const [shops, setShops] = useState<Shop[]>([
    {
      id: 'shop-1',
      name: 'Dhaka Gadget Hub',
      slug: 'dhaka-gadget-hub',
      seller_id: 'seller-1',
      seller_name: 'Tanvir Hossain',
      seller_phone: '+8801711223344',
      status: 'approved',
      rating: 4.8,
      total_sales: 850000,
      created_at: '2026-08-10'
    },
    {
      id: 'shop-2',
      name: 'Bengal Silk & Cottons',
      slug: 'bengal-silk',
      seller_id: 'seller-2',
      seller_name: 'Nusrat Jahan',
      seller_phone: '+8801822334455',
      status: 'pending',
      rating: 5.0,
      total_sales: 120000,
      created_at: '2026-08-28'
    }
  ]);

  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([
    {
      id: 'w-1',
      seller_id: 'seller-1',
      seller_name: 'Tanvir Hossain',
      seller_phone: '+8801711223344',
      amount: 45000,
      status: 'pending',
      account_type: 'bkash',
      account_number: '+8801711223344',
      requested_at: '2026-09-05'
    },
    {
      id: 'w-2',
      seller_id: 'seller-2',
      seller_name: 'Nusrat Jahan',
      seller_phone: '+8801822334455',
      amount: 18000,
      status: 'pending',
      account_type: 'bank',
      bank_name: 'BRAC Bank',
      account_number: '1501203498001',
      requested_at: '2026-09-04'
    }
  ]);

  const [users, setUsers] = useState<User[]>([
    {
      id: 'u-1',
      name: 'Rahim Chowdhury',
      email: 'rahim@gmail.com',
      phone: '+8801912345678',
      role: 'buyer',
      is_active: true,
      is_verified: true,
      created_at: '2026-08-15'
    },
    {
      id: 'u-2',
      name: 'Tanvir Hossain',
      email: 'tanvir@gadgethub.bd',
      phone: '+8801711223344',
      role: 'seller',
      is_active: true,
      is_verified: true,
      created_at: '2026-08-10'
    }
  ]);

  const handleApproveShop = (shopId: string) => {
    setShops(prev => prev.map(s => s.id === shopId ? { ...s, status: 'approved' } : s));
  };

  const handleRejectShop = (shopId: string) => {
    setShops(prev => prev.map(s => s.id === shopId ? { ...s, status: 'rejected' } : s));
  };

  const handlePayWithdrawal = (id: string) => {
    setWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: 'paid' } : w));
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#F8FAFC', color: '#0F172A' }}>
      {/* Sidebar */}
      <aside style={{ width: '260px', backgroundColor: '#0F172A', color: '#F8FAFC', padding: '24px 16px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', paddingLeft: '8px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg, #059669, #0D9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px' }}>
            L
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '700', letterSpacing: '1px' }}>LUREX</h1>
            <p style={{ margin: 0, fontSize: '10px', color: '#94A3B8', letterSpacing: '0.5px' }}>BUY • SELL • GROW</p>
          </div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {[
            { id: 'overview', label: 'Dashboard & Analytics' },
            { id: 'shops', label: 'Shops & Verification' },
            { id: 'withdrawals', label: 'Payouts & Wallet' },
            { id: 'users', label: 'User Directory' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                textAlign: 'left',
                padding: '12px 16px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === tab.id ? '#1E293B' : 'transparent',
                color: activeTab === tab.id ? '#10B981' : '#94A3B8',
                fontWeight: activeTab === tab.id ? '600' : '400',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', padding: '16px', background: '#1E293B', borderRadius: '8px', fontSize: '12px' }}>
          <div style={{ color: '#10B981', fontWeight: 'bold', marginBottom: '4px' }}>● System Online</div>
          <div style={{ color: '#94A3B8' }}>PostgreSQL 16 Connected</div>
          <div style={{ color: '#94A3B8' }}>Bangladesh MFS Ready</div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '26px', fontWeight: '700' }}>
              {activeTab === 'overview' && 'Marketplace Overview'}
              {activeTab === 'shops' && 'Shop & Seller Management'}
              {activeTab === 'withdrawals' && 'Seller Payout Requests'}
              {activeTab === 'users' && 'User Management'}
            </h2>
            <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '14px' }}>
              Bangladesh Multi-Vendor Marketplace Control Center
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ padding: '6px 14px', borderRadius: '20px', background: '#DCFCE7', color: '#166534', fontSize: '12px', fontWeight: 'bold' }}>
              Admin Authenticated
            </span>
          </div>
        </header>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && analytics && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
              <div style={{ background: '#FFF', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Gross Merchandise Volume</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#0F172A', marginTop: '8px' }}>
                  ৳ {Number(analytics.gross_merchandise_volume).toLocaleString()}
                </div>
                <div style={{ fontSize: '12px', color: '#059669', marginTop: '4px' }}>+18.4% this month</div>
              </div>

              <div style={{ background: '#FFF', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Marketplace Commission (5%)</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#059669', marginTop: '8px' }}>
                  ৳ {Number(analytics.total_marketplace_commission).toLocaleString()}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Net platform revenue</div>
              </div>

              <div style={{ background: '#FFF', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Total Orders Completed</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#0F172A', marginTop: '8px' }}>
                  {analytics.total_paid_orders}
                </div>
                <div style={{ fontSize: '12px', color: '#059669', marginTop: '4px' }}>{analytics.total_orders} orders placed</div>
              </div>

              <div style={{ background: '#FFF', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Active Sellers & Shops</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: '#0F172A', marginTop: '8px' }}>
                  {analytics.total_approved_shops}
                </div>
                <div style={{ fontSize: '12px', color: '#D97706', marginTop: '4px' }}>{analytics.pending_shops} pending approvals</div>
              </div>
            </div>

            {/* Quick Actions List */}
            <div style={{ background: '#FFF', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700' }}>Pending Shop Verifications</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                    <th style={{ padding: '12px 8px' }}>Shop Name</th>
                    <th style={{ padding: '12px 8px' }}>Owner</th>
                    <th style={{ padding: '12px 8px' }}>Contact Phone</th>
                    <th style={{ padding: '12px 8px' }}>Status</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shops.map(shop => (
                    <tr key={shop.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '14px 8px', fontWeight: '600' }}>{shop.name}</td>
                      <td style={{ padding: '14px 8px' }}>{shop.seller_name}</td>
                      <td style={{ padding: '14px 8px' }}>{shop.seller_phone}</td>
                      <td style={{ padding: '14px 8px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          background: shop.status === 'approved' ? '#DCFCE7' : '#FEF3C7',
                          color: shop.status === 'approved' ? '#166534' : '#92400E'
                        }}>
                          {shop.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '14px 8px', textAlign: 'right' }}>
                        {shop.status === 'pending' && (
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <button
                              onClick={() => handleApproveShop(shop.id)}
                              style={{ background: '#059669', color: '#FFF', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectShop(shop.id)}
                              style={{ background: '#EF4444', color: '#FFF', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Withdrawals */}
        {activeTab === 'withdrawals' && (
          <div style={{ background: '#FFF', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700' }}>Seller Payout & Withdrawal Queue</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                  <th style={{ padding: '12px 8px' }}>Seller</th>
                  <th style={{ padding: '12px 8px' }}>Method</th>
                  <th style={{ padding: '12px 8px' }}>Account Info</th>
                  <th style={{ padding: '12px 8px' }}>Amount (BDT)</th>
                  <th style={{ padding: '12px 8px' }}>Status</th>
                  <th style={{ padding: '12px 8px', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map(w => (
                  <tr key={w.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '14px 8px', fontWeight: '600' }}>{w.seller_name}</td>
                    <td style={{ padding: '14px 8px', textTransform: 'uppercase' }}>{w.account_type}</td>
                    <td style={{ padding: '14px 8px' }}>{w.bank_name ? `${w.bank_name} (${w.account_number})` : w.account_number}</td>
                    <td style={{ padding: '14px 8px', fontWeight: '700' }}>৳ {w.amount.toLocaleString()}</td>
                    <td style={{ padding: '14px 8px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: w.status === 'paid' ? '#DCFCE7' : '#FEF3C7',
                        color: w.status === 'paid' ? '#166534' : '#92400E'
                      }}>
                        {w.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '14px 8px', textAlign: 'right' }}>
                      {w.status === 'pending' && (
                        <button
                          onClick={() => handlePayWithdrawal(w.id)}
                          style={{ background: '#059669', color: '#FFF', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                        >
                          Disburse Funds
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Users */}
        {activeTab === 'users' && (
          <div style={{ background: '#FFF', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700' }}>Registered Marketplace Users</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                  <th style={{ padding: '12px 8px' }}>Name</th>
                  <th style={{ padding: '12px 8px' }}>Phone</th>
                  <th style={{ padding: '12px 8px' }}>Email</th>
                  <th style={{ padding: '12px 8px' }}>Role</th>
                  <th style={{ padding: '12px 8px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '14px 8px', fontWeight: '600' }}>{u.name}</td>
                    <td style={{ padding: '14px 8px' }}>{u.phone}</td>
                    <td style={{ padding: '14px 8px' }}>{u.email || 'N/A'}</td>
                    <td style={{ padding: '14px 8px', textTransform: 'capitalize' }}>{u.role}</td>
                    <td style={{ padding: '14px 8px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '8px', fontSize: '12px', background: '#DCFCE7', color: '#166534', fontWeight: '600' }}>
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Shops */}
        {activeTab === 'shops' && (
          <div style={{ background: '#FFF', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700' }}>All Registered Shops</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              {shops.map(shop => (
                <div key={shop.id} style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, fontSize: '16px' }}>{shop.name}</h4>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: '600',
                      background: shop.status === 'approved' ? '#DCFCE7' : '#FEF3C7',
                      color: shop.status === 'approved' ? '#166534' : '#92400E'
                    }}>
                      {shop.status.toUpperCase()}
                    </span>
                  </div>
                  <p style={{ margin: '8px 0', fontSize: '13px', color: '#64748B' }}>Owner: {shop.seller_name} ({shop.seller_phone})</p>
                  <p style={{ margin: '4px 0', fontSize: '13px', fontWeight: 'bold' }}>Total Sales: ৳ {shop.total_sales.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
