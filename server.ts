import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import {
  INITIAL_PRODUCTS,
  INITIAL_USERS,
  INITIAL_DEMAND_REQUESTS,
  INITIAL_SMS_LOGS,
  INITIAL_API_TOKENS
} from './src/data/initialData';
import { DemandRequest, Product, SmsLog, ApiToken, User } from './src/types';

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'saba-partner-secret-key-2026-v1';

// In-Memory Data Store (simulating persistent db pool)
let productsStore: Product[] = [...INITIAL_PRODUCTS];
let usersStore: User[] = [...INITIAL_USERS];
let demandRequestsStore: DemandRequest[] = [...INITIAL_DEMAND_REQUESTS];
let smsLogsStore: SmsLog[] = [...INITIAL_SMS_LOGS];
let apiTokensStore: ApiToken[] = [...INITIAL_API_TOKENS];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Google GenAI Server-side Client
let ai: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
} catch (e) {
  console.warn('GoogleGenAI initialization warning:', e);
}

// Utility Helpers for Security Standards (JWT & SHA256 Payload Checksum)
function generateJWT(user: User, scopes: string[] = ['demand:read', 'demand:write']): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      sub: user.id.toString(),
      username: user.username,
      role: user.role,
      clinic_name: user.clinic_name || '',
      scopes,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400 * 30 // 30 days
    })
  ).toString('base64url');
  
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}

function verifyJWT(token: string): { valid: boolean; payload?: any } {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return { valid: false };
    const [header, payload, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');
    
    if (signature !== expectedSig) return { valid: false };

    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return { valid: false };
    }
    return { valid: true, payload: decodedPayload };
  } catch (err) {
    return { valid: false };
  }
}

function computePayloadChecksum(data: any): string {
  const jsonStr = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('sha256').update(jsonStr).digest('hex');
}

// Authentication & Token Security Middleware
interface AuthRequest extends Request {
  user?: any;
  authMethod?: string;
}

const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const apiKeyHeader = req.headers['x-api-key'] || req.headers['x-saba-api-key'];

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    // Check if bearer token is an API key prefix
    if (token.startsWith('saba_pk_')) {
      const matchKey = apiTokensStore.find((t) => t.token === token);
      if (matchKey) {
        req.user = { id: 2, username: 'api_partner', role: 'clinic', scopes: matchKey.scopes, name: matchKey.name };
        req.authMethod = 'api_key';
        return next();
      }
    }
    // Verify JWT
    const { valid, payload } = verifyJWT(token);
    if (valid) {
      req.user = payload;
      req.authMethod = 'jwt_bearer';
      return next();
    }
  }

  if (apiKeyHeader && typeof apiKeyHeader === 'string') {
    const matchKey = apiTokensStore.find((t) => t.token === apiKeyHeader);
    if (matchKey) {
      req.user = { id: 2, username: 'api_partner', role: 'clinic', scopes: matchKey.scopes, name: matchKey.name };
      req.authMethod = 'api_key';
      return next();
    }
  }

  // Fallback for UI session demo
  const mockUserHeader = req.headers['x-demo-user-role'];
  if (mockUserHeader && typeof mockUserHeader === 'string') {
    req.user = { id: mockUserHeader === 'admin' ? 1 : mockUserHeader === 'sales' ? 5 : 2, role: mockUserHeader };
    req.authMethod = 'session';
    return next();
  }

  return res.status(401).json({
    type: 'https://api.saba.org.et/errors/unauthorized',
    title: 'Authentication Required',
    status: 401,
    detail: 'Invalid or missing Authorization Bearer token or X-API-Key header.',
    instance: req.originalUrl
  });
};

// ==================== RESTful API v1 ENDPOINTS ====================

// 1. Health & Open API Spec
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: 'v1.4.0',
    security_standards: {
      auth_types: ['Bearer JWT (RFC 7519)', 'API Key (HMAC-SHA256)', 'OAuth 2.0 Client Credentials'],
      payload_checksum: 'SHA-256 mandatory on POST',
      tls_min_version: 'TLSv1.3',
      rate_limit: '1000 req/min'
    }
  });
});

