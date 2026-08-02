import React, { useState, useEffect, useCallback } from 'react';
import { UserRole, Product, DemandRequest } from './types';
import { Navbar } from './components/Navbar';
import { DemandRequestForm } from './components/DemandRequestForm';
import { OrderTracker } from './components/OrderTracker';
import { SalesReviewQueue } from './components/SalesReviewQueue';
import { ApiPlayground } from './components/ApiPlayground';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { ToastContainer, ToastMessage } from './components/Toast';

export default function App() {
  const [activeRole, setActiveRole] = useState<UserRole>('clinic');
  const [activeTab, setActiveTab] = useState<string>('form');
  const [jwtToken, setJwtToken] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<DemandRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    initializeAppData();
  }, []);

  const initializeAppData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch JWT Token
      const tokenRes = await fetch('/api/v1/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'clinic1', password: 'clinic123' })
      });
      const tokenData = await tokenRes.json();
      const token = tokenData.access_token || '';
      setJwtToken(token);

      // 2. Fetch Products Catalog
      const prodRes = await fetch('/api/v1/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const prodData = await prodRes.json();
      if (prodData.products) {
        setProducts(prodData.products);
      }

      // 3. Fetch Demand Requests
      const reqRes = await fetch('/api/v1/demand/requests', {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Demo-User-Role': activeRole
        }
      });
      const reqData = await reqRes.json();
      if (reqData.requests) {
        setOrders(reqData.requests);
      }
    } catch (err) {
      console.error('Initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setActiveRole(role);
    if (role === 'clinic' && activeTab === 'review') {
      setActiveTab('form');
    } else if (role === 'sales' && activeTab === 'form') {
      setActiveTab('review');
    }
    refreshOrders(role);
  };

  const refreshOrders = async (roleToUse?: UserRole) => {
    try {
      const res = await fetch('/api/v1/demand/requests', {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          'X-Demo-User-Role': roleToUse || activeRole
        }
      });
      const data = await res.json();
      if (data.requests) {
        setOrders(data.requests);
      }
    } catch (err) {
      console.error('Refresh orders error:', err);
    }
  };

  const handleNewOrderSubmitted = (newReq: DemandRequest) => {
    setOrders((prev) => [newReq, ...prev]);
    addToast(
      'success',
      'Demand Request Submitted!',
      `Order #${newReq.order_number} for ${newReq.clinic_name} has been placed successfully.`
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center animate-pulse mb-4">
          <span className="font-bold text-emerald-400 text-xl">SABA</span>
        </div>
        <h2 className="text-lg font-bold">Connecting to SABA API Gateway...</h2>
        <p className="text-xs text-slate-400 mt-1">Authenticating Bearer JWT Token & Loading Product Catalog</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white relative">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <Navbar
        activeRole={activeRole}
        onRoleChange={handleRoleChange}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        jwtToken={jwtToken}
      />

      <main className="pb-16">
        {activeTab === 'form' && (
          <DemandRequestForm
            products={products}
            jwtToken={jwtToken}
            onOrderSubmitted={handleNewOrderSubmitted}
          />
        )}

        {activeTab === 'orders' && (
          <OrderTracker orders={orders} jwtToken={jwtToken} />
        )}

        {activeTab === 'review' && (
          <SalesReviewQueue
            orders={orders}
            jwtToken={jwtToken}
            onOrderUpdated={refreshOrders}
            onNotify={addToast}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard orders={orders} products={products} jwtToken={jwtToken} />
        )}

        {activeTab === 'api' && <ApiPlayground jwtToken={jwtToken} />}
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 text-white py-6 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-400 font-mono">
          <div>© 2026 SABA Reproductive & Family Health Logistics Platform</div>
          <div>RESTful API v1.4 | Security Protocols: OAuth 2.0 / Bearer JWT / SHA-256 Checksum</div>
        </div>
      </footer>
    </div>
  );
}
