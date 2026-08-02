import React, { useState } from 'react';
import { DemandRequest, OrderStatus, UserRole } from '../types';
import {
  Activity,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  FileText,
  Search,
  Filter,
  Printer,
  ShieldCheck,
  PackageCheck,
  UserCheck,
  Download,
  Eye,
  Calendar,
  Building2,
  FileSpreadsheet,
  FileCode,
  Lock,
  History,
  QrCode,
  Scan,
  PhoneCall
} from 'lucide-react';
import { SabaClinicLogo } from './Logos';

interface OrderTrackerProps {
  orders: DemandRequest[];
  jwtToken: string;
  activeRole?: UserRole;
  onOpenQrScanner?: () => void;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({ orders, activeRole, onOpenQrScanner }) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [historyPeriod, setHistoryPeriod] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<DemandRequest | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const isCenterAdmin = activeRole === 'center_admin';

  const filteredOrders = orders.filter((ord) => {
    let matchesTime = true;
    if (historyPeriod === '30days') {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      matchesTime = new Date(ord.order_date) >= thirtyDaysAgo;
    } else if (historyPeriod === '7days') {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      matchesTime = new Date(ord.order_date) >= sevenDaysAgo;
    }

    const matchesStatus = statusFilter === 'all' || ord.status === statusFilter;

    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      ord.order_number.toLowerCase().includes(q) ||
      ord.clinic_name.toLowerCase().includes(q) ||
      ord.clinic_rep.toLowerCase().includes(q) ||
      ord.urgency.toLowerCase().includes(q) ||
      ord.checksum.toLowerCase().includes(q) ||
      (ord.sales_rep_name && ord.sales_rep_name.toLowerCase().includes(q)) ||
      ord.items.some(
        (it) => it.name.toLowerCase().includes(q) || it.product_code.toLowerCase().includes(q)
      );

    return matchesTime && matchesStatus && matchesQuery;
  });

