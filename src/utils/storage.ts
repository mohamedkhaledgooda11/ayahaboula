import { Order, StoreSettings, DashboardStats } from '../types';
import { DEFAULT_STORE_SETTINGS } from '../data/constants';
import { formatArabicCairoDateNow } from './dateFormatter';

const ORDERS_STORAGE_KEY = 'beauty_salon_aya_orders';
const SETTINGS_STORAGE_KEY = 'beauty_salon_aya_settings';

/**
 * دالة مساعدة لتوحيد وضبط مفاتيح الإعدادات القادمة من السيرفر (سواء كانت camelCase أو snake_case)
 */
function normalizeServerSettings(raw: any): StoreSettings {
  if (!raw || typeof raw !== 'object') return DEFAULT_STORE_SETTINGS;

  return {
    storeName: raw.storeName || raw.store_name || DEFAULT_STORE_SETTINGS.storeName,
    salonOwner: raw.salonOwner || raw.salon_owner || DEFAULT_STORE_SETTINGS.salonOwner,
    whatsappNumber: raw.whatsappNumber || raw.whatsapp_number || raw.phone_primary || DEFAULT_STORE_SETTINGS.whatsappNumber,
    whatsappDepositNumber: raw.whatsappDepositNumber || raw.whatsapp_deposit || raw.whatsapp_deposit_number || DEFAULT_STORE_SETTINGS.whatsappDepositNumber,
    instapayUsername: raw.instapayUsername || raw.instapay_username || DEFAULT_STORE_SETTINGS.instapayUsername,
    depositAmount: Number(raw.depositAmount ?? raw.deposit_amount) || DEFAULT_STORE_SETTINGS.depositAmount,
    hairWashPrice: Number(raw.hairWashPrice ?? raw.hair_wash_price) || DEFAULT_STORE_SETTINGS.hairWashPrice,
    facebookUrl: raw.facebookUrl || raw.facebook_url || DEFAULT_STORE_SETTINGS.facebookUrl,
    googleSheetUrl: (raw.googleSheetUrl !== undefined ? raw.googleSheetUrl : raw.google_sheet_url) ?? DEFAULT_STORE_SETTINGS.googleSheetUrl,
    metaPixelId: (raw.metaPixelId !== undefined ? raw.metaPixelId : raw.meta_pixel_id) ?? DEFAULT_STORE_SETTINGS.metaPixelId,
    metaTestEventCode: (raw.metaTestEventCode !== undefined ? raw.metaTestEventCode : raw.meta_test_event_code) ?? (DEFAULT_STORE_SETTINGS.metaTestEventCode || ''),
    adminPasswordPlainText: raw.adminPasswordPlainText || raw.admin_password || DEFAULT_STORE_SETTINGS.adminPasswordPlainText,
    currency: raw.currency || DEFAULT_STORE_SETTINGS.currency,
    daysRemainingText: raw.daysRemainingText || raw.days_remaining_text || DEFAULT_STORE_SETTINGS.daysRemainingText
  };
}

/**
 * جلب الإعدادات المحفوظة محلياً (Fallback فوري للمتصفح)
 */
export function getLocalSettings(): StoreSettings {
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      return normalizeServerSettings(JSON.parse(saved));
    }
  } catch (e) {
    console.warn('Failed to parse local settings', e);
  }
  return DEFAULT_STORE_SETTINGS;
}

/**
 * حفظ الإعدادات في الذاكرة المحلية
 */
export function saveLocalSettings(settings: StoreSettings) {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save local settings', e);
  }
}

/**
 * جلب أحدث الإعدادات الحقيقية من باك إند PHP وقاعدة بيانات MySQL (api.php)
 * ومزامنتها فوراً مع الذاكرة المحلية
 */
export async function fetchServerSettings(): Promise<StoreSettings> {
  let fetchedSettings: StoreSettings | null = null;

  try {
    const res = await fetch('/api.php?action=getSettings', {
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      const json = await res.json();
      if (json && (json.status === 'success' || json.data)) {
        fetchedSettings = normalizeServerSettings(json.data || json);
      }
    }
  } catch (err) {
    console.warn('PHP Backend offline or unavailable, using local cache:', err);
  }

  if (fetchedSettings) {
    saveLocalSettings(fetchedSettings);
    return fetchedSettings;
  }

  return getLocalSettings();
}

/**
 * حفظ الإعدادات في باك إند PHP وقاعدة بيانات MySQL (api.php) والذاكرة المحلية
 */
export async function saveSettingsDualEngine(
  settings: StoreSettings
): Promise<{ success: boolean; data: StoreSettings; message: string }> {
  // 1. حفظ محلي أولاً فوراً لضمان عدم ضياع التعديل في المتصفح
  saveLocalSettings(settings);

  let backendSaved = false;
  let responseData: StoreSettings = settings;
  let statusMessage = '';

  // 2. إرسال إلى باك إند PHP وقاعدة البيانات MySQL (/api.php)
  try {
    const phpRes = await fetch('/api.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'updateSettings',
        settings: settings
      })
    });

    if (phpRes.ok) {
      const phpJson = await phpRes.json();
      if (phpJson.status === 'success') {
        backendSaved = true;
        if (phpJson.data) {
          responseData = normalizeServerSettings(phpJson.data);
          saveLocalSettings(responseData);
        }
      }
    }
  } catch (e) {
    console.warn('PHP MySQL backend save failed:', e);
  }

  if (backendSaved) {
    statusMessage = 'تم الحفظ والتطبيق بنجاح في باك إند PHP وقاعدة بيانات MySQL!';
  } else {
    statusMessage = 'تم الحفظ محلياً بنجاح وسيتم المزامنة التلقائية مع خادم PHP عند الاتصال.';
  }

  return {
    success: true,
    data: responseData,
    message: statusMessage
  };
}

