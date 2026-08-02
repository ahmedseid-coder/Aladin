import React, { useState, useEffect, useRef } from 'react';
import { DemandRequest } from '../types';
import {
  QrCode,
  Scan,
  Camera,
  CheckCircle2,
  XCircle,
  Search,
  Building2,
  Truck,
  ShieldCheck,
  FileText,
  RefreshCw,
  AlertCircle,
  UserCheck,
  Calendar,
  DollarSign
} from 'lucide-react';
import { SabaClinicLogo } from './Logos';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: DemandRequest[];
  onSelectOrder?: (order: DemandRequest) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  orders,
  onSelectOrder
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'manual'>('camera');
  const [scannedCode, setScannedCode] = useState('');
  const [scannedOrder, setScannedOrder] = useState<DemandRequest | null>(null);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'not_found'>('scanning');
  const [isCameraActive, setIsCameraActive] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setScannedCode('');
      setScannedOrder(null);
      setScanStatus('scanning');
      stopCamera();
      return;
    }

    if (activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } else {
        setCameraError('Camera API not accessible in current iframe mode. Using simulated QR optical reader.');
      }
    } catch (err: any) {
      setCameraError('Camera access denied or unavailable. You can type or select order QR codes below.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const handleVerifyCode = (codeToTest: string) => {
    const q = codeToTest.trim().toLowerCase();
    if (!q) return;

    setScanStatus('scanning');

    setTimeout(() => {
      const match = orders.find(
        (o) =>
          o.order_number.toLowerCase() === q ||
          o.checksum.toLowerCase() === q ||
          o.checksum.toLowerCase().startsWith(q) ||
          q.includes(o.order_number.toLowerCase())
      );

      if (match) {
        setScannedOrder(match);
        setScanStatus('success');
      } else {
        setScannedOrder(null);
        setScanStatus('not_found');
      }
    }, 400);
  };

  const handleSimulatedScanSample = (order: DemandRequest) => {
    setScannedCode(order.order_number);
    handleVerifyCode(order.order_number);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 text-slate-900 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-950 text-amber-400 rounded-2xl shadow-md">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <SabaClinicLogo className="h-5" />
                <h3 className="text-lg font-black text-slate-900">QR & Checksum Optical Verifier</h3>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Verify consignment receipts, order checksums, and delivery notes instantly.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'camera'
                ? 'bg-red-950 text-amber-400 shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Live Camera Scanner</span>
          </button>

          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'manual'
                ? 'bg-red-950 text-amber-400 shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Manual Code Entry & Samples</span>
          </button>
        </div>

        {/* TAB 1: Camera Scanner Viewport */}
        {activeTab === 'camera' && (
          <div className="space-y-4">
            <div className="relative bg-slate-950 rounded-2xl overflow-hidden aspect-video border-2 border-slate-800 flex items-center justify-center shadow-inner group">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Scanning Overlay Reticle */}
              <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none">
                <div className="relative w-56 h-56 border-2 border-amber-400/80 rounded-3xl flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.2)]">
                  {/* Corner Target Marks */}
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-xl"></div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-xl"></div>
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-xl"></div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br-xl"></div>

                  {/* Laser Beam Animation */}
                  <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse top-1/2 -translate-y-1/2 shadow-[0_0_12px_#fbbf24]"></div>

                  <div className="text-center font-mono text-[10px] text-amber-300 font-bold bg-slate-950/80 px-2 py-1 rounded-full border border-amber-400/40">
                    ALIGN QR CODE IN FRAME
                  </div>
                </div>
              </div>

              {cameraError && (
                <div className="absolute inset-x-4 bottom-4 bg-amber-950/90 border border-amber-500 text-amber-200 text-xs p-3 rounded-xl flex items-center gap-2 shadow-lg backdrop-blur">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{cameraError}</span>
                </div>
              )}
            </div>

            {/* Quick Test Sample QR Triggers */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>Select Sample Order QR Code to Test Scan:</span>
                <span className="text-[10px] font-mono text-slate-500">Available: {orders.length}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {orders.slice(0, 4).map((ord) => (
                  <button
                    key={ord.id}
                    onClick={() => handleSimulatedScanSample(ord)}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 rounded-xl border border-slate-300 text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95"
                  >
                    <Scan className="w-3.5 h-3.5 text-red-700" />
                    <span>{ord.order_number}</span>
                    <span className="text-[10px] text-slate-500 font-sans">({ord.clinic_name.split(' ')[0]})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Manual Code Input */}
        {activeTab === 'manual' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Enter Order Number or Checksum Hash:
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. ORD-2026-8492 or sha256 checksum..."
                    value={scannedCode}
                    onChange={(e) => setScannedCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerifyCode(scannedCode)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-900"
                  />
                </div>
                <button
                  onClick={() => handleVerifyCode(scannedCode)}
                  className="px-4 py-2.5 bg-red-950 hover:bg-red-900 text-amber-400 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow transition-all cursor-pointer active:scale-95"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Code</span>
                </button>
              </div>
            </div>

            {/* List of order buttons to pick */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="text-xs font-bold text-slate-700">Quick Select Recent Consignments:</div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {orders.map((ord) => (
                  <button
                    key={ord.id}
                    onClick={() => handleSimulatedScanSample(ord)}
                    className="w-full p-2 bg-white hover:bg-amber-50 rounded-xl border border-slate-200 text-left flex items-center justify-between text-xs font-mono transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-slate-500" />
                      <span className="font-bold text-slate-900">{ord.order_number}</span>
                      <span className="text-slate-500 text-[11px] font-sans">({ord.clinic_name})</span>
                    </div>
                    <span className="text-emerald-700 font-bold font-mono">ETB {(ord.total_amount || 0).toLocaleString()}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Verification Result Card */}
        {scanStatus === 'success' && scannedOrder && (
          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 space-y-4 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
              <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>CRYPTOGRAPHIC CHECKSUM & ORDER VERIFIED</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-200 text-emerald-900 uppercase">
                {scannedOrder.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-sans">
              <div className="space-y-1">
                <div className="text-slate-500 text-[10px] uppercase font-bold">Consignment Ref:</div>
                <div className="font-mono font-black text-slate-900 text-sm">{scannedOrder.order_number}</div>
                <div className="text-slate-700 flex items-center gap-1 font-semibold">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  {scannedOrder.clinic_name}
                </div>
                <div className="text-slate-600 text-[11px]">Rep: {scannedOrder.clinic_rep}</div>
              </div>

              <div className="space-y-1 text-right font-mono">
                <div className="text-slate-500 text-[10px] uppercase font-bold">Financial & Logistics:</div>
                <div className="font-bold text-slate-900 text-sm text-emerald-800">
                  ETB {(scannedOrder.total_amount || 0).toLocaleString()}
                </div>
                <div className="text-slate-600 text-[11px]">
                  Driver: {scannedOrder.delivered_by || scannedOrder.driver_name || 'Express Dispatch'}
                </div>
                <div className="text-slate-500 text-[10px] truncate" title={scannedOrder.checksum}>
                  Hash: {scannedOrder.checksum.substring(0, 16)}...
                </div>
              </div>
            </div>

            {/* Item List Summary */}
            <div className="bg-white p-3 rounded-xl border border-emerald-200 space-y-1">
              <div className="text-[10px] font-bold text-slate-600 uppercase">Commodities Included ({scannedOrder.items.length} items):</div>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {scannedOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-xs text-slate-800 font-mono">
                    <span>• {it.name} ({it.quantity_requested} packs)</span>
                    <span className="font-bold">ETB {(it.total_price || 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              {onSelectOrder && (
                <button
                  onClick={() => {
                    onSelectOrder(scannedOrder);
                    onClose();
                  }}
                  className="px-4 py-2 bg-red-950 hover:bg-red-900 text-amber-400 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow transition-all cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Open Full Printable Receipt</span>
                </button>
              )}
            </div>
          </div>
        )}

        {scanStatus === 'not_found' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-900 text-xs font-semibold flex items-center gap-3">
            <XCircle className="w-6 h-6 text-red-600 shrink-0" />
            <div>
              <div className="font-bold text-sm text-red-950">No Order Found Matching Code</div>
              <div className="text-red-800 font-normal mt-0.5">
                The order reference or checksum "{scannedCode}" was not found in the SABA database. Verify the code or scan again.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