  const handleExportCSV = () => {
    if (!orders || orders.length === 0) return;

    const headers = [
      'Order Number',
      'Clinic Name',
      'Clinic Rep',
      'Urgency',
      'Order Status',
      'Total Amount (ETB)',
      'Order Date',
      'Review Date',
      'Delivery Date',
      'Delivered By',
      'Authorization Checksum'
    ];

    const rows = filteredOrders.map((o) => [
      `"${o.order_number || ''}"`,
      `"${(o.clinic_name || '').replace(/"/g, '""')}"`,
      `"${(o.clinic_rep || '').replace(/"/g, '""')}"`,
      `"${o.urgency || ''}"`,
      `"${o.status || ''}"`,
      o.total_amount || 0,
      `"${o.order_date ? new Date(o.order_date).toLocaleString() : ''}"`,
      `"${o.review_date ? new Date(o.review_date).toLocaleString() : ''}"`,
      `"${o.delivery_date ? new Date(o.delivery_date).toLocaleString() : ''}"`,
      `"${o.delivered_by || ''}"`,
      `"${o.checksum || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SABA_Orders_History_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    if (!orders || orders.length === 0) return;
    const jsonStr = JSON.stringify(filteredOrders, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SABA_Orders_Export_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pending Review
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            Approved
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
            <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
            Delivered
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 font-mono">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            Rejected
          </span>
        );
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    if (urgency === 'emergency_stockout') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 uppercase tracking-wider">
          Emergency Stock Out
        </span>
      );
    }
    if (urgency === 'urgent') {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 uppercase tracking-wider">
          Urgent Priority
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase tracking-wider">
        Routine
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Center Admin Read-Only Notice Banner */}
      {isCenterAdmin && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-red-950 p-4 rounded-2xl border-2 border-amber-300 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-950 text-amber-300 rounded-xl font-bold shadow-md">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <div className="font-black text-sm uppercase tracking-wide flex items-center gap-2">
                <span>Center Admin Audit & Oversight Mode</span>
                <span className="bg-red-950 text-amber-300 px-2 py-0.5 rounded text-[10px] font-mono font-bold">READ-ONLY</span>
              </div>
              <p className="text-xs font-medium text-red-950/90 mt-0.5">
                Full visibility into all clinic transactions, order histories, and delivery logs. Modification capabilities are strictly locked for executive decision analysis.
              </p>
            </div>
          </div>
          <div className="text-xs font-bold font-mono bg-red-950/90 text-amber-300 px-3 py-1.5 rounded-xl border border-red-900 shadow shrink-0">
            Control Mode: Inspection Only
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-red-950 via-rose-950 to-red-900 p-6 rounded-2xl border border-red-800 text-white shadow-xl">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white/95 px-2 py-1 rounded-xl border border-rose-300 shadow">
              <SabaClinicLogo className="h-7" />
            </div>

            <div className="px-3 py-1 bg-amber-400/20 border border-amber-400/40 text-amber-300 rounded-full text-xs font-bold flex items-center gap-1.5 font-mono">
              <UserCheck className="w-3.5 h-3.5 text-amber-300" />
              Prepared by: Ahmed IT
            </div>

            <div className="px-2.5 py-1 bg-rose-500/30 border border-rose-400/40 text-rose-200 rounded-full text-xs font-mono font-semibold">
              Total Records: {filteredOrders.length}
            </div>
          </div>

          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            Clinic Order History & Multi-Search Tracker
          </h2>
          <p className="text-xs text-rose-100 font-medium">
            Search, filter, export, and inspect complete demand transaction history across all partner clinics.
          </p>
        </div>

        {/* Multi-Search & Export Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Export & Scan Buttons */}
          <div className="flex items-center gap-1.5">
            {onOpenQrScanner && (
              <button
                onClick={onOpenQrScanner}
                className="px-3 py-2 bg-red-950 hover:bg-red-900 text-amber-400 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md border border-red-800 transition-all cursor-pointer active:scale-95"
                title="Scan QR Code or Checksum receipt"
              >
                <QrCode className="w-4 h-4 text-amber-300" />
                <span>QR Verifier</span>
              </button>
            )}

            <button
              onClick={handleExportCSV}
              className="px-3 py-2 bg-amber-400 hover:bg-amber-300 text-red-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-95"
              title="Export order history to CSV file"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-red-950" />
              <span>CSV Export</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="px-3 py-2 bg-rose-800 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 border border-rose-700 shadow-md transition-all cursor-pointer active:scale-95"
              title="Export order history payload to JSON file"
            >
              <FileCode className="w-3.5 h-3.5 text-amber-300" />
              <span>JSON Export</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Order #, Clinic, Product, Hash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-64 shadow-inner"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                statusFilter === 'all' ? 'bg-white text-slate-900 font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                statusFilter === 'pending' ? 'bg-amber-500 text-white font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                statusFilter === 'approved' ? 'bg-blue-600 text-white font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setStatusFilter('delivered')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                statusFilter === 'delivered' ? 'bg-emerald-600 text-white font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Delivered
            </button>
          </div>
        </div>
      </div>

      {/* History Period Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs">
        <div className="flex items-center gap-2 text-slate-700 font-semibold">
          <Calendar className="w-4 h-4 text-red-700" />
          <span>History Filter:</span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 font-medium">
            <button
              onClick={() => setHistoryPeriod('all')}
              className={`px-3 py-1 rounded-md transition-all ${
                historyPeriod === 'all' ? 'bg-red-900 text-white font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setHistoryPeriod('30days')}
              className={`px-3 py-1 rounded-md transition-all ${
                historyPeriod === '30days' ? 'bg-red-900 text-white font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Past 30 Days
            </button>
            <button
              onClick={() => setHistoryPeriod('7days')}
              className={`px-3 py-1 rounded-md transition-all ${
                historyPeriod === '7days' ? 'bg-red-900 text-white font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Past 7 Days
            </button>
          </div>
        </div>

        <div className="text-slate-500 font-mono text-[11px]">
          Showing <strong className="text-slate-900">{filteredOrders.length}</strong> of{' '}
          <strong className="text-slate-900">{orders.length}</strong> total transaction logs
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4 font-bold">Order Ref & Timestamp</th>
                <th className="py-3.5 px-4 font-bold">Partner Clinic & Representative</th>
                <th className="py-3.5 px-4 font-bold">Urgency</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold text-right">Total Amount</th>
                <th className="py-3.5 px-4 font-bold text-center">Print / Export Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No demand requests found matching your search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900 font-mono text-sm flex items-center gap-1.5">
                        {ord.order_number}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {new Date(ord.order_date).toLocaleDateString()} {new Date(ord.order_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900">{ord.clinic_name}</div>
                      <div className="text-[11px] text-slate-500">Rep: {ord.clinic_rep}</div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">{getUrgencyBadge(ord.urgency)}</td>

                    <td className="py-4 px-4 whitespace-nowrap">{getStatusBadge(ord.status)}</td>

                    <td className="py-4 px-4 text-right font-mono font-bold text-slate-900 text-sm whitespace-nowrap">
                      ETB {(ord.total_amount ?? 0).toLocaleString()}
                    </td>

                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                      >
                        <Printer className="w-3.5 h-3.5 text-amber-400" />
                        <span>Print Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail & Printable Receipt Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 text-slate-900 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto relative print:max-w-none print:w-full print:p-0 print:shadow-none">
            
            {/* Modal Actions Bar (Hidden when printing) */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 print:hidden">
              <div className="flex items-center gap-2">
                <div className="bg-red-950 p-1.5 rounded-xl text-white">
                  <Printer className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-sans">Official Consignment Receipt</h3>
                  <p className="text-xs text-slate-500">DKT ETHIOPIA Reproductive Health Supply Note</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-white" />
                  <span>Print Document</span>
                </button>

                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Document Body */}
            <div className="border border-slate-300 rounded-2xl p-6 bg-slate-50/50 space-y-6 print:border-none print:bg-white print:p-0">
              {/* Document Header */}
              <div className="flex items-start justify-between border-b-2 border-red-900 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <SabaClinicLogo className="h-8" />
                    <span className="font-extrabold text-red-950 text-xl font-sans tracking-tight">DKT ETHIOPIA</span>
                  </div>
                  <div className="text-xs text-slate-600 font-medium">
                    Central Reproductive Health Supply Chain Operations
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    TIN: 0004928172 | Registration No: DKT-RH-2026-ETH
                  </div>
                </div>

                <div className="text-right space-y-1 font-mono">
                  <div className="text-xs font-bold text-red-950 uppercase tracking-wider">OFFICIAL INVOICE & CONSIGNMENT NOTE</div>
                  <div className="text-lg font-black text-slate-900">{selectedOrder.order_number}</div>
                  <div className="text-xs text-slate-600">Date: {selectedOrder.order_date ? new Date(selectedOrder.order_date).toLocaleDateString() : 'N/A'}</div>
                </div>
              </div>

              {/* Clinic & Order Attributes */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-white p-4 rounded-xl border border-slate-200">
                <div className="space-y-1">
                  <div className="font-bold text-red-950 uppercase tracking-wider text-[10px]">CONSIGNEE (PARTNER CLINIC):</div>
                  <div className="font-bold text-slate-900 text-sm">{selectedOrder.clinic_name}</div>
                  <div className="text-slate-700">Attn Representative: <strong>{selectedOrder.clinic_rep}</strong></div>
                  <div className="text-slate-600 font-mono text-[11px]">Urgency Status: {selectedOrder.urgency?.toUpperCase()}</div>
                </div>

                <div className="space-y-1 text-right font-mono">
                  <div className="font-bold text-red-950 uppercase tracking-wider text-[10px]">AUTHORIZATION SECURITY:</div>
                  <div className="text-slate-900 font-semibold">Protocol: {selectedOrder.auth_method?.toUpperCase()}</div>
                  <div className="text-slate-600 text-[10px] break-all">Checksum: {selectedOrder.checksum}</div>
                  <div className="text-emerald-700 font-bold">Status: {selectedOrder.status?.toUpperCase()}</div>
                </div>
              </div>

              {/* Line Items Table */}
              <div>
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Itemized Commodity Breakdown</div>
                <table className="w-full text-left text-xs text-slate-800 border-collapse">
                  <thead className="bg-slate-200/70 border-y border-slate-300 font-bold uppercase text-[10px] text-slate-700">
                    <tr>
                      <th className="py-2.5 px-3">Product Code & Name</th>
                      <th className="py-2.5 px-3 text-center">Unit Type</th>
                      <th className="py-2.5 px-3 text-center">Quantity</th>
                      <th className="py-2.5 px-3 text-right">Unit Trade Price</th>
                      <th className="py-2.5 px-3 text-right">Subtotal (ETB)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-100/50">
                        <td className="py-2.5 px-3 font-sans">
                          <span className="font-mono text-slate-500 font-bold text-[11px] mr-1">[{item.product_code}]</span>
                          <span className="font-semibold text-slate-900">{item.name}</span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-sans text-slate-600">{item.unit}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-900">{item.quantity_requested}</td>
                        <td className="py-2.5 px-3 text-right">ETB {(item.unit_price ?? 0).toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          ETB {(item.total_price ?? 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Calculation Summary */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1 text-xs font-mono">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal Trade Value:</span>
                    <span>ETB {(selectedOrder.total_amount ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>VAT (Exempt RH Medical):</span>
                    <span>ETB 0.00</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-bold text-base border-t-2 border-slate-900 pt-1">
                    <span>Grand Total:</span>
                    <span className="text-red-950">ETB {(selectedOrder.total_amount ?? 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Rejection Reason (If Rejected) */}
              {selectedOrder.status === 'rejected' && selectedOrder.rejection_reason && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-xl text-xs text-red-950 font-sans space-y-1">
                  <div className="font-bold text-red-900 flex items-center gap-1.5 uppercase text-[10px]">
                    <XCircle className="w-4 h-4 text-red-600" /> Sales Manager Rejection Decision & Reason:
                  </div>
                  <div className="text-red-800 font-medium pl-5.5">{selectedOrder.rejection_reason}</div>
                </div>
              )}

              {/* Lifecycle Timestamp Audit & Logistics Vehicle Details */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs font-mono space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <div className="font-bold text-slate-900 text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-red-900" /> Logistics Audit & Fleet Vehicle Details:
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                    SOURCE: {(selectedOrder.delivery_source || 'DKT Fleet').toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-slate-700 font-sans">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-mono">Assigned Courier / Driver:</span>
                    <strong className="text-slate-900">{selectedOrder.driver_name || selectedOrder.delivered_by || 'DKT Ethiopia Fleet'}</strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-mono">Vehicle Plate / Cold Van:</span>
                    <strong className="text-slate-900 font-mono">{selectedOrder.vehicle_plate || 'ET 3-45892 (Toyota HiAce)'}</strong>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-mono">Driver Contact:</span>
                    <strong className="text-slate-900 font-mono">{selectedOrder.driver_phone || '+251911445566'}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 pt-1 border-t border-slate-100 font-mono">
                  <div>Created: {selectedOrder.order_date ? new Date(selectedOrder.order_date).toLocaleString() : 'N/A'}</div>
                  <div className="text-right">Reviewed: {selectedOrder.review_date ? new Date(selectedOrder.review_date).toLocaleString() : 'Pending'}</div>
                </div>
              </div>

              {/* QR Verification Seal Block */}
              <div className="bg-slate-950 p-4 rounded-2xl text-white flex items-center justify-between gap-4 border border-slate-800 shadow-md">
                <div className="space-y-1">
                  <div className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-400" /> Cryptographic QR Receipt Authentication
                  </div>
                  <div className="text-xs text-slate-300 font-mono">
                    Order Ref: <strong>{selectedOrder.order_number}</strong> | Hash: <span className="text-amber-300">{selectedOrder.checksum.substring(0, 16)}...</span>
                  </div>
                </div>

                <div className="bg-white p-2 rounded-xl shadow-inner flex flex-col items-center justify-center shrink-0">
                  <QrCode className="w-12 h-12 text-slate-900" />
                  <span className="text-[8px] font-mono font-bold text-slate-600 mt-0.5">SCAN TO VERIFY</span>
                </div>
              </div>

              {/* Official Signatures & Seal */}
              <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-300 text-xs font-sans">
                <div className="space-y-8">
                  <div className="text-slate-500 text-[10px] uppercase font-bold">DISPATCHED BY (DKT ETHIOPIA LOGISTICS):</div>
                  <div className="border-b border-slate-400 pb-1">
                    <span className="text-slate-400 italic">Signature & Stamp</span>
                  </div>
                  <div className="text-[11px] text-slate-700 font-medium">SABA Central Logistics Manager</div>
                </div>

                <div className="space-y-8 text-right">
                  <div className="text-slate-500 text-[10px] uppercase font-bold">RECEIVED BY (PARTNER CLINIC):</div>
                  <div className="border-b border-slate-400 pb-1">
                    <span className="text-slate-400 italic">Representative Signature & Stamp</span>
                  </div>
                  <div className="text-[11px] text-slate-700 font-medium">{selectedOrder.clinic_rep} ({selectedOrder.clinic_name})</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