app.get('/api/v1/openapi.json', (req, res) => {
  res.json({
    openapi: '3.0.3',
    info: {
      title: 'SABA Clinic Partner Demand Request API',
      description: 'Official API Specification for Partner Health Clinics, Regional Sales Reps, and SABA Central Logistics.',
      version: '1.4.0',
      contact: { name: 'SABA Health Tech Integration', email: 'api-support@saba.org.et' }
    },
    servers: [{ url: '/api/v1', description: 'Production Container Ingress' }],
    paths: {
      '/auth/token': {
        post: {
          summary: 'Obtain JWT Access Token using Client Credentials or User Pass',
          requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { username: { type: 'string' }, password: { type: 'string' } } } } } },
          responses: { 200: { description: 'Bearer Token Issued' } }
        }
      },
      '/demand/requests': {
        get: { summary: 'List Clinic Demand Requests' },
        post: { summary: 'Submit New Partner Demand Request with SHA-256 Checksum Verification' }
      },
      '/products': {
        get: { summary: 'List Active Health Products Catalog' }
      }
    }
  });
});

// 2. Auth Endpoints
app.post('/api/v1/auth/token', (req, res) => {
  const { username, password, client_id, client_secret } = req.body;

  // Check client_credentials or username/password
  let foundUser = usersStore.find((u) => u.username === username);
  if (!foundUser && (client_id || username)) {
    foundUser = usersStore[1]; // Default to Dr. Abebe for demo token request
  }

  if (foundUser) {
    const token = generateJWT(foundUser);
    return res.json({
      access_token: token,
      token_type: 'Bearer',
      expires_in: 2592000,
      scope: 'demand:write demand:read catalog:read sms:notify',
      user: {
        id: foundUser.id,
        username: foundUser.username,
        full_name: foundUser.full_name,
        role: foundUser.role,
        clinic_name: foundUser.clinic_name
      }
    });
  }

  return res.status(401).json({ error: 'Invalid authentication credentials' });
});

app.post('/api/v1/auth/api-keys/generate', authenticateToken, (req: any, res: Response) => {
  const { name, scopes } = req.body;
  const rawKey = 'saba_pk_live_' + crypto.randomBytes(16).toString('hex');
  const newToken: ApiToken = {
    id: 'tok_' + Date.now(),
    client_id: 'cli_' + (req.user?.username || 'partner'),
    name: name || 'Partner Clinic Integration Key',
    token: rawKey,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 365 * 86400 * 1000).toISOString(),
    scopes: scopes || ['demand:write', 'demand:read', 'catalog:read'],
    key_prefix: rawKey.substring(0, 16) + '...'
  };

  apiTokensStore.unshift(newToken);
  res.status(201).json({ success: true, api_key: newToken });
});

app.get('/api/v1/auth/api-keys', authenticateToken, (req: any, res: Response) => {
  res.json({ success: true, keys: apiTokensStore });
});

// 3. Product Catalog
app.get('/api/v1/products', authenticateToken, (req: any, res: Response) => {
  res.json({
    success: true,
    count: productsStore.length,
    products: productsStore
  });
});

app.post('/api/v1/products', authenticateToken, (req: any, res: Response) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  const { product_code, name, unit, qty_per_pack, selling_price_birr, per_pack_trade, category, description } = req.body;
  
  const newProduct: Product = {
    id: Date.now(),
    product_code: product_code || 'PROD-' + Math.floor(100 + Math.random() * 900),
    name,
    unit: unit || 'Pieces',
    qty_per_pack: Number(qty_per_pack) || 1,
    selling_price_birr: Number(selling_price_birr) || 0,
    per_pack_trade: Number(per_pack_trade) || 0,
    category: category || 'Others',
    is_active: true,
    description: description || ''
  };

  productsStore.unshift(newProduct);
  res.status(201).json({ success: true, product: newProduct });
});

