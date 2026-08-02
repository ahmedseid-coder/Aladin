import React, { useState, useEffect } from 'react';
import { ApiToken } from '../types';
import {
  Server,
  Key,
  Lock,
  Code2,
  Copy,
  Check,
  Send,
  Terminal,
  ShieldCheck,
  FileCode,
  Zap
} from 'lucide-react';

interface ApiPlaygroundProps {
  jwtToken: string;
}

export const ApiPlayground: React.FC<ApiPlaygroundProps> = ({ jwtToken }) => {
  const [activeTab, setActiveTab] = useState<'tokens' | 'endpoints' | 'snippets'>('snippets');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('POST /api/v1/demand/requests');
  const [snippetsLanguage, setSnippetsLanguage] = useState<'curl' | 'js' | 'python'>('curl');
  const [copied, setCopied] = useState(false);

  // Api Keys State
  const [apiKeys, setApiKeys] = useState<ApiToken[]>([]);
  const [newKeyName, setNewKeyName] = useState('EMR Automated Restock Service');
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);

  // API Tester State
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [isLoadingApi, setIsLoadingApi] = useState(false);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const res = await fetch('/api/v1/auth/api-keys', {
        headers: { Authorization: `Bearer ${jwtToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setApiKeys(data.keys);
      }
    } catch (err) {
      console.error('Fetch keys error:', err);
    }
  };

  const handleGenerateKey = async () => {
    setIsGeneratingKey(true);
    try {
      const res = await fetch('/api/v1/auth/api-keys/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`
        },
        body: JSON.stringify({
          name: newKeyName,
          scopes: ['demand:write', 'demand:read', 'catalog:read']
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchApiKeys();
        alert(`API Key Generated Successfully!\nKey: ${data.api_key.token}`);
      }
    } catch (err) {
      console.error('Key generation failed:', err);
    } finally {
      setIsGeneratingKey(false);
    }
  };

  const handleTestEndpoint = async () => {
    setIsLoadingApi(true);
    setApiResponse(null);

    try {
      if (selectedEndpoint === 'GET /api/v1/products') {
        const res = await fetch('/api/v1/products', {
          headers: { Authorization: `Bearer ${jwtToken}` }
        });
        const data = await res.json();
        setApiResponse(JSON.stringify(data, null, 2));
      } else if (selectedEndpoint === 'GET /api/v1/health') {
        const res = await fetch('/api/v1/health');
        const data = await res.json();
        setApiResponse(JSON.stringify(data, null, 2));
      } else if (selectedEndpoint === 'POST /api/v1/demand/requests') {
        const res = await fetch('/api/v1/demand/requests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`
          },
          body: JSON.stringify({
            clinic_id: 2,
            clinic_name: 'Abebe Medical Specialty Center (Addis Ababa)',
            urgency: 'urgent',
            items: [{ product_id: 1, quantity_requested: 10 }]
          })
        });
        const data = await res.json();
        setApiResponse(JSON.stringify(data, null, 2));
      }
    } catch (err: any) {
      setApiResponse(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setIsLoadingApi(false);
    }
  };

  // Generate Snippets
  const getCodeSnippet = () => {
    if (snippetsLanguage === 'curl') {
      return `curl -X POST https://api.saba.org.et/api/v1/demand/requests \\
  -H "Authorization: Bearer ${jwtToken}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "clinic_id": 2,
    "clinic_name": "Abebe Medical Specialty Center",
    "urgency": "urgent",
    "items": [
      { "product_code": "COND001", "quantity_requested": 20 },
      { "product_code": "INJ001", "quantity_requested": 50 }
    ]
  }'`;
    }

    if (snippetsLanguage === 'js') {
      return `const response = await fetch('https://api.saba.org.et/api/v1/demand/requests', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${jwtToken}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    clinic_id: 2,
    clinic_name: 'Abebe Medical Specialty Center',
    urgency: 'urgent',
    items: [
      { product_code: 'COND001', quantity_requested: 20 },
      { product_code: 'INJ001', quantity_requested: 50 }
    ]
  })
});
const result = await response.json();
console.log('Order Reference:', result.order_number);`;
    }

    return `import requests

url = "https://api.saba.org.et/api/v1/demand/requests"
headers = {
    "Authorization": "Bearer ${jwtToken}",
    "Content-Type": "application/json"
}
payload = {
    "clinic_id": 2,
    "clinic_name": "Abebe Medical Specialty Center",
    "urgency": "urgent",
    "items": [
        {"product_code": "COND001", "quantity_requested": 20},
        {"product_code": "INJ001", "quantity_requested": 50}
    ]
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5 font-mono">
              <Server className="w-3.5 h-3.5" /> REST API v1.4 Sandbox
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-2">API Integration & Security Protocols Center</h2>
          <p className="text-xs text-slate-300">
            OpenAPI 3.0 specification tester, API Key Generator, JWT token issuing service, and cURL / Fetch code generators.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('snippets')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'snippets' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Code Snippets
          </button>
          <button
            onClick={() => setActiveTab('endpoints')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'endpoints' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Live REST Tester
          </button>
          <button
            onClick={() => setActiveTab('tokens')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'tokens' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            API Key Management
          </button>
        </div>
      </div>

      {/* Tab Content 1: Code Snippets */}
      {activeTab === 'snippets' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl p-6 text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold font-mono">POST /api/v1/demand/requests Code Generator</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSnippetsLanguage('curl')}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                    snippetsLanguage === 'curl' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  cURL
                </button>
                <button
                  onClick={() => setSnippetsLanguage('js')}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                    snippetsLanguage === 'js' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Fetch (JS)
                </button>
                <button
                  onClick={() => setSnippetsLanguage('python')}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                    snippetsLanguage === 'python' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Python
                </button>

                <button
                  onClick={copyToClipboard}
                  className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy Code'}
                </button>
              </div>
            </div>

            <pre className="p-4 bg-slate-900 rounded-xl font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed border border-slate-800">
              {getCodeSnippet()}
            </pre>
          </div>

          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm text-slate-800">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              API Security Standards Specs
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block">1. Authentication Bearer Header</span>
                <span className="text-slate-600 font-mono">Authorization: Bearer &lt;jwt_access_token&gt;</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block">2. API Key Header Protocol</span>
                <span className="text-slate-600 font-mono">X-SABA-API-Key: saba_pk_live_...</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block">3. Payload Integrity & Checksum</span>
                <span className="text-slate-600 font-mono">SHA-256 HMAC digest generated on POST body</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Live REST Tester */}
      {activeTab === 'endpoints' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Interactive Endpoint Tester</h3>
              <p className="text-xs text-slate-500">Select an API endpoint to execute live against local container backend.</p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedEndpoint}
                onChange={(e) => setSelectedEndpoint(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="POST /api/v1/demand/requests">POST /api/v1/demand/requests</option>
                <option value="GET /api/v1/products">GET /api/v1/products</option>
                <option value="GET /api/v1/health">GET /api/v1/health</option>
              </select>

              <button
                onClick={handleTestEndpoint}
                disabled={isLoadingApi}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5 text-white" />
                Execute Request
              </button>
            </div>
          </div>

          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 font-mono text-xs text-emerald-300 min-h-[300px]">
            <div className="text-slate-500 border-b border-slate-800 pb-2 mb-3 flex justify-between">
              <span>Response Console</span>
              <span>HTTP Status: 200 OK</span>
            </div>
            {isLoadingApi ? (
              <div className="text-slate-400 italic">Sending request to SABA API Endpoint...</div>
            ) : apiResponse ? (
              <pre className="overflow-x-auto leading-relaxed">{apiResponse}</pre>
            ) : (
              <div className="text-slate-500 italic">Click "Execute Request" above to test API output.</div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content 3: API Keys */}
      {activeTab === 'tokens' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-600" />
              Generate Partner Integration API Key
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Integration Name (e.g. Clinic EMR Sync)..."
                className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 flex-1 w-full"
              />

              <button
                onClick={handleGenerateKey}
                disabled={isGeneratingKey}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors whitespace-nowrap"
              >
                Issue API Key
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700">
              Active Partner Integration API Keys ({apiKeys.length})
            </div>

            <div className="divide-y divide-slate-100 text-xs font-mono">
              {apiKeys.map((k) => (
                <div key={k.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-900 font-sans text-sm">{k.name}</div>
                    <div className="text-emerald-700 font-bold mt-0.5">{k.key_prefix}</div>
                  </div>

                  <div className="text-slate-500 text-right">
                    <div>Created: {new Date(k.created_at).toLocaleDateString()}</div>
                    <div className="text-emerald-600 font-bold text-[10px] uppercase">Status: ACTIVE</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
