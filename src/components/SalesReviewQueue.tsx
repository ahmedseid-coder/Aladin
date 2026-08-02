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
  FileText
} from 'lucide-react';

interface SalesReviewQueueProps {
  orders: DemandRequest[];
  jwtToken: string;
  onOrderUpdated: () => void;
  onNotify?: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
}

export const SalesReviewQueue: React.FC<SalesReviewQueueProps> = ({
  orders,
  jwtToken,
  onOrderUpdated,
  onNotify
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [courierName, setCourierName] = useState('SABA Central Fleet Unit 2');
  const [isProcessing, setIsProcessing] = useState(false);
  const [smsFeedback, setSmsFeedback] = useState<string | null>(null);

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const activeReviewOrder = orders.find((o) => o.id === selectedOrderId);

  // Approve Order API Call
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

  // Reject Order API Call
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
          delivered_by: courierName
        })
      });

      const data = await res.json();
      if (data.success) {
        const msg = `Order #${orderId} marked as Delivered by ${courierName}!`;
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
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Sales Representative Queue
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-2">Clinic Partner Demand Review & Verification</h2>
          <p className="text-xs text-slate-300">
            Review incoming clinic demand requests, verify authorization checksums, approve credit thresholds, and trigger automated SMS dispatch alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-center font-mono">
            <div className="text-xs text-slate-400">Pending Review</div>
            <div className="text-2xl font-bold text-amber-400">{pendingOrders.length}</div>
          </div>
        </div>
      </div>

      {smsFeedback && (
        <div className="bg-emerald-950 border border-emerald-800 text-emerald-300 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          {smsFeedback}
        </div>
      )}

      {/* Main Grid: Orders Queue & Review Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Queue List */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center justify-between">
            <span>Incoming Partner Demands ({orders.length})</span>
            <span className="text-xs text-slate-500 font-normal">Click to review</span>
          </h3>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {orders.map((ord) => (
              <div
                key={ord.id}
                onClick={() => setSelectedOrderId(ord.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedOrderId === ord.id
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-md ring-1 ring-emerald-500'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-900">{ord.order_number}</span>
                    <h4 className="font-bold text-sm text-slate-900">{ord.clinic_name}</h4>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
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
                  <span className="font-bold text-slate-900">ETB {ord.total_amount.toLocaleString()}</span>
                </div>
              </div>
            ))}
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
                    ETB {activeReviewOrder.total_amount.toLocaleString()}
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
                          <td className="py-2.5 px-3 text-right text-slate-600">ETB {item.unit_price}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900">ETB {item.total_price.toLocaleString()}</td>
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
                <div className="space-y-3 pt-2 border-t border-slate-100 bg-emerald-50/60 p-4 rounded-xl border border-emerald-200">
                  <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-emerald-600" />
                    Dispatch Logistics Unit
                  </h4>

                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={courierName}
                      onChange={(e) => setCourierName(e.target.value)}
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Assign Courier / Driver..."
                    />

                    <button
                      type="button"
                      onClick={() => handleDispatch(activeReviewOrder.id)}
                      disabled={isProcessing}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-colors whitespace-nowrap"
                    >
                      <PackageCheck className="w-4 h-4 text-white" />
                      Mark Delivered
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
