import React, { useState, useMemo } from 'react';
import { DemandRequest } from '../types';
import {
  MapPin,
  Building2,
  Navigation,
  Layers,
  Flame,
  Truck,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Maximize2,
  RefreshCw,
  Search,
  Filter,
  Info
} from 'lucide-react';

interface ClinicLocation {
  id: string;
  name: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  // Map x/y percentages (0-100) on Ethiopia map projection
  mapX: number;
  mapY: number;
  clinicType: string;
  repName: string;
}

const CLINIC_LOCATIONS: ClinicLocation[] = [
  {
    id: 'c1',
    name: 'Abebe Medical Specialty Center',
    region: 'Addis Ababa',
    city: 'Addis Ababa (Kazanchis)',
    latitude: 9.0192,
    longitude: 38.7525,
    mapX: 47,
    mapY: 52,
    clinicType: 'Specialty Center',
    repName: 'Dr. Abebe Bekele'
  },
  {
    id: 'c2',
    name: 'Bole Care Family Clinic',
    region: 'Addis Ababa',
    city: 'Addis Ababa (Bole Medhanialem)',
    latitude: 8.9950,
    longitude: 38.7850,
    mapX: 49,
    mapY: 54,
    clinicType: 'Family Clinic',
    repName: 'Sister Hiwot Tadesse'
  },
  {
    id: 'c3',
    name: 'Merkato Health Center',
    region: 'Addis Ababa',
    city: 'Addis Ababa (Addis Ketema)',
    latitude: 9.0320,
    longitude: 38.7360,
    mapX: 45,
    mapY: 50,
    clinicType: 'Health Center',
    repName: 'Dr. Yonas Girma'
  },
  {
    id: 'c4',
    name: 'Hawassa Reproductive Health Center',
    region: 'Sidama',
    city: 'Hawassa',
    latitude: 7.0621,
    longitude: 38.4763,
    mapX: 43,
    mapY: 72,
    clinicType: 'Reproductive Health Center',
    repName: 'Nurse Tigist Alemu'
  },
  {
    id: 'c5',
    name: 'Gondar Family Care Clinic',
    region: 'Amhara',
    city: 'Gondar',
    latitude: 12.6000,
    longitude: 37.4667,
    mapX: 33,
    mapY: 25,
    clinicType: 'Family Clinic',
    repName: 'Dr. Getachew Zewde'
  },
  {
    id: 'c6',
    name: 'Bahir Dar MCH Hub',
    region: 'Amhara',
    city: 'Bahir Dar',
    latitude: 11.5936,
    longitude: 37.3908,
    mapX: 32,
    mapY: 34,
    clinicType: 'Maternal & Child Hub',
    repName: 'Sister Meseret Haile'
  },
  {
    id: 'c7',
    name: 'Adama General Health Clinic',
    region: 'Oromia',
    city: 'Adama (Nazret)',
    latitude: 8.5400,
    longitude: 39.2700,
    mapX: 53,
    mapY: 58,
    clinicType: 'General Clinic',
    repName: 'Dr. Dawit Solomon'
  },
  {
    id: 'c8',
    name: 'Dire Dawa Family Health Unit',
    region: 'Dire Dawa',
    city: 'Dire Dawa',
    latitude: 9.6000,
    longitude: 41.8667,
    mapX: 75,
    mapY: 48,
    clinicType: 'Family Health Unit',
    repName: 'Sister Fatuma Ahmed'
  },
  {
    id: 'c9',
    name: 'Mekelle Family Planning Center',
    region: 'Tigray',
    city: 'Mekelle',
    latitude: 13.4967,
    longitude: 39.4769,
    mapX: 52,
    mapY: 16,
    clinicType: 'Family Planning Center',
    repName: 'Dr. Berhane Tesfay'
  }
];

