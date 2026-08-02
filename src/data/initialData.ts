import { Product, User, DemandRequest, SmsLog, ApiToken } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  { id: 1, product_code: 'COND001', name: 'Hiwot Trust 3pack Condom', unit: 'Pieces', qty_per_pack: 144, selling_price_birr: 1344, per_pack_trade: 28.00, category: 'Condoms', is_active: true, min_order_pack: 5, description: 'High-quality lubricated latex condoms for STI & pregnancy prevention.' },
  { id: 2, product_code: 'COND002', name: 'Sensation Ribbed Condoms', unit: 'Pieces', qty_per_pack: 144, selling_price_birr: 1680, per_pack_trade: 35.00, category: 'Condoms', is_active: true, min_order_pack: 5, description: 'Textured ribbed premium male condom packs.' },
  { id: 3, product_code: 'EC001', name: 'Postpill Emergency Contraceptive', unit: 'Pack', qty_per_pack: 60, selling_price_birr: 2880, per_pack_trade: 48.00, category: 'Emergency Contraceptives', is_active: true, min_order_pack: 2, description: 'Levonorgestrel 1.5mg single dose emergency contraceptive.' },
  { id: 4, product_code: 'EC002', name: 'Mela-One Emergency Contraceptive', unit: 'Pack', qty_per_pack: 20, selling_price_birr: 960, per_pack_trade: 48.00, category: 'Emergency Contraceptives', is_active: true, min_order_pack: 2, description: 'Rapid action single-dose emergency pill.' },
  { id: 5, product_code: 'OC001', name: 'iPlan Oral Contraceptives', unit: 'Cycle', qty_per_pack: 54, selling_price_birr: 3024, per_pack_trade: 56.00, category: 'Oral Contraceptives', is_active: true, min_order_pack: 5, description: 'Combined oral contraceptive pills (21 active + 7 iron booster).' },
  { id: 6, product_code: 'OC002', name: 'Choice Combined Pill', unit: 'Cycle', qty_per_pack: 54, selling_price_birr: 2160, per_pack_trade: 40.00, category: 'Oral Contraceptives', is_active: true, min_order_pack: 5, description: 'Low-dose ethinylestradiol and levonorgestrel cycle.' },
  { id: 7, product_code: 'INJ001', name: 'Depogestin Generic (DMPA-IM)', unit: 'Vial', qty_per_pack: 25, selling_price_birr: 1175, per_pack_trade: 47.00, category: 'Injectables', is_active: true, min_order_pack: 2, description: 'Depot medroxyprogesterone acetate 150mg/1ml injectable.' },
  { id: 8, product_code: 'LARC001', name: 'Longact T Cu 380 A (IUCD)', unit: 'Pieces', qty_per_pack: 1, selling_price_birr: 180, per_pack_trade: 80.00, category: 'LARCs', is_active: true, min_order_pack: 10, description: 'Copper T 380A intra-uterine contraceptive device (10-year protection).' },
  { id: 9, product_code: 'LARC002', name: 'IUCD - Bulk Pack 50s', unit: 'Pieces', qty_per_pack: 50, selling_price_birr: 4000, per_pack_trade: 80.00, category: 'LARCs', is_active: true, min_order_pack: 1, description: 'Bulk packed copper T IUCDs with sterile inserters.' },
  { id: 10, product_code: 'LARC003', name: 'Levoplant Subdermal Implant with Trocar', unit: 'Set', qty_per_pack: 10, selling_price_birr: 11000, per_pack_trade: 1100.00, category: 'LARCs', is_active: true, min_order_pack: 1, description: 'Two-rod levonorgestrel subdermal implant with disposable trocar (3-year).' },
  { id: 11, product_code: 'LARC004', name: 'Implanon NXT Single Rod', unit: 'Set', qty_per_pack: 1, selling_price_birr: 500, per_pack_trade: 500.00, category: 'LARCs', is_active: true, min_order_pack: 2, description: 'Etonogestrel single-rod radiopaque implant system.' },
  { id: 12, product_code: 'SA001', name: 'Safe-T-kit Combination', unit: 'Kit', qty_per_pack: 18, selling_price_birr: 7020, per_pack_trade: 390.00, category: 'Safe Abortion and PPH', is_active: true, min_order_pack: 1, description: 'Mifepristone 200mg + Misoprostol 4x200mcg combo kit for post-abortion care.' },
  { id: 13, product_code: 'SA002', name: 'Miso-fem Misoprostol 200mcg (1X12)', unit: 'Pack', qty_per_pack: 1, selling_price_birr: 150, per_pack_trade: 150.00, category: 'Safe Abortion and PPH', is_active: true, min_order_pack: 5, description: 'Misoprostol 200mcg tablets for obstetric and PPH management.' },
  { id: 14, product_code: 'SA003', name: 'MVA Plus Aspirator Double-Valve Set', unit: 'Set', qty_per_pack: 1, selling_price_birr: 3700, per_pack_trade: 3700.00, category: 'Safe Abortion and PPH', is_active: true, min_order_pack: 1, description: 'Reusable Manual Vacuum Aspiration system with cannulas.' },
  { id: 15, product_code: 'OTH001', name: 'LemLem ORS Orange Flavored Packets', unit: 'Sachet', qty_per_pack: 20, selling_price_birr: 560, per_pack_trade: 28.00, category: 'Others', is_active: true, min_order_pack: 5, description: 'Oral rehydration salts WHO formulation for pediatric diarrhea management.' }
];

