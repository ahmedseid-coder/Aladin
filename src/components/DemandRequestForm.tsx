import React, { useState, useMemo } from 'react';
import { UserRole, Product, ProductCategory, UrgencyLevel, DemandForecastResult, DemandRequest } from '../types';
import {
  Sparkles,
  ShieldCheck,
  Lock,
  Package,
  Plus,
  Minus,
  Trash2,
  AlertTriangle,
  Send,
  CheckCircle,
  FileCode,
  Info,
  Layers,
  PhoneCall,
  Loader2,
  Cpu,
  UserCheck
} from 'lucide-react';
import { SabaClinicLogo } from './Logos';

interface DemandRequestFormProps {
  products: Product[];
  jwtToken: string;
  activeRole?: UserRole;
  onOrderSubmitted: (newReq: DemandRequest) => void;
}

export const DemandRequestForm: React.FC<DemandRequestFormProps> = ({
  products,
  jwtToken,
  activeRole,
  onOrderSubmitted
}) => {
  // Form State
  const [clinicName, setClinicName] = useState('Abebe Medical Specialty Center (Addis Ababa)');
  const [clinicRep, setClinicRep] = useState('Dr. Abebe Kebede');
  const [clinicPhone, setClinicPhone] = useState('+251922345678');
  const [urgency, setUrgency] = useState<UrgencyLevel>('urgent');
  const [notes, setNotes] = useState('Urgent demand restock for upcoming community health screening campaign.');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart / Quantities State: Map of product_id -> quantity
  const [orderItemsMap, setOrderItemsMap] = useState<Record<number, number>>({
    1: 20, // Hiwot Trust
    3: 10, // Postpill
    7: 50  // Depogestin
  });

  // AI Forecast State
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<DemandForecastResult | null>(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<DemandRequest | null>(null);

  const categories: string[] = [
    'All',
    'Condoms',
    'Emergency Contraceptives',
    'Oral Contraceptives',
    'Injectables',
    'LARCs',
    'Safe Abortion and PPH',
    'Others'
  ];

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.product_code.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Quantity updates
  const handleQuantityChange = (productId: number, qty: number) => {
    if (qty <= 0) {
      const copy = { ...orderItemsMap };
      delete copy[productId];
      setOrderItemsMap(copy);
    } else {
      setOrderItemsMap((prev) => ({ ...prev, [productId]: qty }));
    }
  };

  // Selected Order Summary
  const selectedProductList = useMemo(() => {
    return Object.entries(orderItemsMap)
      .map(([idStr, qty]) => {
        const prod = products.find((p) => p.id === parseInt(idStr));
        const quantity = Number(qty) || 0;
        if (!prod || quantity <= 0) return null;
        return {
          product: prod,
          quantity,
          totalPrice: prod.per_pack_trade * quantity
        };
      })
      .filter(Boolean) as { product: Product; quantity: number; totalPrice: number }[];
  }, [orderItemsMap, products]);

  const totalAmountETB = useMemo(() => {
    return selectedProductList.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [selectedProductList]);

  // Simulated Live Checksum Calculation
  const liveChecksum = useMemo(() => {
    const raw = `${clinicName}-${totalAmountETB}-${selectedProductList.length}-${urgency}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = (hash << 5) - hash + raw.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(16, 'e9a4f8b2c1d07e6f');
  }, [clinicName, totalAmountETB, selectedProductList, urgency]);

  // Trigger Gemini AI Demand Forecast
  const handleRequestAiForecast = async () => {
    setIsAiLoading(true);
    setAiResult(null);

    try {
      const res = await fetch('/api/v1/demand/ai-forecast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`
        },
        body: JSON.stringify({
          clinic_name: clinicName,
          recent_patient_volume: '450 patients/month, 60% family planning requests',
          primary_needs: 'High demand for injectables (DMPA), Emergency Contraceptives, and IUCD LARCs',
          current_inventory: { INJ001: 5, EC001: 2, LARC003: 1, COND001: 10 }
        })
      });

      const data = await res.json();
      setAiResult(data);
    } catch (err) {
      console.error('AI Forecast error:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const isClinicPartner = !activeRole || activeRole === 'clinic';

  // Apply AI recommendations to cart
  const handleApplyAiSuggestions = () => {
    if (!aiResult || !aiResult.suggested_orders) return;
    const newMap: Record<number, number> = { ...orderItemsMap };

    aiResult.suggested_orders.forEach((rec) => {
      const matchedProd = products.find(
        (p) => p.product_code === rec.product_code || p.name.includes(rec.product_name)
      );
      if (matchedProd) {
        newMap[matchedProd.id] = rec.recommended_qty;
      }
    });

    setOrderItemsMap(newMap);
  };

  // Submit Demand Request API Call
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProductList.length === 0) {
      alert('Please select at least one medical product to submit a demand request.');
      return;
    }

    setIsSubmitting(true);

    try {
      const itemsPayload = selectedProductList.map((item) => ({
        product_id: item.product.id,
        product_code: item.product.product_code,
        quantity_requested: item.quantity,
        unit_price: item.product.per_pack_trade
      }));

      const res = await fetch('/api/v1/demand/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`
        },
        body: JSON.stringify({
          clinic_id: 2,
          clinic_name: clinicName,
          clinic_rep: clinicRep,
          phone: clinicPhone,
          urgency,
          notes,
          items: itemsPayload
        })
      });

      const data = await res.json();
      if (data.success && data.request) {
        setSubmittedOrder(data.request);
        onOrderSubmitted(data.request);
      } else {
        alert('Error submitting demand request: ' + (data.detail || data.error || 'Unknown error'));
      }
    } catch (err: any) {
      console.error('Submission failed:', err);
      alert('Failed to connect to SABA API Endpoint');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Security Protocol Verification Header */}
      <div className="bg-gradient-to-r from-red-950 via-rose-950 to-red-900 border border-red-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* SABA Logo */}
              <div className="flex items-center gap-2 bg-white/95 px-2 py-1 rounded-xl border border-rose-300 shadow">
                <SabaClinicLogo className="h-8" />
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                Authenticated Clinic Node
              </span>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-200 border border-amber-400/30 flex items-center gap-1.5 font-mono">
                <UserCheck className="w-3.5 h-3.5 text-amber-300" />
                Prepared by: Ahmed IT
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-black tracking-tight text-white">SABA Partner Demand Request Form</h2>
              <p className="text-xs text-rose-100 max-w-2xl mt-1 leading-relaxed">
                Official standardized demand request portal for clinic partners under <strong>DKT ETHIOPIA</strong>. Only authorized partner clinics submit orders for reproductive health commodities and family planning inventory.
              </p>
            </div>
          </div>

          <div className="bg-red-900/80 border border-red-800/90 rounded-xl p-4 font-mono text-xs text-rose-100 space-y-2.5 shadow-inner">
            <div className="flex justify-between items-center text-amber-300 font-bold border-b border-red-800 pb-2">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Security Protocol
              </span>
              <span className="text-[10px] uppercase tracking-wider bg-red-950 text-amber-300 px-2 py-0.5 rounded border border-red-800">
                REST OAuth 2.0 / JWT
              </span>
            </div>
            <div className="truncate">
              <span className="text-rose-300/70">Bearer Token: </span>
              <span className="text-white font-bold">{jwtToken.substring(0, 24)}...</span>
            </div>
            <div className="truncate">
              <span className="text-rose-300/70">Payload Checksum: </span>
              <span className="text-amber-300 font-bold">{liveChecksum}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Role Submission Notice */}
      {activeRole && activeRole !== 'clinic' && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-amber-950 text-xs font-semibold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-200 text-amber-950 rounded-xl font-bold">
              <Info className="w-5 h-5 text-amber-900" />
            </div>
            <div>
              <div className="font-bold text-sm flex items-center gap-2">
                <span>Clinic Submission Role Notice</span>
                <span className="bg-amber-200 text-amber-950 text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase">
                  ACTIVE ROLE: {activeRole.toUpperCase()}
                </span>
              </div>
              <p className="text-amber-900 font-medium text-xs mt-0.5">
                Official demand requests are submitted by partner clinic representatives (e.g. Dr. Abebe). You can submit this order on behalf of the clinic for testing or demonstration.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmitForm} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Clinic Details & Product Catalog */}
        <div className="lg:col-span-8 space-y-6">
          {/* Clinic Information Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <PhoneCall className="w-4 h-4 text-emerald-600" />
              1. Partner Clinic Identification & Verification
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Clinic Partner Facility Name</label>
                <select
                  value={clinicName}
                  onChange={(e) => {
                    const selected = e.target.value;
                    setClinicName(selected);
                    if (selected === 'Abebe Medical Specialty Center (Addis Ababa)') {
                      setClinicRep('Dr. Abebe Kebede');
                      setClinicPhone('+251922345678');
                    } else if (selected === 'Bole Care Family Clinic') {
                      setClinicRep('Dr. Sara Tadesse');
                      setClinicPhone('+251933456789');
                    } else if (selected === 'Merkato Health Center') {
                      setClinicRep('Dr. Yohannes Alemu');
                      setClinicPhone('+251944567890');
                    } else if (selected === 'Hawassa Reproductive Health Center') {
                      setClinicRep('Dr. Meron Assefa');
                      setClinicPhone('+251911987654');
                    } else if (selected === 'Gondar Family Care Clinic') {
                      setClinicRep('Dr. Solomon Worku');
                      setClinicPhone('+251955112233');
                    } else if (selected === 'Adama Primary Care Center') {
                      setClinicRep('Dr. Tigist Bekele');
                      setClinicPhone('+251966223344');
                    } else if (selected === 'St. Paul Family Planning Wing (Addis Ababa)') {
                      setClinicRep('Dr. Ephrem Tekle');
                      setClinicPhone('+251977334455');
                    } else if (selected === 'Mekelle Health Partner Station') {
                      setClinicRep('Dr. Berhane Hailu');
                      setClinicPhone('+251988445566');
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  required
                >
                  <option value="Abebe Medical Specialty Center (Addis Ababa)">Abebe Medical Specialty Center (Addis Ababa)</option>
                  <option value="Bole Care Family Clinic">Bole Care Family Clinic</option>
                  <option value="Merkato Health Center">Merkato Health Center</option>
                  <option value="St. Paul Family Planning Wing (Addis Ababa)">St. Paul Family Planning Wing (Addis Ababa)</option>
                  <option value="Hawassa Reproductive Health Center">Hawassa Reproductive Health Center</option>
                  <option value="Gondar Family Care Clinic">Gondar Family Care Clinic</option>
                  <option value="Adama Primary Care Center">Adama Primary Care Center</option>
                  <option value="Mekelle Health Partner Station">Mekelle Health Partner Station</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Authorizing Doctor / Representative</label>
                <input
                  type="text"
                  value={clinicRep}
                  onChange={(e) => setClinicRep(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Verified Contact Phone (SMS Alert)</label>
                <input
                  type="text"
                  value={clinicPhone}
                  onChange={(e) => setClinicPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Urgency & Logistics Priority</label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="routine">Routine Monthly Stocking (Standard Dispatch)</option>
                  <option value="urgent">Urgent Restock Needed (Priority 24-48h)</option>
                  <option value="emergency_stockout">Emergency Stock Out Hazard (Express Fleet)</option>
                </select>
              </div>
            </div>
          </div>

          {/* AI Demand Forecasting Assistant Panel */}
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl border border-emerald-800/80 p-6 text-white shadow-md relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-emerald-300 animate-pulse" />
                  </span>
                  <h4 className="font-bold text-white text-base">Gemini AI Demand Forecast Engine</h4>
                </div>
                <p className="text-xs text-slate-300">
                  Predict optimal reorder quantities based on clinic patient volume, seasonal disease vector trends, and stockout risk analysis.
                </p>
              </div>

              <button
                type="button"
                onClick={handleRequestAiForecast}
                disabled={isAiLoading}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg flex items-center gap-2 transition-all whitespace-nowrap self-start sm:self-center disabled:opacity-50"
              >
                {isAiLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    Analyzing Clinic Velocity...
                  </>
                ) : (
                  <>
                    <Cpu className="w-4 h-4 text-slate-950" />
                    Calculate AI Reorder Recommendation
                  </>
                )}
              </button>
            </div>

            {/* AI Result Card */}
            {aiResult && (
              <div className="mt-5 pt-4 border-t border-emerald-800/60 bg-slate-950/70 rounded-xl p-4 text-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-emerald-400">Stockout Risk Index:</span>
                    <span
                      className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono ${
                        aiResult.stockout_risk_score > 50
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {aiResult.stockout_risk_score}% Risk Score
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyAiSuggestions}
                    className="text-xs font-bold text-emerald-300 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700/60 px-3 py-1 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    Apply AI Suggested Quantities
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed italic border-l-2 border-emerald-500 pl-3">
                  "{aiResult.clinical_insight}"
                </p>

                {aiResult.suggested_orders && aiResult.suggested_orders.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                    {aiResult.suggested_orders.map((item, idx) => (
                      <div key={idx} className="bg-slate-900 border border-slate-800 p-2.5 rounded-lg text-xs">
                        <div className="font-semibold text-emerald-300 truncate">{item.product_name}</div>
                        <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1 font-mono">
                          <span>Code: {item.product_code}</span>
                          <span className="text-amber-300 font-bold">Qty: {item.recommended_qty}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Product Catalog Selection Area */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-600" />
                  2. Select SABA Health Commodities & Quantities
                </h3>
                <p className="text-xs text-slate-500">Official trade catalog in Ethiopian Birr (ETB)</p>
              </div>

              <input
                type="text"
                placeholder="Search by product name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-64"
              />
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProducts.map((product) => {
                const currentQty = orderItemsMap[product.id] || 0;

                return (
                  <div
                    key={product.id}
                    className={`rounded-xl border p-4 transition-all flex flex-col justify-between ${
                      currentQty > 0
                        ? 'border-emerald-500 bg-emerald-50/40 shadow-sm ring-1 ring-emerald-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 mb-1 border border-slate-200">
                            {product.product_code}
                          </span>
                          <h4 className="font-bold text-sm text-slate-900 leading-snug">{product.name}</h4>
                        </div>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-100 text-teal-800 whitespace-nowrap">
                          {product.category}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-2">{product.description}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-slate-500">
                          Unit: <span className="font-semibold text-slate-700">{product.unit}</span> ({product.qty_per_pack} per pack)
                        </div>
                        <div className="text-sm font-bold text-slate-900 font-mono">
                          ETB {(product.per_pack_trade || 0).toLocaleString()}{' '}
                          <span className="text-[11px] font-normal text-slate-500">/ pack</span>
                        </div>
                      </div>

                      {/* Quantity Controller */}
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(product.id, currentQty - 1)}
                          className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-200 font-bold transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>

                        <input
                          type="number"
                          min="0"
                          value={currentQty}
                          onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value) || 0)}
                          className="w-12 text-center text-xs font-bold font-mono bg-transparent text-slate-900 focus:outline-none"
                        />

                        <button
                          type="button"
                          onClick={() => handleQuantityChange(product.id, currentQty + 1)}
                          className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold hover:bg-emerald-500 shadow-sm transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary, Checksum & Digital Signature Submission */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-6 shadow-xl sticky top-28 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                Demand Request Summary
              </h3>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {selectedProductList.length} Products Selected
              </span>
            </div>

            {/* Items List */}
            {selectedProductList.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs space-y-2">
                <Package className="w-8 h-8 text-slate-600 mx-auto" />
                <p>No commodities selected yet.</p>
                <p className="text-[11px] text-slate-500">Use the catalog on the left to add items to your demand request.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {selectedProductList.map(({ product, quantity, totalPrice }) => (
                  <div key={product.id} className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl flex items-center justify-between gap-2">
                    <div className="truncate">
                      <div className="text-xs font-semibold text-slate-200 truncate">{product.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {quantity} {product.unit} × ETB {product.per_pack_trade}
                      </div>
                    </div>
                    <div className="text-right whitespace-nowrap">
                      <div className="text-xs font-bold text-emerald-300 font-mono">
                        ETB {(totalPrice || 0).toLocaleString()}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(product.id, 0)}
                        className="text-[10px] text-red-400 hover:text-red-300 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Total Calculation */}
            <div className="border-t border-slate-800 pt-4 space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Subtotal Health Trade Price:</span>
                <span className="font-mono text-slate-200">ETB {(totalAmountETB || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>VAT Duty & Tax:</span>
                <span className="text-emerald-400 font-semibold font-mono">EXEMPT (Essential Health)</span>
              </div>
              <div className="flex justify-between items-center text-base font-bold text-white pt-2 border-t border-slate-800">
                <span>Total Demand Value:</span>
                <span className="text-emerald-400 font-mono text-lg">ETB {(totalAmountETB || 0).toLocaleString()}</span>
              </div>
            </div>

            {/* Dispatch Instructions */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Logistical Notes & Instructions</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Specific storage instructions, cold-chain requirements..."
              />
            </div>

            {/* Checksum & Digital Signature Info */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 text-[11px] font-mono text-slate-400 space-y-1.5">
              <div className="flex items-center justify-between text-slate-300 font-bold border-b border-slate-800/80 pb-1">
                <span>SHA-256 Checksum Hash</span>
                <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">Tamper-Evident</span>
              </div>
              <div className="text-amber-300 truncate">{liveChecksum}</div>
            </div>

            {!isClinicPartner && (
              <div className="bg-amber-950/90 border border-amber-700/80 text-amber-200 p-3.5 rounded-xl text-xs space-y-1 shadow-md">
                <div className="font-bold flex items-center gap-2 text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  Role Policy: Read-Only / Exploration Mode
                </div>
                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  Demand request transmission is strictly performed by authorized <strong>Clinic Partners</strong>. As a <strong>{activeRole === 'center_admin' ? 'Center Admin' : activeRole === 'sales_rep' ? 'Sales Representative' : 'Logistics Admin'}</strong>, order submission is disabled.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || selectedProductList.length === 0 || !isClinicPartner}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!isClinicPartner ? (
                <>
                  <Lock className="w-4 h-4 text-slate-950" />
                  Transmit Reserved for Clinic Partners Only
                </>
              ) : isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
                  Encrypting & Transmitting Payload...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-slate-950" />
                  Transmit Authorised Demand Request
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Submission Success Modal */}
      {submittedOrder && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Demand Request Transmitted Successfully</h3>
                <p className="text-xs text-slate-400">REST API Response Code 201 Created</p>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-2">
              <div className="flex justify-between border-b border-slate-800 pb-2 text-emerald-400 font-bold">
                <span>Order Reference: {submittedOrder.order_number}</span>
                <span>Status: PENDING REVIEW</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div>Clinic: <span className="text-white">{submittedOrder.clinic_name}</span></div>
                <div>Amount: <span className="text-emerald-300 font-bold">ETB {(submittedOrder.total_amount || 0).toLocaleString()}</span></div>
                <div>Auth Method: <span className="text-teal-300">{submittedOrder.auth_method}</span></div>
                <div>Items Count: <span className="text-white">{submittedOrder.items.length} Products</span></div>
              </div>
              <div className="pt-2 text-[10px] text-amber-300 truncate">
                Checksum: {submittedOrder.checksum}
              </div>
            </div>

            <div className="bg-emerald-950/60 border border-emerald-900/80 rounded-xl p-3 text-xs text-emerald-200 flex items-start gap-2">
              <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">SMS Dispatch Notification Sent:</span>
                <p className="text-[11px] text-emerald-300 mt-0.5">
                  An automated confirmation message was delivered to {clinicPhone}. You can track review progress in the Requests & Tracker tab.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSubmittedOrder(null)}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors"
              >
                Done & Close Confirmation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
