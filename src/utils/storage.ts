import { Order, StoreSettings, DashboardStats } from '../types';
import { DEFAULT_STORE_SETTINGS } from '../data/constants';
import { formatArabicCairoDateNow } from './dateFormatter';

const ORDERS_STORAGE_KEY = 'beauty_salon_aya_orders';
const SETTINGS_STORAGE_KEY = 'beauty_salon_aya_settings';

/**
 * Get Saved Settings
 */
export function getLocalSettings(): StoreSettings {
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_STORE_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn('Failed to parse local settings', e);
  }
  return DEFAULT_STORE_SETTINGS;
}

/**
 * Save Settings Locally
 */
export function saveLocalSettings(settings: StoreSettings) {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save local settings', e);
  }
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
 * Dual-Engine Order Submission:
 * 1. Submit to PHP Backend (api.php) -> inserts MySQL & cURL forwards to Google Sheets
 * 2. Fallback: If api.php is offline, direct fetch to Google Sheets with mode: 'no-cors'
 * 3. Always stores in LocalStorage so no order is ever lost
 */
export async function submitOrderDualEngine(order: Order, settings: StoreSettings): Promise<{ success: boolean; order: Order; syncedToSheet: boolean }> {
  // Ensure strict Cairo formatted date
  if (!order.cairoFormattedDate) {
    order.cairoFormattedDate = formatArabicCairoDateNow();
  }

  // 1. Always save locally immediately
  saveLocalOrder(order);

  let backendSuccess = false;
  let sheetSynced = false;

  // 2. Try PHP Backend API
  try {
    const response = await fetch('/api.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'addOrder',
        order: order
      })
    });

    if (response.ok) {
      const resData = await response.json();
      if (resData.status === 'success') {
        backendSuccess = true;
        sheetSynced = resData.data?.syncedToSheet || false;
      }
    }
  } catch (err) {
    console.warn('PHP API request failed or in offline mode, engaging fallback sync:', err);
  }

  // 3. Fallback direct Google Sheet sync if not yet synced and URL is configured
  if (!sheetSynced && settings.googleSheetUrl) {
    try {
      await fetch(settings.googleSheetUrl, {
        method: 'POST',
        mode: 'no-cors', // Direct browser to Google Sheets fallback
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
 * Fetch Orders (from API or local cache)
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
    console.log('Using local cached orders');
  }

  return getLocalOrders();
}

/**
 * Update Order Status
 */
export async function updateOrderStatus(orderId: string, newStatus: Order['status']): Promise<boolean> {
  // Update local
  const current = getLocalOrders();
  const updated = current.map(o => o.id === orderId || o.orderCode === orderId ? { ...o, status: newStatus } : o);
  localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));

  // Try API
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
    return true;
  }
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