export const INITIAL_USERS: User[] = [
  { id: 1, username: 'admin', full_name: 'SABA HQ Logistics Lead', role: 'admin', phone: '+251911234567', is_active: true, notes: 'System Administrator & Central Warehouse Lead' },
  { id: 2, username: 'clinic1', full_name: 'Dr. Abebe Kebede', role: 'clinic', clinic_name: 'Abebe Medical Specialty Center (Addis Ababa)', phone: '+251922345678', is_active: true, notes: 'Level 3 Family Planning Partner Clinic' },
  { id: 3, username: 'clinic2', full_name: 'Dr. Sara Tadesse', role: 'clinic', clinic_name: 'Bole Care Family Clinic', phone: '+251933456789', is_active: true, notes: 'High volume urban clinic partner' },
  { id: 4, username: 'clinic3', full_name: 'Dr. Yohannes Alemu', role: 'clinic', clinic_name: 'Merkato Health Center', phone: '+251944567890', is_active: true, notes: 'Community health station' },
  { id: 5, username: 'sales1', full_name: 'Dawit Haile', role: 'sales', phone: '+251955678901', is_active: true, notes: 'Senior Area Medical Sales Executive - Central Region' },
  { id: 6, username: 'sales2', full_name: 'Bethlehem Girma', role: 'sales', phone: '+251966789012', is_active: true, notes: 'Regional Partner Account Manager' }
];

