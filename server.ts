import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { formatArabicCairoDateNow, generateOrderCode } from './src/utils/dateFormatter';
import { DEFAULT_STORE_SETTINGS } from './src/data/constants';
import { Order, StoreSettings, DashboardStats } from './src/types';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const PORT = 3000;

// In-Memory Persistence Stores
let currentSettings: StoreSettings = {
  ...DEFAULT_STORE_SETTINGS,
  googleSheetUrl: process.env.GOOGLE_SHEET_URL || DEFAULT_STORE_SETTINGS.googleSheetUrl
};

// Seed sample orders for immediate richness in dashboard
const ordersStore: Order[] = [
  {
    id: 'ord-101',
    orderCode: 'AYA-84192',
    customerName: 'مروة عبد المنعم',
    phone1: '01023456789',
    phone2: '01123456780',
    governorate: 'الإسماعيلية',
    branch: 'فرع الإسماعيلية',
    address: 'شارع شبين الكوم - برج الزهور',
    packageId: 'offer-1',
    packageName: 'باقة الكافيار والصبغة الملكية',
    packagePrice: 500,
    addHairWash: true,
    hairWashPrice: 100,
    selectedShade: 'بني شوكولاتة ملكي',
    wonPrize: 'تركيب رموش One by One',
    depositAmount: 150,
    remainingAmount: 450,
    totalPrice: 600,
    status: 'confirmed',
    notes: 'تم تأكيد تحويل العربون على إنستاباي بنجاح',
    cairoFormattedDate: formatArabicCairoDateNow(),
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    syncedToGoogleSheet: true
  },
  {
    id: 'ord-102',
    orderCode: 'AYA-93214',
    customerName: 'ياسمين الشريف',
    phone1: '01234567891',
    governorate: 'القاهرة',
    branch: 'فرع القاهرة - مصر الجديدة',
    address: 'شارع الحجاز خلف حديقة الميريلاند',
    packageId: 'offer-2',
    packageName: 'باقة ترتمنت الأرجان والصبغة الذهبية',
    packagePrice: 999,
    addHairWash: false,
    hairWashPrice: 0,
    selectedShade: 'عسلي ذهبي مشرق',
    wonPrize: 'ضوافر Shein عصرية',
    depositAmount: 150,
    remainingAmount: 849,
    totalPrice: 999,
    status: 'deposit_pending',
    notes: 'بانتظار إرسال إيصال التحويل',
    cairoFormattedDate: formatArabicCairoDateNow(),
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    syncedToGoogleSheet: false
  },
  {
    id: 'ord-103',
    orderCode: 'AYA-71589',
    customerName: 'سارة إبراهيم فتحي',
    phone1: '01512345678',
    governorate: 'القاهرة',
    branch: 'فرع جسر السويس',
    address: 'أول جسر السويس - عمارات الميريلاند',
    packageId: 'offer-1',
    packageName: 'باقة الكافيار والصبغة الملكية',
    packagePrice: 500,
    addHairWash: true,
    hairWashPrice: 100,
    selectedShade: 'كراميل وبندق دافئ',
    wonPrize: 'تنضيف وتنعيم بشرة',
    depositAmount: 150,
    remainingAmount: 450,
    totalPrice: 600,
    status: 'completed',
    notes: 'حضرت الجلسة واستلمت مجموعة الشامبو والبلسم الهدية',
    cairoFormattedDate: formatArabicCairoDateNow(),
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    syncedToGoogleSheet: true
  }
];

// Lazy Gemini API Client Initialization
let genAIClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return genAIClient;
}

// Helper: Forward order payload to Google Apps Script Web App
async function forwardOrderToGoogleSheet(sheetUrl: string, orderData: any) {
  if (!sheetUrl || !sheetUrl.startsWith('http')) {
    return { success: false, error: 'No valid Google Sheet URL configured' };
  }

  try {
    const response = await fetch(sheetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({
        action: 'addOrder',
        order: orderData
      }),
      redirect: 'follow'
    });

    const text = await response.text();
    let parsed: any = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { raw: text };
    }

    return {
      success: response.ok,
      httpCode: response.status,
      response: parsed
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Network error connecting to Google Sheet'
    };
  }
}

