// src/services/aiService.js
// AI Assistant integration layer.
// Uses Ollama (local) if available; falls back gracefully to Demo Mode.

const OLLAMA_BASE_URL = import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434';
const MODEL = import.meta.env.VITE_OLLAMA_MODEL || 'gemma3:4b';

// AI Status enum
export const AI_STATUS = {
  CONNECTED: 'connected',
  DEMO: 'demo',
  UNAVAILABLE: 'unavailable',
};

let _cachedStatus = null;
let _lastCheck = 0;

// ─── Health check ─────────────────────────────────────────────────────────────
export async function isAvailable() {
  const now = Date.now();
  if (_cachedStatus && now - _lastCheck < 30000) return _cachedStatus;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      const modelAvailable = data.models?.some(m => m.name.includes('gemma') || m.name.includes('llama'));
      _cachedStatus = modelAvailable ? AI_STATUS.CONNECTED : AI_STATUS.DEMO;
    } else {
      _cachedStatus = AI_STATUS.DEMO;
    }
  } catch {
    _cachedStatus = AI_STATUS.DEMO;
  }

  _lastCheck = now;
  return _cachedStatus;
};

// ─── Ask question ─────────────────────────────────────────────────────────────
export async function askQuestion(prompt, context = {}) {
  const status = await isAvailable();

  if (status === AI_STATUS.CONNECTED) {
    try {
      const systemPrompt = `You are FuelLedger AI Assistant, helping an Indian petrol pump owner named ${context.ownerName || 'the owner'} at ${context.stationName || 'their station'} (ID: ${context.stationId || 'FL-PN-001'}).
Provide concise, actionable answers about fuel station operations, sales, inventory, and compliance.
Use Indian context: currency INR (₹), date format DD MMM YYYY.
Keep responses brief (under 150 words). Do not fabricate data.`;

      const body = {
        model: MODEL,
        prompt: `${systemPrompt}\n\nUser: ${prompt}`,
        stream: false,
        options: { temperature: 0.3, num_predict: 200 },
      };

      const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Ollama error');
      const data = await res.json();
      return {
        response: data.response,
        source: AI_STATUS.CONNECTED,
        model: MODEL,
      };
    } catch {
      // Fall through to demo
    }
  }

  // Demo mode responses
  return getDemoResponse(prompt);
}

// ─── Parse intent to draft transaction ───────────────────────────────────────
export async function parseIntentToDraft(prompt) {
  const status = await isAvailable();
  const lower = prompt.toLowerCase();

  // Extract numbers
  const numbers = prompt.match(/\d+\.?\d*/g)?.map(Number) || [];
  const qty = numbers.find(n => n > 0 && n < 10000) || 10;
  
  // Extract fuel type
  const fuelType = lower.includes('petrol') ? 'petrol' :
    lower.includes('diesel') ? 'diesel' :
    lower.includes('cng') ? 'cng' : 'petrol';

  // Extract payment method
  const paymentMethod = lower.includes('cash') ? 'Cash' :
    lower.includes('upi') ? 'UPI' :
    lower.includes('card') ? 'Card' : 'Cash';

  const draft = {
    fuelType,
    quantity: qty,
    paymentMethod,
    customerName: 'Walk-in',
    vehicleNumber: '',
    notes: `AI-parsed from: "${prompt}"`,
    _aiGenerated: true,
    _requiresConfirmation: true,
  };

  return {
    draft,
    confidence: status === AI_STATUS.CONNECTED ? 'high' : 'low',
    source: status,
    warning: 'AI-generated drafts require your review and confirmation before saving.',
  };
}

// ─── Demo responses ───────────────────────────────────────────────────────────
const DEMO_RESPONSES = [
  {
    keywords: ['stock', 'inventory', 'fuel'],
    response: '📊 **Inventory Status (Demo Data):**\n\n• Petrol: 7,240 L (28.9% capacity) — ⚠️ Near reorder\n• Diesel: 12,850 L (32.1% capacity) — ✅ Adequate\n• CNG: 1,380 kg (27.6% capacity) — 🔴 Below reorder\n\nRecommended: Place CNG order immediately (estimated 2-3 days remaining).',
  },
  {
    keywords: ['revenue', 'sales', 'today', 'earning'],
    response: '💰 **Revenue Summary (Demo Data — Last 7 days):**\n\nEstimated total revenue: ₹7.84 L\n• Petrol: ₹6,61,200\n• Diesel: ₹12,48,500\n• CNG: ₹3,66,400\n\nAvg daily revenue: ₹1.12 L. Compare to previous 7 days: +3.2% 📈',
  },
  {
    keywords: ['reconcil', 'mismatch', 'upi', 'payment'],
    response: '⚠️ **Reconciliation Alert (Demo Data):**\n\nDate: 14 Oct 2026 — UPI Mismatch detected.\n• System UPI total: ₹55,480\n• Bank credit: ₹54,230\n• Difference: **₹1,250**\n\nPossible cause: Pending UPI reversal or gateway hold. Action: Contact payment gateway support with transaction logs.',
  },
  {
    keywords: ['report', 'daily'],
    response: '📋 **Daily Report Guidance:**\n\nTo generate your daily report:\n1. Go to **Reports** → Daily Summary\n2. Select date (e.g., 18 Oct 2026)\n3. Verify shift-wise sales totals\n4. Cross-check with reconciliation\n5. Download PDF for records\n\nNote: Keep reports for 5 years as per petroleum regulations.',
  },
  {
    keywords: ['forecast', 'order', 'reorder'],
    response: '🔮 **Forecast & Reorder (Demo Data):**\n\n• Petrol avg daily: ~953 L → Order: ~6,100 L (14-day safety stock)\n• Diesel avg daily: ~1,742 L → Order: ~11,500 L\n• CNG avg daily: ~498 kg → Order: ~5,600 kg (urgent!)\n\nContact BPCL Depot Nagpur for delivery scheduling.',
  },
];

function getDemoResponse(prompt) {
  const lower = prompt.toLowerCase();
  for (const item of DEMO_RESPONSES) {
    if (item.keywords.some(kw => lower.includes(kw))) {
      return {
        response: item.response,
        source: AI_STATUS.DEMO,
        model: 'demo-responses',
        disclaimer: 'This is a demo response. Connect Ollama with Gemma for live AI insights.',
      };
    }
  }
  return {
    response: `🤖 **FuelLedger AI (Demo Mode)**\n\nI understand you're asking about: "${prompt}"\n\nIn Demo Mode, I can answer questions about:\n• Stock levels and inventory\n• Revenue and sales trends\n• Reconciliation mismatches\n• Daily reports\n• Forecasting and reorder\n\nTo enable live AI, install Ollama locally and run: \`ollama pull gemma3:4b\``,
    source: AI_STATUS.DEMO,
    model: 'demo-responses',
    disclaimer: 'Connect Ollama for live AI. See README for setup instructions.',
  };
}

export default { isAvailable, askQuestion, parseIntentToDraft, AI_STATUS };
