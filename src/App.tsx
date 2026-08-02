import React, { useState, useEffect, useCallback, useRef } from 'react';
import { UserRole, Product, DemandRequest, User } from './types';
import { Navbar } from './components/Navbar';
import { DemandRequestForm } from './components/DemandRequestForm';
import { OrderTracker } from './components/OrderTracker';
import { SalesReviewQueue } from './components/SalesReviewQueue';
import { ApiPlayground } from './components/ApiPlayground';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { LoginModal } from './components/LoginModal';
import { QrScannerModal } from './components/QrScannerModal';
import { ToastContainer, ToastMessage } from './components/Toast';

import { INITIAL_PRODUCTS, INITIAL_DEMAND_REQUESTS, INITIAL_USERS } from './data/initialData';

export default function App() {
  const [activeRole, setActiveRole] = useState<UserRole>('clinic');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState<boolean>(false);
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<DemandRequest | null>(null);
  const [activeTab, setActiveTab] = useState<string>('form');
  const [jwtToken, setJwtToken] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<DemandRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // 15-Minute Auto-Logout Timer State
  const [inactivitySeconds, setInactivitySeconds] = useState<number>(15 * 60);
  const lastActivityRef = useRef<number>(Date.now());

  // Inactivity tracking listener
  useEffect(() => {
    if (!jwtToken) return;

    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    const handleUserActivity = () => {
      lastActivityRef.current = Date.now();
    };

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleUserActivity);
    });

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastActivityRef.current) / 1000);
      const remaining = Math.max(0, 15 * 60 - elapsed);
      setInactivitySeconds(remaining);

      if (remaining <= 0) {
        // Clear JWT and redirect to login modal
        setJwtToken('');
        setCurrentUser(null);
        setIsLoginModalOpen(true);
        setToasts((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            type: 'warning',
            title: 'Security Auto-Logout (15 Min Inactivity)',
            message: 'Session closed and JWT token cleared after 15 minutes of inactivity to protect clinic records.'
          }
        ]);
        lastActivityRef.current = Date.now();
      }
    }, 1000);

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
      clearInterval(interval);
    };
  }, [jwtToken]);

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
      // 1. Fetch JWT Token with retry
      let tokenRes: Response | null = null;
      for (let i = 0; i < 3; i++) {
        try {
          tokenRes = await fetch('/api/v1/auth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'clinic1', password: 'clinic123' })
          });
          if (tokenRes.ok) break;
        } catch (e) {
          if (i === 2) throw e;
          await new Promise((r) => setTimeout(r, 600));
        }
      }

      if (tokenRes && tokenRes.ok) {
        const tokenData = await tokenRes.json();
        const token = tokenData.access_token || '';
        setJwtToken(token);
        if (tokenData.user) {
          setCurrentUser(tokenData.user);
          setActiveRole(tokenData.user.role);
        }

        // 2. Fetch Products Catalog
        const prodRes = await fetch('/api/v1/products', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          if (prodData.products) setProducts(prodData.products);
        } else {
          setProducts(INITIAL_PRODUCTS);
        }

        // 3. Fetch Demand Requests
        const reqRes = await fetch('/api/v1/demand/requests', {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-Demo-User-Role': tokenData.user?.role || activeRole
          }
        });
        if (reqRes.ok) {
          const reqData = await reqRes.json();
          if (reqData.requests) setOrders(reqData.requests);
        } else {
          setOrders(INITIAL_DEMAND_REQUESTS);
        }
      } else {
        setProducts(INITIAL_PRODUCTS);
        setOrders(INITIAL_DEMAND_REQUESTS);
        setCurrentUser(INITIAL_USERS[1]);
      }
    } catch (err) {
      console.warn('Initialization network warning, falling back to cached state:', err);
      setProducts(INITIAL_PRODUCTS);
      setOrders(INITIAL_DEMAND_REQUESTS);
      setCurrentUser(INITIAL_USERS[1]);
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultTabForRole = (role: UserRole): string => {
    switch (role) {
      case 'clinic':
        return 'form';
      case 'sales':
        return 'review';
      case 'admin':
        return 'orders';
      case 'center_admin':
        return 'analytics';
      default:
        return 'form';
    }
  };

  // Safeguard: Ensure user stays strictly within allowed role tabs
  useEffect(() => {
    if (activeRole === 'clinic' && !['form', 'orders'].includes(activeTab)) {
      setActiveTab('form');
    } else if (activeRole === 'sales' && !['review', 'orders'].includes(activeTab)) {
      setActiveTab('review');
    } else if (activeRole === 'admin' && !['orders', 'review'].includes(activeTab)) {
      setActiveTab('orders');
    }
  }, [activeRole, activeTab]);

  const handleLoginSuccess = (token: string, user: User) => {
    setJwtToken(token);
    setCurrentUser(user);
    setActiveRole(user.role);
    setActiveTab(getDefaultTabForRole(user.role));
    refreshOrders(user.role, token);
  };

  const handleRoleChange = (role: UserRole) => {
    setActiveRole(role);
    if (role === 'clinic' && !['form', 'orders'].includes(activeTab)) {
      setActiveTab('form');
    } else if (role === 'sales' && !['review', 'orders'].includes(activeTab)) {
      setActiveTab('review');
    } else if (role === 'admin' && !['orders', 'review'].includes(activeTab)) {
      setActiveTab('orders');
    }
    refreshOrders(role);
  };

  const refreshOrders = async (roleToUse?: UserRole, tokenToUse?: string) => {
    try {
      const res = await fetch('/api/v1/demand/requests', {
        headers: {
          Authorization: `Bearer ${tokenToUse || jwtToken}`,
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

  const handleLogout = () => {
    setJwtToken('');
    setCurrentUser(null);
    addToast('warning', 'Logged Out', 'Session JWT token cleared. Click Role Login to authenticate.');
  };

  const handleReLogin = async () => {
    try {
      const tokenRes = await fetch('/api/v1/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'clinic1', password: 'clinic123' })
      });
      const tokenData = await tokenRes.json();
      const token = tokenData.access_token || '';
      setJwtToken(token);
      addToast('success', 'Authenticated', 'Obtained new Bearer JWT session token.');
    } catch (err) {
      console.error('Re-auth error:', err);
      addToast('error', 'Auth Failed', 'Could not obtain new JWT token.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-red-950 text-white flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-2xl bg-white/90 border border-rose-300 flex items-center justify-center animate-pulse mb-4 p-2 shadow-2xl">
          <span className="font-extrabold text-red-700 text-xl tracking-tighter font-sans">SABA</span>
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">Connecting to SABA API Gateway...</h2>
        <p className="text-xs text-rose-200 mt-1 font-mono">DKT ETHIOPIA Partner Clinics Supply Network</p>
        <div className="mt-4 px-3 py-1 bg-amber-400/20 border border-amber-400/40 rounded-full text-amber-300 text-xs font-bold">
          Prepared by: Ahmed IT
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-rose-950 to-red-900 text-slate-900 font-sans selection:bg-rose-600 selection:text-white relative">
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      <Navbar
        activeRole={activeRole}
        onRoleChange={handleRoleChange}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        jwtToken={jwtToken}
        currentUser={currentUser}
        inactivitySeconds={inactivitySeconds}
        onOpenQrScanner={() => setIsQrScannerOpen(true)}
        onLogout={handleLogout}
        onReLogin={() => setIsLoginModalOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onNotify={addToast}
      />

      <QrScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        orders={orders}
        onSelectOrder={(ord) => {
          setActiveTab('orders');
        }}
      />

      <main className="pb-16">
        {activeTab === 'form' && (
          <DemandRequestForm
            products={products}
            jwtToken={jwtToken}
            activeRole={activeRole}
            onOrderSubmitted={handleNewOrderSubmitted}
          />
        )}

        {activeTab === 'orders' && (
          <OrderTracker
            orders={orders}
            jwtToken={jwtToken}
            activeRole={activeRole}
            onOpenQrScanner={() => setIsQrScannerOpen(true)}
          />
        )}

        {activeTab === 'review' && (
          <SalesReviewQueue
            orders={orders}
            jwtToken={jwtToken}
            activeRole={activeRole}
            onOrderUpdated={refreshOrders}
            onNotify={addToast}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard orders={orders} products={products} jwtToken={jwtToken} />
        )}

        {activeTab === 'api' && <ApiPlayground jwtToken={jwtToken} />}
      </main>

      <footer className="bg-red-950 border-t border-red-900 text-white py-6 text-xs text-center shadow-inner">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-rose-200 font-mono">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">© 2026 SABA Reproductive & Family Health Logistics Platform</span>
            <span className="text-amber-400">|</span>
            <span className="text-amber-300 font-semibold">DKT ETHIOPIA Partner Clinics</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-amber-400/10 border border-amber-400/30 text-amber-200 px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
              <span>Prepared by: <strong className="text-white underline decoration-amber-400">Ahmed IT</strong></span>
            </div>
            <span className="text-rose-300/60">RESTful API v1.4</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