// Calculate Dashboard Stats
function calculateStats(orders: Order[]): DashboardStats {
  return orders.reduce((acc, curr) => {
    acc.totalOrders += 1;
    acc.totalSales += Number(curr.totalPrice) || 0;
    acc.totalDeposits += Number(curr.depositAmount) || 0;
    if (curr.status === 'new' || curr.status === 'deposit_pending') acc.newOrders += 1;
    if (curr.status === 'confirmed') acc.confirmedOrders += 1;
    if (curr.status === 'completed') acc.completedOrders += 1;
    if (curr.status === 'cancelled') acc.cancelledOrders += 1;
    return acc;
  }, {
    totalOrders: 0,
    totalSales: 0,
    totalDeposits: 0,
    newOrders: 0,
    confirmedOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0
  });
}

// Central API Request Handler (Handles both /api.php and /api routes)
async function handleApiRequest(req: Request, res: Response) {
  const requestData = { ...req.query, ...req.body };
  const action = (requestData.action || req.query.action || 'ping').toString();

  switch (action) {
    case 'addOrder': {
      const order = requestData.order || requestData;
      const customerName = (order.customerName || order.customer_name || '').toString().trim();
      const phone1 = (order.phone1 || '').toString().trim();
      const phone2 = (order.phone2 || '').toString().trim();
      const governorate = (order.governorate || '').toString().trim();
      const branch = (order.branch || 'فرع القاهرة - مصر الجديدة').toString().trim();
      const address = (order.address || '').toString().trim();
      const packageId = (order.packageId || order.package_id || 'offer-1').toString().trim();
      const packageName = (order.packageName || order.package_name || 'باقة الكافيار والصبغة الملكية').toString().trim();
      const packagePrice = parseFloat(order.packagePrice || order.package_price || '500') || 500;
      const addHairWash = Boolean(order.addHairWash || order.add_hair_wash);
      const hairWashPrice = addHairWash ? (parseFloat(order.hairWashPrice || order.hair_wash_price || '100') || 100) : 0;
      const selectedShade = (order.selectedShade || order.selected_shade || '').toString().trim();
      const wonPrize = (order.wonPrize || order.won_prize || '').toString().trim();
      const depositAmount = parseFloat(order.depositAmount || order.deposit_amount || '150') || 150;
      const totalPrice = packagePrice + hairWashPrice;
      const remainingAmount = Math.max(0, totalPrice - depositAmount);
      const notes = (order.notes || '').toString().trim();
      const status = (order.status || 'deposit_pending') as Order['status'];
      const orderCode = (order.orderCode || order.order_code || generateOrderCode()).toString().trim();
      const cairoFormattedDate = (order.cairoFormattedDate || order.cairo_date || formatArabicCairoDateNow()).toString().trim();

      if (!customerName || !phone1) {
        return res.status(400).json({
          status: 'error',
          message: 'الرجاء إدخال اسم العميلة ورقم الهاتف الأساسي',
          data: null
        });
      }

      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        orderCode,
        customerName,
        phone1,
        phone2,
        governorate,
        branch,
        address,
        packageId,
        packageName,
        packagePrice,
        addHairWash,
        hairWashPrice,
        selectedShade,
        wonPrize,
        depositAmount,
        remainingAmount,
        totalPrice,
        notes,
        status,
        cairoFormattedDate,
        createdAt: new Date().toISOString(),
        syncedToGoogleSheet: false
      };

      // Dual Sync: Check Google Sheet URL
      const sheetUrl = currentSettings.googleSheetUrl || process.env.GOOGLE_SHEET_URL;
      let sheetResult = null;
      if (sheetUrl) {
        sheetResult = await forwardOrderToGoogleSheet(sheetUrl, newOrder);
        if (sheetResult.success) {
          newOrder.syncedToGoogleSheet = true;
        }
      }

      ordersStore.unshift(newOrder);

      return res.json({
        status: 'success',
        message: 'تم حفظ الحجز بنجاح',
        data: {
          order: newOrder,
          orderId: newOrder.id,
          syncedToSheet: Boolean(newOrder.syncedToGoogleSheet),
          sheetResult
        },
        timestamp: formatArabicCairoDateNow()
      });
    }

    case 'getOrders': {
      const search = (requestData.search || '').toString().toLowerCase().trim();
      const statusFilter = (requestData.status || '').toString().trim();

      let filtered = [...ordersStore];

      if (search) {
        filtered = filtered.filter(o =>
          (o.customerName || '').toLowerCase().includes(search) ||
          (o.phone1 || '').includes(search) ||
          (o.phone2 || '').includes(search) ||
          (o.orderCode || '').toLowerCase().includes(search) ||
          (o.governorate || '').toLowerCase().includes(search) ||
          (o.branch || '').toLowerCase().includes(search)
        );
      }

      if (statusFilter && statusFilter !== 'all') {
        filtered = filtered.filter(o => o.status === statusFilter);
      }

      return res.json({
        status: 'success',
        message: 'تم جلب الطلبات بنجاح',
        data: filtered,
        timestamp: formatArabicCairoDateNow()
      });
    }

    case 'updateStatus': {
      const orderId = (requestData.orderId || requestData.id || '').toString();
      const newStatus = (requestData.status || '') as Order['status'];

      if (!orderId || !newStatus) {
        return res.status(400).json({
          status: 'error',
          message: 'بيانات غير مكتملة لتحديث الحالة',
          data: null
        });
      }

      const idx = ordersStore.findIndex(o => o.id === orderId || o.orderCode === orderId);
      if (idx >= 0) {
        ordersStore[idx].status = newStatus;
      }

      return res.json({
        status: 'success',
        message: 'تم تحديث حالة الحجز بنجاح',
        data: { orderId, status: newStatus },
        timestamp: formatArabicCairoDateNow()
      });
    }

    case 'getSettings': {
      return res.json({
        status: 'success',
        message: 'تم جلب الإعدادات',
        data: currentSettings,
        timestamp: formatArabicCairoDateNow()
      });
    }

    case 'updateSettings': {
      const newSettings = requestData.settings || requestData;
      currentSettings = {
        ...currentSettings,
        ...newSettings
      };

      return res.json({
        status: 'success',
        message: 'تم حفظ الإعدادات بنجاح',
        data: currentSettings,
        timestamp: formatArabicCairoDateNow()
      });
    }

    case 'stats': {
      const stats = calculateStats(ordersStore);
      return res.json({
        status: 'success',
        message: 'تم احتساب الإحصائيات',
        data: stats,
        timestamp: formatArabicCairoDateNow()
      });
    }

    case 'testGoogleSheet': {
      const url = (requestData.googleSheetUrl || currentSettings.googleSheetUrl || '').toString().trim();
      if (!url) {
        return res.status(400).json({
          status: 'error',
          message: 'الرجاء إدخال رابط Google Apps Script Web App',
          data: null
        });
      }

      const testPayload = {
        orderCode: 'TEST-' + Math.floor(100 + Math.random() * 900),
        cairoFormattedDate: formatArabicCairoDateNow(),
        customerName: 'طلب تجريبي - اختبار الاتصال',
        phone1: currentSettings.whatsappDepositNumber || '01286886296',
        governorate: 'القاهرة',
        branch: 'فرع القاهرة - مصر الجديدة',
        packageName: 'باقة تجريبية لاختبار جوجل شيت',
        packagePrice: 500,
        depositAmount: 150,
        remainingAmount: 350,
        totalPrice: 500,
        status: 'new'
      };

      const result = await forwardOrderToGoogleSheet(url, testPayload);

      if (result.success) {
        return res.json({
          status: 'success',
          message: 'تم الاتصال بنجاح وتأكيد استجابة Google Sheets!',
          data: result,
          timestamp: formatArabicCairoDateNow()
        });
      } else {
        return res.status(500).json({
          status: 'error',
          message: 'فشل الاتصال برابط جوجل شيت: ' + (result.error || 'خطأ غير معروف'),
          data: result,
          timestamp: formatArabicCairoDateNow()
        });
      }
    }

    case 'ping':
    default: {
      return res.json({
        status: 'success',
        message: 'API is running properly',
        data: {
          server: 'Beauty Salon Aya Haboula Node.js Dual-Engine API',
          time: formatArabicCairoDateNow(),
          database: 'in_memory_persistence',
          ordersCount: ordersStore.length
        },
        timestamp: formatArabicCairoDateNow()
      });
    }
  }
}

