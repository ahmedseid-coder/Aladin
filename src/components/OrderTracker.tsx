import React, { useState } from 'react';
import { DemandRequest, OrderStatus } from '../types';
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
  PhoneCall,
  ShieldCheck,
  ChevronRight,
  PackageCheck
} from 'lucide-react';

interface OrderTrackerProps {
  orders: DemandRequest[];
  jwtToken: string;
}

export const OrderTracker: React.FC<OrderTrackerProps> = ({ orders }) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<DemandRequest | null>(null);

  const filteredOrders = orders.filter((ord) => {
    const matchesStatus = statusFilter === 'all' || ord.status === statusFilter;
    const matchesQuery =
      ord.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.clinic_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.clinic_rep.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pending Sales Review
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            Approved for Dispatch
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
            <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
            Delivered & Received
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            Clinic Partner Demand Requests & Tracker
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time status tracking for all submitted health commodity orders.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by Order # or Clinic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-56"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                statusFilter === 'all' ? 'bg-white text-slate-900 font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                statusFilter === 'pending' ? 'bg-amber-500 text-white font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                statusFilter === 'approved' ? 'bg-blue-600 text-white font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setStatusFilter('delivered')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                statusFilter === 'delivered' ? 'bg-emerald-600 text-white font-bold shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Delivered
            </button>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4 font-bold">Order Ref & Date</th>
                <th className="py-3.5 px-4 font-bold">Partner Clinic & Representative</th>
                <th className="py-3.5 px-4 font-bold">Urgency</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold text-right">Total Amount</th>
                <th className="py-3.5 px-4 font-bold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No demand requests found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900 font-mono text-sm">{ord.order_number}</div>
                      <div className="text-[11px] text-slate-500">
                        {new Date(ord.order_date).toLocaleDateString()} at{' '}
                        {new Date(ord.order_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900">{ord.clinic_name}</div>
                      <div className="text-[11px] text-slate-500">{ord.clinic_rep}</div>
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">{getUrgencyBadge(ord.urgency)}</td>

                    <td className="py-4 px-4 whitespace-nowrap">{getStatusBadge(ord.status)}</td>

                    <td className="py-4 px-4 text-right font-mono font-bold text-slate-900 text-sm whitespace-nowrap">
                      ETB {ord.total_amount.toLocaleString()}
                    </td>

                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs inline-flex items-center gap-1 shadow-sm transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-400" />
                        View Invoice & Timeline
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal / Digital Consignment Note */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 text-slate-900 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider font-mono">
                  SABA Official Health Commodity Consignment Note
                </span>
                <h3 className="text-xl font-bold text-slate-900 font-mono mt-0.5">{selectedOrder.order_number}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Status Timeline */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Demand Lifecycle Stage</div>
              <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                <div className="space-y-1">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto font-bold">1</div>
                  <div className="font-semibold text-slate-800">API Transmitted</div>
                  <div className="text-[10px] text-slate-500 font-mono">Checksum Verified</div>
                </div>

                <div className="space-y-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto font-bold ${
                      selectedOrder.status !== 'pending' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    2
                  </div>
                  <div className="font-semibold text-slate-800">Sales Review</div>
                  <div className="text-[10px] text-slate-500 font-mono">{selectedOrder.review_date ? 'Approved' : 'In Queue'}</div>
                </div>

                <div className="space-y-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto font-bold ${
                      selectedOrder.status === 'delivered' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    3
                  </div>
                  <div className="font-semibold text-slate-800">Fleet Dispatch</div>
                  <div className="text-[10px] text-slate-500 font-mono">{selectedOrder.delivered_by || 'Pending'}</div>
                </div>

                <div className="space-y-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto font-bold ${
                      selectedOrder.status === 'delivered' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    4
                  </div>
                  <div className="font-semibold text-slate-800">Delivered</div>
                  <div className="text-[10px] text-slate-500 font-mono">{selectedOrder.delivery_date ? 'Completed' : 'En Route'}</div>
                </div>
              </div>
            </div>

            {/* Clinic & Order Info */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <div className="text-slate-500 font-medium">Clinic Facility:</div>
                <div className="font-bold text-slate-900">{selectedOrder.clinic_name}</div>
                <div className="text-slate-600">Rep: {selectedOrder.clinic_rep}</div>
              </div>

              <div>
                <div className="text-slate-500 font-medium">Security & Protocol:</div>
                <div className="font-mono text-slate-900 font-semibold">Auth: {selectedOrder.auth_method}</div>
                <div className="font-mono text-[10px] text-slate-500 truncate">Hash: {selectedOrder.checksum}</div>
              </div>
            </div>

            {/* Items Table */}
            <div>
              <div className="text-xs font-bold text-slate-800 mb-2">Requested Commodity Items</div>
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Item Name</th>
                    <th className="py-2 px-3 text-center">Unit / Qty</th>
                    <th className="py-2 px-3 text-right">Unit Price</th>
                    <th className="py-2 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {selectedOrder.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3 font-sans font-semibold text-slate-800">{item.name}</td>
                      <td className="py-2 px-3 text-center">
                        {item.quantity_requested} {item.unit}
                      </td>
                      <td className="py-2 px-3 text-right">ETB {item.unit_price.toLocaleString()}</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">
                        ETB {item.total_price.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer Total */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-200 font-mono text-base font-bold">
              <span>Total Value:</span>
              <span className="text-emerald-700 text-lg">ETB {selectedOrder.total_amount.toLocaleString()}</span>
            </div>

            {/* Print & Action Controls */}
            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                Print Consignment Slip
              </button>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