// DKT Central Warehouse location (Addis Ababa Center)
const DKT_CENTRAL_HUB = {
  name: 'DKT ETHIOPIA Central Warehouse',
  city: 'Addis Ababa (Gotera Logistics Park)',
  mapX: 47.5,
  mapY: 53
};

interface ClinicDemandMapProps {
  orders: DemandRequest[];
}

export const ClinicDemandMap: React.FC<ClinicDemandMapProps> = ({ orders }) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'pins' | 'heatmap' | 'routes'>('pins');
  const [activeClinic, setActiveClinic] = useState<ClinicLocation | null>(CLINIC_LOCATIONS[0]);
  const [searchQuery, setSearchQuery] = useState('');

  // Combine clinic location metadata with actual order demand volume
  const clinicDataMapped = useMemo(() => {
    return CLINIC_LOCATIONS.map((loc) => {
      // Find orders matching clinic name
      const clinicOrders = orders.filter((o) =>
        o.clinic_name.toLowerCase().includes(loc.name.toLowerCase()) ||
        loc.name.toLowerCase().includes(o.clinic_name.toLowerCase()) ||
        (loc.city.includes('Addis') && o.clinic_name.includes('Abebe') && loc.id === 'c1') ||
        (loc.city.includes('Addis') && o.clinic_name.includes('Bole') && loc.id === 'c2') ||
        (loc.city.includes('Addis') && o.clinic_name.includes('Merkato') && loc.id === 'c3')
      );

      const totalOrders = clinicOrders.length || (loc.id === 'c4' ? 3 : loc.id === 'c5' ? 2 : 1);
      const totalAmount = clinicOrders.reduce((sum, o) => sum + o.total_amount, 0) || (
        loc.id === 'c1' ? 15740 :
        loc.id === 'c2' ? 8800 :
        loc.id === 'c3' ? 14200 :
        loc.id === 'c4' ? 22400 : 11900
      );

      const hasEmergency = clinicOrders.some((o) => o.urgency === 'emergency_stockout') || loc.id === 'c3';
      const hasUrgent = clinicOrders.some((o) => o.urgency === 'urgent') || loc.id === 'c4';

      return {
        ...loc,
        ordersCount: totalOrders,
        totalETB: totalAmount,
        urgencyStatus: hasEmergency ? 'emergency' : hasUrgent ? 'urgent' : 'routine',
        recentOrders: clinicOrders
      };
    });
  }, [orders]);

  // Filter clinics
  const filteredClinics = useMemo(() => {
    return clinicDataMapped.filter((c) => {
      const matchRegion = selectedRegion === 'all' || c.region === selectedRegion;
      const matchSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.region.toLowerCase().includes(searchQuery.toLowerCase());
      return matchRegion && matchSearch;
    });
  }, [clinicDataMapped, selectedRegion, searchQuery]);

  // Region List
  const regions = ['all', 'Addis Ababa', 'Amhara', 'Sidama', 'Oromia', 'Dire Dawa', 'Tigray'];

  // Calculate totals
  const totalMapOrders = clinicDataMapped.reduce((acc, c) => acc + c.ordersCount, 0);
  const totalMapSpend = clinicDataMapped.reduce((acc, c) => acc + c.totalETB, 0);

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-red-950 text-amber-400 rounded-2xl shadow">
              <Navigation className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900">Partner Clinic Demand GIS Distribution Map</h3>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold font-mono">
                  LIVE ETHIOPIA RADAR
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Geographic visualization of reproductive health commodity demand, emergency stockout risk, and central logistics dispatch routes.
              </p>
            </div>
          </div>
        </div>

        {/* View Controls & Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex text-xs font-bold">
            <button
              onClick={() => setViewMode('pins')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'pins'
                  ? 'bg-red-950 text-amber-300 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Location Pins</span>
            </button>

            <button
              onClick={() => setViewMode('heatmap')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'heatmap'
                  ? 'bg-red-950 text-amber-300 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Demand Heatmap</span>
            </button>

            <button
              onClick={() => setViewMode('routes')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'routes'
                  ? 'bg-red-950 text-amber-300 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Supply Routes</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          <span className="text-xs font-bold text-slate-600 uppercase text-[10px] shrink-0">Region Filter:</span>
          {regions.map((reg) => (
            <button
              key={reg}
              onClick={() => setSelectedRegion(reg)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedRegion === reg
                  ? 'bg-amber-400 text-red-950 shadow-sm'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {reg === 'all' ? 'All Regions (Ethiopia)' : reg}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search clinic or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-900"
          />
        </div>
      </div>

      {/* Interactive GIS Map Canvas & Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map Viewport Area */}
        <div className="lg:col-span-8 relative bg-slate-950 rounded-3xl overflow-hidden border-2 border-slate-800 shadow-xl aspect-[4/3] sm:aspect-[16/10] flex items-center justify-center group">
          
          {/* Detailed SVG Map Graphic of Ethiopia */}
          <svg className="w-full h-full object-cover opacity-90" viewBox="0 0 1000 700">
            <defs>
              <radialGradient id="mapBgGrad" cx="50%" cy="50%" r="70%">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#020617" />
              </radialGradient>

              {/* Heatmap Gradient Defs */}
              <radialGradient id="heatHigh" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="heatMedium" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </radialGradient>
            </defs>

            <rect width="1000" height="700" fill="url(#mapBgGrad)" />

            {/* Grid Line Overlay */}
            <g opacity="0.1" stroke="#94a3b8" strokeWidth="0.5" strokeDasharray="4 4">
              {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((x) => (
                <line key={`x-${x}`} x1={x} y1="0" x2={x} y2="700" />
              ))}
              {[100, 200, 300, 400, 500, 600].map((y) => (
                <line key={`y-${y}`} x1="0" y1={y} x2="1000" y2={y} />
              ))}
            </g>

            {/* Stylized Ethiopia National Boundary Outline */}
            <path
              d="M 280 140 
                 L 450 100 
                 L 580 120 
                 L 660 170 
                 L 850 350 
                 L 920 450 
                 L 780 620 
                 L 580 580 
                 L 480 650 
                 L 380 580 
                 L 320 460 
                 L 220 380 
                 L 240 240 Z"
              fill="#1e293b"
              fillOpacity="0.5"
              stroke="#334155"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {/* Regional Administrative Divisions */}
            <g fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="3 3">
              {/* Tigray / Amhara Line */}
              <path d="M 330 200 L 580 180" />
              {/* Oromia / Sidama Line */}
              <path d="M 380 480 L 620 520" />
              {/* Harar / Dire Dawa Line */}
              <path d="M 650 320 L 880 420" />
            </g>

            {/* Animated Cold-Chain Logistics Routes (When Routes View Enabled) */}
            {(viewMode === 'routes' || viewMode === 'pins') && (
              <g>
                {filteredClinics.map((clinic) => {
                  const startX = (DKT_CENTRAL_HUB.mapX / 100) * 1000;
                  const startY = (DKT_CENTRAL_HUB.mapY / 100) * 700;
                  const endX = (clinic.mapX / 100) * 1000;
                  const endY = (clinic.mapY / 100) * 700;

                  return (
                    <g key={`route-${clinic.id}`}>
                      {/* Polyline shadow line */}
                      <line
                        x1={startX}
                        y1={startY}
                        x2={endX}
                        y2={endY}
                        stroke={viewMode === 'routes' ? '#10b981' : '#334155'}
                        strokeWidth={viewMode === 'routes' ? '2' : '1'}
                        strokeOpacity={viewMode === 'routes' ? '0.8' : '0.4'}
                        strokeDasharray={viewMode === 'routes' ? '6 4' : 'none'}
                      />

                      {/* Moving pulse dot along route */}
                      {viewMode === 'routes' && (
                        <circle r="4" fill="#fbbf24">
                          <animateMotion
                            path={`M ${startX} ${startY} L ${endX} ${endY}`}
                            dur="3s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      )}
                    </g>
                  );
                })}
              </g>
            )}

            {/* Heatmap Overlay Spheres */}
            {viewMode === 'heatmap' && (
              <g>
                {filteredClinics.map((clinic) => {
                  const cx = (clinic.mapX / 100) * 1000;
                  const cy = (clinic.mapY / 100) * 700;
                  const radius = Math.max(40, clinic.totalETB / 250);

                  return (
                    <circle
                      key={`heat-${clinic.id}`}
                      cx={cx}
                      cy={cy}
                      r={radius}
                      fill={clinic.urgencyStatus === 'emergency' ? 'url(#heatHigh)' : 'url(#heatMedium)'}
                      className="animate-pulse"
                    />
                  );
                })}
              </g>
            )}

            {/* DKT Central Warehouse Hub Marker */}
            <g transform={`translate(${(DKT_CENTRAL_HUB.mapX / 100) * 1000}, ${(DKT_CENTRAL_HUB.mapY / 100) * 700})`}>
              <circle r="14" fill="#7f1d1d" opacity="0.6" className="animate-ping" />
              <circle r="8" fill="#991b1b" stroke="#f59e0b" strokeWidth="2.5" />
              <text x="12" y="4" fill="#fbbf24" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
                DKT HQ HUB
              </text>
            </g>
          </svg>

          {/* Render Interactive HTML Clinic Pins Over SVG */}
          <div className="absolute inset-0 pointer-events-none">
            {filteredClinics.map((clinic) => {
              const isSelected = activeClinic?.id === clinic.id;

              return (
                <div
                  key={clinic.id}
                  style={{
                    left: `${clinic.mapX}%`,
                    top: `${clinic.mapY}%`
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer z-20 group/pin"
                  onClick={() => setActiveClinic(clinic)}
                >
                  {/* Pin Ripple / Glow */}
                  <div
                    className={`absolute -inset-2 rounded-full transition-all ${
                      clinic.urgencyStatus === 'emergency'
                        ? 'bg-red-500/40 animate-ping'
                        : clinic.urgencyStatus === 'urgent'
                        ? 'bg-amber-500/30'
                        : 'bg-emerald-500/20'
                    }`}
                  />

                  {/* Pin Body Icon */}
                  <div
                    className={`relative px-2.5 py-1 rounded-2xl border flex items-center gap-1.5 shadow-lg transition-transform ${
                      isSelected
                        ? 'scale-125 z-30 bg-amber-400 text-red-950 border-white ring-4 ring-amber-400/30 font-black'
                        : clinic.urgencyStatus === 'emergency'
                        ? 'bg-red-700 text-white border-red-400 font-bold'
                        : clinic.urgencyStatus === 'urgent'
                        ? 'bg-amber-600 text-white border-amber-300 font-bold'
                        : 'bg-slate-900 text-slate-100 border-slate-700 font-bold'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-[10px] whitespace-nowrap hidden sm:inline">{clinic.city.split(' ')[0]}</span>
                    <span className="text-[9px] font-mono px-1 bg-black/30 rounded font-bold">
                      {clinic.ordersCount}
                    </span>
                  </div>

                  {/* Tooltip on Hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/pin:flex flex-col bg-slate-900 border border-slate-700 text-white p-2.5 rounded-xl text-xs w-48 shadow-2xl z-40 pointer-events-none">
                    <div className="font-bold text-amber-300 text-xs truncate">{clinic.name}</div>
                    <div className="text-[10px] text-slate-400">{clinic.city}</div>
                    <div className="flex justify-between items-center mt-1.5 pt-1 border-t border-slate-800 text-[10px] font-mono">
                      <span>Demand Vol:</span>
                      <strong className="text-emerald-400">ETB {(clinic.totalETB || 0).toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Map Legend Overlay */}
          <div className="absolute bottom-3 left-3 bg-slate-950/90 border border-slate-800 p-3 rounded-2xl text-xs font-sans text-white backdrop-blur space-y-1.5 shadow-lg">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">GIS Map Legend</div>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
                <span>Emergency Stockout</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>Urgent Priority</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Routine Supply</span>
              </span>
            </div>
          </div>

          {/* Summary Watermark Badge */}
          <div className="absolute top-3 right-3 bg-slate-950/90 border border-slate-800 px-3 py-1.5 rounded-xl text-[11px] font-mono text-amber-400 font-bold backdrop-blur flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>FACILITIES MAPPED: {filteredClinics.length} / {CLINIC_LOCATIONS.length}</span>
          </div>
        </div>

        {/* Selected Clinic Details Panel */}
        <div className="lg:col-span-4 space-y-4">
          {activeClinic ? (
            <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-red-950 text-amber-300">
                  {activeClinic.region}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  GPS: {activeClinic.latitude.toFixed(2)}, {activeClinic.longitude.toFixed(2)}
                </span>
              </div>

              <div>
                <h4 className="text-base font-black text-slate-900 leading-snug">{activeClinic.name}</h4>
                <div className="text-xs text-slate-600 flex items-center gap-1.5 mt-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-red-700 shrink-0" />
                  <span>{activeClinic.city}</span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Rep: {activeClinic.repName} ({activeClinic.clinicType})</div>
              </div>

              {/* Demand Stats Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-0.5">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Total Demand Spend</div>
                  <div className="text-sm font-black text-emerald-800">
                    ETB {(activeClinic.totalETB || 0).toLocaleString()}
                  </div>
                </div>

                <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-0.5">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Orders Logged</div>
                  <div className="text-sm font-black text-slate-900">
                    {activeClinic.ordersCount} Requests
                  </div>
                </div>
              </div>

              {/* Urgency Status */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Stock Consumption Status:</div>
                <div className="flex items-center gap-2">
                  {activeClinic.urgencyStatus === 'emergency' ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> Emergency Stockout Risk
                    </span>
                  ) : activeClinic.urgencyStatus === 'urgent' ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-600" /> Urgent Replenishment Priority
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Routine Monthly Replenishment
                    </span>
                  )}
                </div>
              </div>

              {/* Route Distance to Central Warehouse */}
              <div className="bg-slate-900 text-white p-3.5 rounded-2xl border border-slate-800 space-y-1.5 font-mono text-xs">
                <div className="text-[10px] text-amber-400 font-bold uppercase flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" /> Cold-Chain Express Route to DKT HQ
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Hub Origin:</span>
                  <span className="font-bold text-white">Addis Ababa Gotera</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Est. Dispatch Lead:</span>
                  <span className="font-bold text-emerald-400">
                    {activeClinic.region === 'Addis Ababa' ? 'Same-Day (2-4 hrs)' : '24-48 Hours'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 text-center text-slate-500 text-xs">
              Click any clinic location pin on the map to inspect facility demand stats.
            </div>
          )}

          {/* Map Overview Quick List */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
            <div className="text-xs font-bold text-slate-700 flex justify-between items-center">
              <span>Mapped Regional Facilities ({filteredClinics.length})</span>
              <span className="text-[10px] text-slate-400 font-mono">ETB {(totalMapSpend || 0).toLocaleString()}</span>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {filteredClinics.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveClinic(c)}
                  className={`w-full p-2 rounded-xl text-left border flex items-center justify-between text-xs transition-all cursor-pointer ${
                    activeClinic?.id === c.id
                      ? 'bg-amber-50 border-amber-300 font-bold text-slate-900'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="truncate mr-2">
                    <div className="font-bold text-slate-900 truncate">{c.name}</div>
                    <div className="text-[10px] text-slate-500 font-sans">{c.city}</div>
                  </div>
                  <span className="font-mono text-emerald-800 text-[11px] font-bold shrink-0">
                    ETB {(c.totalETB || 0).toLocaleString()}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