export const INITIAL_DEMAND_REQUESTS: DemandRequest[] = [
  {
    id: 101,
    order_number: 'ORD-2026-8812',
    clinic_id: 2,
    clinic_name: 'Abebe Medical Specialty Center (Addis Ababa)',
    clinic_rep: 'Dr. Abebe Kebede',
    sales_rep_id: 5,
    sales_rep_name: 'Dawit Haile',
    status: 'pending',
    urgency: 'urgent',
    notes: 'Urgent restock needed for upcoming community reproductive health outreach campaign.',
    total_amount: 5740.00,
    checksum: 'a7b8c9d0e1f23456789abcdef0123456789abcdef0123456789abcdef0123456',
    auth_method: 'jwt_bearer',
    order_date: '2026-08-01T10:15:00Z',
    items: [
      { id: 1, order_id: 101, product_id: 1, product_code: 'COND001', name: 'Hiwot Trust 3pack Condom', unit: 'Pieces', quantity_requested: 20, unit_price: 28.00, total_price: 560.00 },
      { id: 2, order_id: 101, product_id: 3, product_code: 'EC001', name: 'Postpill Emergency Contraceptive', unit: 'Pack', quantity_requested: 10, unit_price: 48.00, total_price: 480.00 },
      { id: 3, order_id: 101, product_id: 7, product_code: 'INJ001', name: 'Depogestin Generic (DMPA-IM)', unit: 'Vial', quantity_requested: 100, unit_price: 47.00, total_price: 4700.00 }
    ]
  },
  {
    id: 102,
    order_number: 'ORD-2026-8790',
    clinic_id: 3,
    clinic_name: 'Bole Care Family Clinic',
    clinic_rep: 'Dr. Sara Tadesse',
    sales_rep_id: 5,
    sales_rep_name: 'Dawit Haile',
    status: 'approved',
    urgency: 'routine',
    notes: 'Monthly routine partner supply request.',
    total_amount: 8800.00,
    checksum: 'f1e2d3c4b5a67890123456789abcdef0123456789abcdef0123456789abcdef0',
    auth_method: 'api_key',
    order_date: '2026-07-30T14:20:00Z',
    review_date: '2026-07-31T09:00:00Z',
    items: [
      { id: 4, order_id: 102, product_id: 10, product_code: 'LARC003', name: 'Levoplant Subdermal Implant with Trocar', unit: 'Set', quantity_requested: 5, unit_price: 1100.00, total_price: 5500.00 },
      { id: 5, order_id: 102, product_id: 12, product_code: 'SA001', name: 'Safe-T-kit Combination', unit: 'Kit', quantity_requested: 5, unit_price: 390.00, total_price: 1950.00 },
      { id: 6, order_id: 102, product_id: 15, product_code: 'OTH001', name: 'LemLem ORS Orange Flavored Packets', unit: 'Sachet', quantity_requested: 48, unit_price: 28.00, total_price: 1344.00 }
    ]
  },
  {
    id: 103,
    order_number: 'ORD-2026-8755',
    clinic_id: 4,
    clinic_name: 'Merkato Health Center',
    clinic_rep: 'Dr. Yohannes Alemu',
    sales_rep_id: 6,
    sales_rep_name: 'Bethlehem Girma',
    status: 'delivered',
    urgency: 'emergency_stockout',
    notes: 'Dispatched via express partner fleet.',
    total_amount: 14200.00,
    checksum: '99887766554433221100aabbccddeeff00112233445566778899aabbccddeeff',
    auth_method: 'jwt_bearer',
    order_date: '2026-07-28T08:00:00Z',
    review_date: '2026-07-28T10:30:00Z',
    delivery_date: '2026-07-29T16:45:00Z',
    delivered_by: 'Express Courier Unit 4',
    items: [
      { id: 7, order_id: 103, product_id: 14, product_code: 'SA003', name: 'MVA Plus Aspirator Double-Valve Set', unit: 'Set', quantity_requested: 2, unit_price: 3700.00, total_price: 7400.00 },
      { id: 8, order_id: 103, product_id: 7, product_code: 'INJ001', name: 'Depogestin Generic (DMPA-IM)', unit: 'Vial', quantity_requested: 100, unit_price: 47.00, total_price: 4700.00 },
      { id: 9, order_id: 103, product_id: 5, product_code: 'OC001', name: 'iPlan Oral Contraceptives', unit: 'Cycle', quantity_requested: 37, unit_price: 56.00, total_price: 2072.00 }
    ]
  }
];

export const INITIAL_SMS_LOGS: SmsLog[] = [
  { id: 1, phone: '+251922345678', message: 'SABA ALERT: Order ORD-2026-8812 received and queued for sales verification. Reference: SMS-1786521', direction: 'outgoing', status: 'delivered', reference: 'ORD-2026-8812', created_at: '2026-08-01T10:15:05Z' },
  { id: 2, phone: '+251933456789', message: 'SABA ALERT: Order ORD-2026-8790 has been APPROVED by Sales Rep Dawit Haile. Dispatch pending.', direction: 'outgoing', status: 'delivered', reference: 'ORD-2026-8790', created_at: '2026-07-31T09:01:00Z' },
  { id: 3, phone: '+251944567890', message: 'SABA DELIVERED: Order ORD-2026-8755 delivered by Express Courier Unit 4.', direction: 'outgoing', status: 'delivered', reference: 'ORD-2026-8755', created_at: '2026-07-29T16:46:00Z' }
];

export const INITIAL_API_TOKENS: ApiToken[] = [
  {
    id: 'tok_live_89123',
    client_id: 'cli_abebe_med',
    name: 'Abebe Specialty Clinic Main EMR Integration',
    token: 'saba_pk_live_9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b',
    created_at: '2026-01-15T00:00:00Z',
    expires_at: '2027-01-15T00:00:00Z',
    scopes: ['demand:write', 'demand:read', 'catalog:read', 'sms:notify'],
    key_prefix: 'saba_pk_live_9a8b...'
  },
  {
    id: 'tok_live_44719',
    client_id: 'cli_bole_family',
    name: 'Bole Care Automated Reorder Service',
    token: 'saba_pk_live_1f2e3d4c5b6a79887766554433221100aabbccdd',
    created_at: '2026-03-01T00:00:00Z',
    expires_at: '2027-03-01T00:00:00Z',
    scopes: ['demand:write', 'demand:read', 'catalog:read'],
    key_prefix: 'saba_pk_live_1f2e...'
  }
];
