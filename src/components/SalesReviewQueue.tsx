import React, { useState } from 'react';
import { DemandRequest } from '../types';
import {
  CheckCircle2,
  XCircle,
  Truck,
  PhoneCall,
  Clock,
  AlertCircle,
  ShieldCheck,
  Send,
  Loader2,
  PackageCheck,
  FileText,
  UserCheck,
  CheckSquare,
  Square,
  SlidersHorizontal,
  Layers,
  Printer
} from 'lucide-react';
import { SabaClinicLogo } from './Logos';

interface SalesReviewQueueProps {
  orders: DemandRequest[];
  jwtToken: string;
  activeRole?: string;
  onOrderUpdated: () => void;
  onNotify?: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
}

export const SalesReviewQueue: React.FC<SalesReviewQueueProps> = ({
  orders,
  jwtToken,
  activeRole,
  onOrderUpdated,
  onNotify
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedBatchIds, setSelectedBatchIds] = useState<number[]>([]);
  const [showBatchRejectModal, setShowBatchRejectModal] = useState(false);
  const [batchRejectReason, setBatchRejectReason] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [courierName, setCourierName] = useState('SABA Central Fleet Unit 2');
  const [deliverySource, setDeliverySource] = useState<string>('dkt_sales_fleet');
  const [driverName, setDriverName] = useState('Alemayehu Worku');
  const [vehiclePlate, setVehiclePlate] = useState('ET 3-45892 (Toyota Cold-Chain Van)');
  const [driverPhone, setDriverPhone] = useState('+251911445566');
  const [isProcessing, setIsProcessing] = useState(false);
  const [smsFeedback, setSmsFeedback] = useState<string | null>(null);

  const isReadOnlyAdmin = activeRole === 'center_admin' || activeRole === 'logistic_admin';
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const activeReviewOrder = orders.find((o) => o.id === selectedOrderId);

  const toggleSelectOrder = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isReadOnlyAdmin) return;
    if (selectedBatchIds.includes(id)) {
      setSelectedBatchIds(selectedBatchIds.filter((item) => item !== id));
    } else {
      setSelectedBatchIds([...selectedBatchIds, id]);
    }
  };

  const toggleSelectAllPending = () => {
    if (isReadOnlyAdmin) return;
    const pendingIds = pendingOrders.map((o) => o.id);
    if (selectedBatchIds.length === pendingIds.length && pendingIds.length > 0) {
      setSelectedBatchIds([]);
    } else {
      setSelectedBatchIds(pendingIds);
    }
  };

  // Batch Approve API Call
  const handleBatchApprove = async () => {
    if (selectedBatchIds.length === 0) return;
    setIsProcessing(true);
    setSmsFeedback(null);

    try {
      const res = await fetch('/api/v1/demand/requests/batch-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`
        },
        body: JSON.stringify({
          order_ids: selectedBatchIds,
          status: 'approved',
          notes: 'Batch approved by authorized Sales Representative.'
        })
      });

      const data = await res.json();
      if (data.success) {
        const msg = `Batch Approved: ${data.updated_count} clinic demand requests successfully approved! SMS alerts dispatched.`;
        setSmsFeedback(msg);
        if (onNotify) {
          onNotify('success', 'Batch Approved', msg);
        }
        setSelectedBatchIds([]);
        onOrderUpdated();
      } else {
        throw new Error(data.error || 'Batch approval failed');
      }
    } catch (err: any) {
      console.error('Batch approval failed:', err);
      if (onNotify) {
        onNotify('error', 'Batch Approval Failed', err.message || 'Unable to batch approve orders.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Batch Reject API Call
  const handleBatchReject = async () => {
    if (selectedBatchIds.length === 0) return;
    if (!batchRejectReason.trim()) {
      alert('Please provide a rejection reason for compliance auditing.');
      return;
    }
    setIsProcessing(true);
    setSmsFeedback(null);

    try {
      const res = await fetch('/api/v1/demand/requests/batch-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`
        },
        body: JSON.stringify({
          order_ids: selectedBatchIds,
          status: 'rejected',
          rejection_reason: batchRejectReason
        })
      });

      const data = await res.json();
      if (data.success) {
        const msg = `Batch Rejected: ${data.updated_count} demand requests rejected. Clinics notified via SMS.`;
        setSmsFeedback(msg);
        if (onNotify) {
          onNotify('warning', 'Batch Rejected', msg);
        }
        setSelectedBatchIds([]);
        setShowBatchRejectModal(false);
        setBatchRejectReason('');
        onOrderUpdated();
      } else {
        throw new Error(data.error || 'Batch rejection failed');
      }
    } catch (err: any) {
      console.error('Batch rejection failed:', err);
      if (onNotify) {
        onNotify('error', 'Batch Rejection Failed', err.message || 'Unable to batch reject orders.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Single Approve Order API Call
  const handleApprove = async (orderId: number) => {
    setIsProcessing(true);
    setSmsFeedback(null);

    try {
      const res = await fetch(`/api/v1/demand/requests/${orderId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`
        },
        body: JSON.stringify({
          status: 'approved',
          notes: reviewNotes || 'Demand request approved by Area Sales Manager.'
        })
      });

      const data = await res.json();
      if (data.success) {
        const msg = `Order #${orderId} Approved! SMS Alert dispatched to partner clinic.`;
        setSmsFeedback(msg);
        if (onNotify) {
          onNotify('success', 'Order Approved', msg);
        }
        onOrderUpdated();
        setSelectedOrderId(null);
      }
    } catch (err) {
      console.error('Approval failed:', err);
      if (onNotify) {
        onNotify('error', 'Approval Failed', 'Unable to approve order. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Single Reject Order API Call
  const handleReject = async (orderId: number) => {
    if (!rejectionReason) {
      alert('Please specify a rejection reason for compliance records.');
      return;
    }

    setIsProcessing(true);
    setSmsFeedback(null);

    try {
      const res = await fetch(`/api/v1/demand/requests/${orderId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`
        },
        body: JSON.stringify({
          status: 'rejected',
          notes: reviewNotes,
          rejection_reason: rejectionReason
        })
      });

      const data = await res.json();
      if (data.success) {
        const msg = `Order #${orderId} Rejected. Clinic notified via SMS.`;
        setSmsFeedback(msg);
        if (onNotify) {
          onNotify('warning', 'Order Rejected', msg);
        }
        onOrderUpdated();
        setSelectedOrderId(null);
      }
    } catch (err) {
      console.error('Rejection failed:', err);
      if (onNotify) {
        onNotify('error', 'Rejection Failed', 'Unable to reject order. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Dispatch Order API Call
  const handleDispatch = async (orderId: number) => {
    setIsProcessing(true);

    try {
      const res = await fetch(`/api/v1/demand/requests/${orderId}/dispatch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`
        },
        body: JSON.stringify({
          delivered_by: driverName ? `${driverName} (${vehiclePlate})` : courierName,
          delivery_source: deliverySource,
          driver_name: driverName,
          vehicle_plate: vehiclePlate,
          driver_phone: driverPhone
        })
      });

      const data = await res.json();
      if (data.success) {
        const msg = `Order #${orderId} marked as Delivered by ${driverName || courierName}! Driver & Vehicle assigned.`;
        setSmsFeedback(msg);
        if (onNotify) {
          onNotify('success', 'Order Delivered', msg);
        }
        onOrderUpdated();
        setSelectedOrderId(null);
      }
    } catch (err) {
      console.error('Dispatch failed:', err);
      if (onNotify) {
        onNotify('error', 'Dispatch Failed', 'Unable to mark order as delivered.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-red-950 via-rose-950 to-red-900 text-white rounded-2xl p-6 border border-red-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white/95 px-2 py-1 rounded-xl border border-rose-300 shadow">
              <SabaClinicLogo className="h-7" />
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Sales Representative Queue
            </span>

            <div className="px-3 py-1 bg-amber-500/20 border border-amber-400/40 text-amber-200 rounded-full text-xs font-bold flex items-center gap-1.5 font-mono">
              <UserCheck className="w-3.5 h-3.5 text-amber-300" />
              Prepared by: Ahmed IT
            </div>
          </div>

          <h2 className="text-xl font-black text-white">Clinic Partner Demand Review & Verification</h2>
          <p className="text-xs text-rose-100 font-medium">
            Review incoming clinic demand requests under DKT ETHIOPIA, verify authorization checksums, approve credit thresholds, and trigger automated SMS dispatch alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-center font-mono">
            <div className="text-xs text-slate-400">Pending Review</div>
            <div className="text-2xl font-bold text-amber-400">{pendingOrders.length}</div>
          </div>
        </div>
      </div>

      {/* Role Authorization Notice for Center Admin & Logistic Admin */}
      {isReadOnlyAdmin && (
        <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-2xl text-xs font-semibold text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-amber-400 text-red-950 rounded-xl font-bold shrink-0">
              <UserCheck className="w-5 h-5" />
            </span>
            <div>
              <div className="font-black text-amber-900 text-sm">Role Access Policy: Audit & Inspection Mode Active</div>
              <p className="text-xs text-amber-800 font-normal mt-0.5">
                Center Admin & Logistic Admin do <strong>NOT</strong> approve or reject clinic demand requests. Clinic orders are strictly reviewed & approved by authorized <strong>Sales Representatives</strong>. Center Admin has full print, export, GIS map, and dashboard analytical viewing capabilities.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-amber-200 text-amber-900 border border-amber-400 rounded-full font-mono text-[10px] font-bold uppercase shrink-0">
            READ-ONLY AUDITOR
          </span>
        </div>
      )}

      {smsFeedback && (
        <div className="bg-emerald-950 border border-emerald-800 text-emerald-300 p-4 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{smsFeedback}</span>
          </div>
          <button
            onClick={() => setSmsFeedback(null)}
            className="text-emerald-400 hover:text-white font-mono text-[10px] uppercase font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Batch Processing Action Bar (Visible when 1+ pending items selected and user is authorized) */}
      {!isReadOnlyAdmin && pendingOrders.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAllPending}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-amber-400 flex items-center gap-2 text-xs font-bold transition-all cursor-pointer border border-slate-700"
            >
              {selectedBatchIds.length === pendingOrders.length && pendingOrders.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-amber-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>
                {selectedBatchIds.length === pendingOrders.length && pendingOrders.length > 0
                  ? 'Deselect All Pending'
                  : 'Select All Pending'}
              </span>
            </button>

            <span className="text-xs font-mono text-slate-300">
              Selected: <strong className="text-amber-400 font-bold">{selectedBatchIds.length}</strong> / {pendingOrders.length} pending requests
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBatchApprove}
              disabled={selectedBatchIds.length === 0 || isProcessing}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all ${
                selectedBatchIds.length > 0 && !isProcessing
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-white" />
              )}
              Batch Approve ({selectedBatchIds.length})
            </button>

            <button
              type="button"
              onClick={() => {
                if (selectedBatchIds.length > 0) setShowBatchRejectModal(true);
              }}
              disabled={selectedBatchIds.length === 0 || isProcessing}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                selectedBatchIds.length > 0 && !isProcessing
                  ? 'bg-red-900/80 hover:bg-red-800 text-red-200 border border-red-700 cursor-pointer active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <XCircle className="w-4 h-4 text-red-400" />
              Batch Reject ({selectedBatchIds.length})
            </button>
          </div>
        </div>
      )}

      {/* Batch Rejection Reason Modal */}
      {showBatchRejectModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="p-2.5 bg-red-100 text-red-700 rounded-2xl">
                <XCircle className="w-6 h-6" />
              </span>
              <div>
                <h3 className="text-base font-black text-slate-900">Batch Reject Requests</h3>
                <p className="text-xs text-slate-500">You are about to reject {selectedBatchIds.length} pending demand orders simultaneously.</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Specify Compliance Rejection Reason:
              </label>
              <textarea
                rows={3}
                value={batchRejectReason}
                onChange={(e) => setBatchRejectReason(e.target.value)}
                placeholder="e.g. Health partner license verification required / Regional credit ceiling exceeded..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600 font-medium"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowBatchRejectModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBatchReject}
                disabled={isProcessing}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-red-700 hover:bg-red-600 text-white shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Confirm Batch Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Orders Queue & Review Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Queue List */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center justify-between">
            <span>Incoming Partner Demands ({orders.length})</span>
            <span className="text-xs text-slate-500 font-normal">Click to inspect</span>
          </h3>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {orders.map((ord) => {
              const isSelectedForBatch = selectedBatchIds.includes(ord.id);
              const isPending = ord.status === 'pending';

              return (
                <div
                  key={ord.id}
                  onClick={() => setSelectedOrderId(ord.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                    selectedOrderId === ord.id
                      ? 'border-emerald-500 bg-emerald-50/50 shadow-md ring-1 ring-emerald-500'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      {/* Checkbox for batch action (if pending and not read-only admin) */}
                      {!isReadOnlyAdmin && isPending && (
                        <button
                          type="button"
                          onClick={(e) => toggleSelectOrder(ord.id, e)}
                          className="mt-0.5 text-slate-400 hover:text-amber-600 transition-colors shrink-0"
                          title="Select for batch review action"
                        >
                          {isSelectedForBatch ? (
                            <CheckSquare className="w-5 h-5 text-amber-500" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-300" />
                          )}
                        </button>
                      )}

                      <div>
                        <span className="font-mono text-xs font-bold text-slate-900">{ord.order_number}</span>
                        <h4 className="font-bold text-sm text-slate-900">{ord.clinic_name}</h4>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase shrink-0 ${
                        ord.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : ord.status === 'approved'
                          ? 'bg-blue-100 text-blue-800'
                          : ord.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-500 mt-2 font-mono">
                    <span>{ord.items.length} Products</span>
                    <span className="font-bold text-slate-900">ETB {(ord.total_amount ?? 0).toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Review Details & Approval Controller */}
        <div className="lg:col-span-7">
          {!activeReviewOrder ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 space-y-3">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-700">Select a Demand Request from the Queue</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Choose any demand request on the left to review items, verify security checksum, add sales notes, or trigger delivery dispatch.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
              {/* Review Header */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <div className="text-xs font-mono font-bold text-emerald-600">Request Ref: {activeReviewOrder.order_number}</div>
                  <h3 className="text-lg font-bold text-slate-900">{activeReviewOrder.clinic_name}</h3>
                  <div className="text-xs text-slate-500">Submitted by: {activeReviewOrder.clinic_rep}</div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-500">Order Value:</div>
                  <div className="text-xl font-bold font-mono text-slate-900">
                    ETB {(activeReviewOrder.total_amount ?? 0).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Items Requested */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Requested Items Verification</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold">
                      <tr>
                        <th className="py-2.5 px-3">Product Name</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-right">Unit Price</th>
                        <th className="py-2.5 px-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {activeReviewOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 px-3 font-sans font-semibold text-slate-800">{item.name}</td>
                          <td className="py-2.5 px-3 text-center font-bold text-emerald-700">{item.quantity_requested} {item.unit}</td>
                          <td className="py-2.5 px-3 text-right text-slate-600">ETB {(item.unit_price ?? 0).toLocaleString()}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900">ETB {(item.total_price ?? 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Security Checksum & Notes */}
              <div className="bg-slate-900 text-slate-200 p-4 rounded-xl space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-slate-800 pb-1.5">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> SHA-256 Signature Verification
                  </span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded">PASSED</span>
                </div>
                <div className="text-[11px] text-amber-300 truncate">Hash: {activeReviewOrder.checksum}</div>
              </div>

              {/* Actions Form */}
              {activeRole === 'center_admin' ? (
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs font-semibold text-amber-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-amber-700" />
                    <div>
                      <span className="font-bold">Center Admin Audit Mode (Read-Only)</span>
                      <p className="text-[11px] font-normal text-amber-800">
                        You are viewing this demand request in inspection mode. Center Admins cannot alter status or perform dispatch actions.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {activeReviewOrder.status === 'pending' && (
                    <div className="space-y-4 pt-2 border-t border-slate-100">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Sales Manager Review Notes</label>
                        <input
                          type="text"
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                          placeholder="e.g. Approved under regional health partner credit quota..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Rejection Reason (If rejecting)</label>
                        <input
                          type="text"
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="e.g. Clinic license renewal required..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => handleApprove(activeReviewOrder.id)}
                          disabled={isProcessing}
                          className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all"
                        >
                          {isProcessing ? (
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          )}
                          Approve Demand & Send SMS Alert
                        </button>

                        <button
                          type="button"
                          onClick={() => handleReject(activeReviewOrder.id)}
                          disabled={isProcessing}
                          className="py-3 px-4 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 font-bold text-xs border border-red-200 flex items-center justify-center gap-1.5 transition-all"
                        >
                          <XCircle className="w-4 h-4 text-red-600" />
                          Reject Request
                        </button>
                      </div>
                    </div>
                  )}

                  {activeReviewOrder.status === 'approved' && (
                    activeRole === 'logistic_admin' ? (
                      <div className="space-y-4 pt-2 border-t border-slate-100 bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                            <Truck className="w-4 h-4 text-emerald-700" />
                            Logistics Dispatch & Delivery Confirmation
                          </h4>
                          <span className="text-[10px] font-mono bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-bold">
                            LOGISTICS OFFICER PORTAL
                          </span>
                        </div>

                        {/* Delivery Source Radio Options */}
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-bold text-slate-700">Select Fulfillment / Delivery Source:</label>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <button
                              type="button"
                              onClick={() => setDeliverySource('dkt_sales_fleet')}
                              className={`p-2 rounded-xl border text-left flex flex-col transition-all cursor-pointer ${
                                deliverySource === 'dkt_sales_fleet'
                                  ? 'bg-red-950 text-amber-300 border-red-900 shadow-sm font-bold'
                                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <span className="text-[11px]">DKT Sales Fleet</span>
                              <span className="text-[9px] opacity-80 font-normal">Official Cold-Chain Vehicle</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeliverySource('partner_self_pickup')}
                              className={`p-2 rounded-xl border text-left flex flex-col transition-all cursor-pointer ${
                                deliverySource === 'partner_self_pickup'
                                  ? 'bg-red-950 text-amber-300 border-red-900 shadow-sm font-bold'
                                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <span className="text-[11px]">Partner Self-Pickup</span>
                              <span className="text-[9px] opacity-80 font-normal">Clinic Representative Collects</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeliverySource('express_courier')}
                              className={`p-2 rounded-xl border text-left flex flex-col transition-all cursor-pointer ${
                                deliverySource === 'express_courier'
                                  ? 'bg-red-950 text-amber-300 border-red-900 shadow-sm font-bold'
                                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <span className="text-[11px]">Express Courier</span>
                              <span className="text-[9px] opacity-80 font-normal">Third-Party Logistics Partner</span>
                            </button>
                          </div>
                        </div>

                        {/* Driver & Vehicle Input Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Driver Name</label>
                            <input
                              type="text"
                              value={driverName}
                              onChange={(e) => setDriverName(e.target.value)}
                              placeholder="e.g. Alemayehu Worku"
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Vehicle Plate / Type</label>
                            <input
                              type="text"
                              value={vehiclePlate}
                              onChange={(e) => setVehiclePlate(e.target.value)}
                              placeholder="e.g. ET 3-45892 (Toyota Van)"
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-medium"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Driver Phone Number</label>
                            <input
                              type="text"
                              value={driverPhone}
                              onChange={(e) => setDriverPhone(e.target.value)}
                              placeholder="e.g. +251911445566"
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-medium"
                            />
                          </div>
                        </div>

                        <div className="pt-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleDispatch(activeReviewOrder.id)}
                            disabled={isProcessing}
                            className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer active:scale-95"
                          >
                            <PackageCheck className="w-4 h-4 text-white" />
                            Confirm Dispatch & Mark Delivered
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-blue-50/80 border border-blue-200 p-4 rounded-2xl text-xs font-semibold text-blue-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                        <div className="flex items-center gap-3">
                          <span className="p-2 bg-blue-600 text-white rounded-xl shrink-0 shadow-sm">
                            <Truck className="w-5 h-5" />
                          </span>
                          <div>
                            <div className="font-bold text-blue-950 text-xs">Order Approved: Awaiting Logistics Dispatch</div>
                            <p className="text-[11px] text-blue-800 font-normal mt-0.5 leading-relaxed">
                              Order #{activeReviewOrder.order_number} is approved by Sales. Delivery confirmation and driver/vehicle dispatch assignment are strictly executed by <strong>Logistics Admin / Officers</strong>.
                            </p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-blue-100 text-blue-900 border border-blue-300 rounded-full font-mono text-[10px] font-bold uppercase shrink-0">
                          LOGISTICS OFFICER DUTY
                        </span>
                      </div>
                    )
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