/**
 * Get Local Orders
 */
export function getLocalOrders(): Order[] {
  try {
    const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to get local orders', e);
  }
  return [];
}

/**
 * Get Most Recent Saved Order (for Thank You page)
 */
export function getLastSavedOrder(): Order | null {
  const orders = getLocalOrders();
  return orders.length > 0 ? orders[0] : null;
}

/**
 * Save Order to Local Cache
 */
export function saveLocalOrder(order: Order): Order[] {
  const current = getLocalOrders();
  const existingIdx = current.findIndex(o => o.id === order.id || o.orderCode === order.orderCode);
  let updated: Order[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = order;
  } else {
    updated = [order, ...current];
  }
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save local order', e);
  }
  return updated;
}

/**
 * إرسال وتسجيل الحجز إلى خادم PHP وقاعدة بيانات MySQL (api.php)
 * ومزامنته تلقائياً مع Google Sheets والتخزين المحلي
 */
export async function submitOrderDualEngine(
  order: Order,
  settings: StoreSettings
): Promise<{ success: boolean; order: Order; syncedToSheet: boolean }> {
  // ضبط صيغة التاريخ والوقت العربي بتوقيت القاهرة
  if (!order.cairoFormattedDate) {
    order.cairoFormattedDate = formatArabicCairoDateNow();
  }

  // 1. الحفظ في الذاكرة المحلية أولاً
  saveLocalOrder(order);

  let phpSaved = false;
  let sheetSynced = false;

  // 2. إرسال الطلب مباشرة إلى باك إند PHP (api.php)
  try {
    const response = await fetch('/api.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'addOrder',
        order: order,
        googleSheetUrl: settings.googleSheetUrl || ''
      })
    });

    if (response.ok) {
      const resData = await response.json();
      if (resData.status === 'success') {
        phpSaved = true;
        sheetSynced = resData.data?.syncedToSheet || false;
      }
    }
  } catch (err) {
    console.warn('PHP API request notice:', err);
  }

  // 3. مزامنة مباشرة احتياطية مع Google Sheet إذا كان الرابط مضبوطاً ولم تتم المزامنة بعد
  if (!sheetSynced && settings.googleSheetUrl) {
    try {
      await fetch(settings.googleSheetUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'addOrder',
          order: order
        })
      });
      sheetSynced = true;
    } catch (e) {
      console.warn('Fallback direct sheet sync attempt:', e);
    }
  }

  const finalOrder: Order = {
    ...order,
    syncedToGoogleSheet: sheetSynced
  };
  saveLocalOrder(finalOrder);

  return {
    success: true,
    order: finalOrder,
    syncedToSheet: sheetSynced
  };
}

/**
 * جلب قائمة الحجوزات من خادم PHP وقاعدة بيانات MySQL (api.php)
 */
export async function fetchAllOrders(): Promise<Order[]> {
  try {
    const res = await fetch('/api.php?action=getOrders');
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'success' && Array.isArray(data.data) && data.data.length > 0) {
        return data.data;
      }
    }
  } catch (e) {
    console.log('Using local cached orders due to network offline');
  }

  return getLocalOrders();
}

/**
 * تحديث حالة الحجز في خادم PHP وقاعدة البيانات MySQL (api.php)
 */
export async function updateOrderStatus(orderId: string, newStatus: Order['status']): Promise<boolean> {
  // تحديث محلي فوري
  const current = getLocalOrders();
  const updated = current.map(o => o.id === orderId || o.orderCode === orderId ? { ...o, status: newStatus } : o);
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));

  // تحديث في خادم PHP
  try {
    await fetch('/api.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'updateStatus',
        orderId,
        status: newStatus
      })
    });
    return true;
  } catch (e) {
    console.warn('Could not update status on PHP server', e);
  }
  return true;
}
  return true;
}

/**
 * Calculate Dashboard Stats
 */
export function calculateStats(orders: Order[]): DashboardStats {
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