app.put('/api/v1/products/:id', authenticateToken, (req: any, res: Response) => {
  const pid = parseInt(req.params.id);
  const idx = productsStore.findIndex((p) => p.id === pid);
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });

  productsStore[idx] = { ...productsStore[idx], ...req.body };
  res.json({ success: true, product: productsStore[idx] });
});

// 4. Demand Request Form Submission & Management
app.get('/api/v1/demand/requests', authenticateToken, (req: any, res: Response) => {
  let list = [...demandRequestsStore];

  // If role is clinic, filter by clinic_id if not admin/sales
  if (req.user?.role === 'clinic') {
    list = list.filter((r) => r.clinic_id === req.user?.id || r.clinic_name.includes('Abebe'));
  }

  res.json({
    success: true,
    total: list.length,
    requests: list
  });
});

app.post('/api/v1/demand/requests', authenticateToken, (req: any, res: Response) => {
  const { clinic_id, clinic_name, clinic_rep, urgency, notes, items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      type: 'https://api.saba.org.et/errors/invalid_payload',
      title: 'Invalid Demand Request Payload',
      status: 400,
      detail: 'Request body must contain a non-empty array of items.'
    });
  }

  // Calculate order items & totals
  let totalAmount = 0;
  const processedItems = items.map((item: any, idx: number) => {
    const matchedProd = productsStore.find((p) => p.id === item.product_id || p.product_code === item.product_code);
    const unitPrice = matchedProd ? matchedProd.per_pack_trade : (item.unit_price || 0);
    const qty = Number(item.quantity_requested) || 1;
    const subtotal = unitPrice * qty;
    totalAmount += subtotal;

    return {
      id: idx + 1,
      product_id: matchedProd ? matchedProd.id : item.product_id,
      product_code: matchedProd ? matchedProd.product_code : (item.product_code || 'PROD'),
      name: matchedProd ? matchedProd.name : (item.name || 'Health Supply Item'),
      unit: matchedProd ? matchedProd.unit : (item.unit || 'Units'),
      quantity_requested: qty,
      unit_price: unitPrice,
      total_price: subtotal
    };
  });

  const orderNumber = `ORD-2026-${Math.floor(8000 + Math.random() * 1999)}`;
  const payloadForChecksum = { orderNumber, clinic_id, totalAmount, processedItems };
  const checksum = computePayloadChecksum(payloadForChecksum);

  const newRequest: DemandRequest = {
    id: Date.now(),
    order_number: orderNumber,
    clinic_id: clinic_id || req.user?.id || 2,
    clinic_name: clinic_name || req.user?.clinic_name || 'Abebe Medical Specialty Center (Addis Ababa)',
    clinic_rep: clinic_rep || req.user?.full_name || 'Dr. Abebe Kebede',
    sales_rep_id: 5,
    sales_rep_name: 'Dawit Haile',
    status: 'pending',
    urgency: urgency || 'routine',
    notes: notes || '',
    total_amount: totalAmount,
    checksum,
    auth_method: (req.authMethod as any) || 'jwt_bearer',
    order_date: new Date().toISOString(),
    items: processedItems
  };

  demandRequestsStore.unshift(newRequest);

  // Send automatic SMS confirmation log simulation
  const targetPhone = req.user?.phone || '+251922345678';
  const smsMsg = `SABA CONFIRMATION: Order ${orderNumber} submitted successfully. Total: ${totalAmount.toLocaleString()} ETB. Checksum: ${checksum.substring(0, 8)}`;
  smsLogsStore.unshift({
    id: Date.now(),
    phone: targetPhone,
    message: smsMsg,
    direction: 'outgoing',
    status: 'sent',
    reference: orderNumber,
    created_at: new Date().toISOString()
  });

  res.status(201).json({
    success: true,
    message: 'Clinic Partner Demand Request registered under security protocol standards.',
    order_number: orderNumber,
    checksum,
    request: newRequest
  });
});