async function startServer() {
  const app = express();

  // Basic Body Parsers and CORS
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Serve static files from public directory
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Dual-Engine API Route: Handle /api.php requests (for frontend compatibility)
  app.all('/api.php', handleApiRequest);

  // Modern REST routes: /api/orders, /api/settings, etc.
  app.all('/api/orders', handleApiRequest);
  app.all('/api/settings', handleApiRequest);
  app.all('/api/stats', handleApiRequest);
  app.all('/api/test-sheet', (req, res) => {
    req.body = { ...req.body, action: 'testGoogleSheet' };
    return handleApiRequest(req, res);
  });

  // AI Beauty Consultant Endpoint using Gemini API
  app.post('/api/consultant', async (req: Request, res: Response) => {
    try {
      const { userQuestion, hairType, desiredColor } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        // Fallback beauty advice if Gemini API key not yet configured
        return res.json({
          advice: 'أهلاً بكِ في بيوتي سنتر آية هبولة! باقة ترتمنت الأرجان مع الصبغة هي الاختيار الأفضل لمعالجة التقصف ومنح الشعر مظهر حريري لامع. كما يمكنكِ استشارة خبيرتنا المتواجدة في الفرع لتحديد درجة اللون المناسبة لدرجة بشرتك.',
          isAiGenerated: false
        });
      }

      const prompt = `أنتِ مستشارة تجميل وعناية بالشعر محترفة في بيوتي سنتر آية هبولة (Beauty Salon Aya Haboula) في مصر.
تفاصيل العميلة:
- نوع الشعر والمشكلة: ${hairType || 'غير محدد'}
- اللون أو الدرجة المرغوبة: ${desiredColor || 'غير محدد'}
- سؤال العميلة: ${userQuestion || 'ما هي أفضل باقة مناسبة لي من عروض الكافيار وترتمنت الأرجان؟'}

عروض الصالون الحالية لمدة 4 أيام:
1. باقة الكافيار والصبغة الملكية (500 جنيه): جلسة كافيار ترميم وتغذية مكثفة + صبغة لون واحد + مجموعة الشامبو والبلسم مجاناً.
2. باقة ترتمنت الأرجان والصبغة الذهبية (999 جنيه): ترتمنت الأرجان النقي للفرد واللمعان + صبغة فاخرة + مجموعة العناية بالأرجان مجاناً.
بالإضافة لساعة الحظ وسحب فوري على هدايا مجانية (رموش، أظافر شي إن، تنظيف بشرة، وغيرها).

قدمي إجابة باللغة العربية الودودة بلهجة مصرية مهذبة ومشجعة ومختصرة (3-4 فقرات قصيرة) مع ترشيح الباقة الأنسب ونصحها بالحجز للاستفادة من عربون 150 ج.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      return res.json({
        advice: response.text || 'يسعدنا خدمتكِ في بيوتي سنتر آية هبولة!',
        isAiGenerated: true
      });
    } catch (error: any) {
      console.warn('Gemini Consultant error:', error?.message);
      return res.json({
        advice: 'أهلاً بكِ في بيوتي سنتر آية هبولة! ننصحك بحجز باقة ترتمنت الأرجان أو الكافيار والاستفادة من خصم الـ 58% الحالي. خبيراتنا جاهزات لاستقبالك في فروع الإسماعيلية والقاهرة وجسر السويس.',
        isAiGenerated: false
      });
    }
  });

  // Vite middleware for development vs Static file serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
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
    console.log(`✨ Beauty Salon Aya Haboula server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