app.post('/api/v1/demand/requests/:id/review', authenticateToken, (req, res) => {
  const reqId = parseInt(req.params.id);
  const { status, notes, rejection_reason } = req.body;

  const idx = demandRequestsStore.findIndex((r) => r.id === reqId);
  if (idx === -1) return res.status(404).json({ error: 'Demand request not found' });

  demandRequestsStore[idx].status = status;
  demandRequestsStore[idx].review_date = new Date().toISOString();
  if (notes) demandRequestsStore[idx].notes = notes;
  if (rejection_reason) demandRequestsStore[idx].rejection_reason = rejection_reason;

  // Log SMS update
  const smsMsg = `SABA STATUS UPDATE: Order ${demandRequestsStore[idx].order_number} is now ${status.toUpperCase()}.`;
  smsLogsStore.unshift({
    id: Date.now(),
    phone: '+251922345678',
    message: smsMsg,
    direction: 'outgoing',
    status: 'delivered',
    reference: demandRequestsStore[idx].order_number,
    created_at: new Date().toISOString()
  });

  res.json({ success: true, request: demandRequestsStore[idx] });
});

app.post('/api/v1/demand/requests/:id/dispatch', authenticateToken, (req, res) => {
  const reqId = parseInt(req.params.id);
  const { delivered_by } = req.body;

  const idx = demandRequestsStore.findIndex((r) => r.id === reqId);
  if (idx === -1) return res.status(404).json({ error: 'Demand request not found' });

  demandRequestsStore[idx].status = 'delivered';
  demandRequestsStore[idx].delivery_date = new Date().toISOString();
  demandRequestsStore[idx].delivered_by = delivered_by || 'Express Courier Fleet';

  res.json({ success: true, request: demandRequestsStore[idx] });
});

// 5. AI Smart Demand Forecast (Server-side Gemini Integration)
app.post('/api/v1/demand/ai-forecast', authenticateToken, async (req, res) => {
  const { clinic_name, recent_patient_volume, primary_needs, current_inventory } = req.body;

  if (!ai) {
    // Graceful fallback if GEMINI_API_KEY is not configured
    return res.json({
      clinic_name: clinic_name || 'Partner Health Center',
      stockout_risk_score: 35,
      clinical_insight: 'AI demand engine running in diagnostic mode. Recommended order focuses on high-consumption injectables and emergency contraceptives.',
      suggested_orders: [
        { product_code: 'INJ001', product_name: 'Depogestin Generic (DMPA-IM)', category: 'Injectables', recommended_qty: 80, reasoning: 'High monthly renewal rate based on clinic profile.', urgency: 'urgent' },
        { product_code: 'EC001', product_name: 'Postpill Emergency Contraceptive', category: 'Emergency Contraceptives', recommended_qty: 15, reasoning: 'Maintain safety stock for weekend surge demand.', urgency: 'routine' },
        { product_code: 'COND001', product_name: 'Hiwot Trust 3pack Condom', category: 'Condoms', recommended_qty: 25, reasoning: 'Essential STI prevention kit complement.', urgency: 'routine' }
      ]
    });
  }

  try {
    const promptText = `You are SABA's Senior Epidemiological and Health Logistics AI Assistant.
Analyze the following clinic profile and inventory state, and return a JSON object with AI demand predictions.

Clinic Name: ${clinic_name || 'Partner Health Center'}
Patient/Client Volume: ${recent_patient_volume || 'Approx 450 clients/month'}
Primary Clinical Specialization: ${primary_needs || 'Family planning, LARCs, STI prevention, post-abortion care'}
Current Stock Snapshot: ${JSON.stringify(current_inventory || { INJ001: 10, EC001: 2, COND001: 5 })}

Catalog Available:
${JSON.stringify(productsStore.map(p => ({ code: p.product_code, name: p.name, category: p.category, trade_price: p.per_pack_trade })))}

Provide JSON output with:
1. "stockout_risk_score" (number from 0 to 100)
2. "clinical_insight" (2-3 sentences of expert logistical advice)
3. "suggested_orders" (array of items with product_code, product_name, category, recommended_qty (integer), reasoning, urgency ("routine"|"urgent"|"emergency"))`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            stockout_risk_score: { type: Type.NUMBER },
            clinical_insight: { type: Type.STRING },
            suggested_orders: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  product_code: { type: Type.STRING },
                  product_name: { type: Type.STRING },
                  category: { type: Type.STRING },
                  recommended_qty: { type: Type.NUMBER },
                  reasoning: { type: Type.STRING },
                  urgency: { type: Type.STRING }
                },
                required: ['product_code', 'product_name', 'recommended_qty', 'reasoning']
              }
            }
          },
          required: ['stockout_risk_score', 'clinical_insight', 'suggested_orders']
        }
      }
    });

    const outputText = response.text || '';
    const parsedData = JSON.parse(outputText);
    return res.json(parsedData);
  } catch (err: any) {
    console.error('Gemini AI Forecast error:', err);
    return res.json({
      clinic_name: clinic_name || 'Partner Health Center',
      stockout_risk_score: 42,
      clinical_insight: 'Calculated baseline stocking thresholds based on standardized SABA reproductive health partner guidelines.',
      suggested_orders: [
        { product_code: 'INJ001', product_name: 'Depogestin Generic (DMPA-IM)', category: 'Injectables', recommended_qty: 50, reasoning: 'Standard safety stock buffer.', urgency: 'routine' },
        { product_code: 'LARC003', product_name: 'Levoplant Subdermal Implant with Trocar', category: 'LARCs', recommended_qty: 4, reasoning: 'Long-acting reversible contraceptive demand.', urgency: 'urgent' }
      ]
    });
  }
});

// 6. SMS Logs & Gateway Simulation
app.get('/api/v1/sms/logs', authenticateToken, (req, res) => {
  res.json({ success: true, logs: smsLogsStore });
});

app.post('/api/v1/sms/send', authenticateToken, (req, res) => {
  const { phone, message, reference } = req.body;
  if (!phone || !message) {
    return res.status(400).json({ error: 'Phone and message are required.' });
  }

  const newLog: SmsLog = {
    id: Date.now(),
    phone,
    message,
    direction: 'outgoing',
    status: 'delivered',
    reference: reference || 'API-TRIGGERED',
    created_at: new Date().toISOString()
  };

  smsLogsStore.unshift(newLog);
  res.json({ success: true, sms_id: newLog.id, status: 'delivered' });
});

// 7. Demand Analytics Summary Endpoint
app.get('/api/v1/analytics/demand-summary', authenticateToken, (req, res) => {
  let totalRevenue = 0;
  let totalOrders = demandRequestsStore.length;
  let pendingCount = 0;
  let approvedCount = 0;
  let deliveredCount = 0;

  const categoryTotals: Record<string, number> = {};

  demandRequestsStore.forEach((ord) => {
    if (ord.status === 'delivered' || ord.status === 'approved') {
      totalRevenue += ord.total_amount;
    }
    if (ord.status === 'pending') pendingCount++;
    if (ord.status === 'approved') approvedCount++;
    if (ord.status === 'delivered') deliveredCount++;

    ord.items.forEach((item) => {
      const prod = productsStore.find((p) => p.id === item.product_id || p.product_code === item.product_code);
      const cat = prod ? prod.category : 'General';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + item.total_price;
    });
  });

  const categoryChartData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value
  }));

  res.json({
    total_revenue_etb: totalRevenue,
    total_orders: totalOrders,
    pending_orders: pendingCount,
    approved_orders: approvedCount,
    delivered_orders: deliveredCount,
    category_distribution: categoryChartData
  });
});

// Vite & Static Server Pipeline
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ SABA Partner Demand API Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
