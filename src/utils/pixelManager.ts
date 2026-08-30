/**
 * ==============================================================================
 * صالون آية هبولة - مدير تتبع فيسبوك / ميتا بيكسل (Meta Pixel Tracker)
 * ==============================================================================
 * يدير تهيئة البيكسل وتحديث المعرّف (Pixel ID) ديناميكياً وتتبع كافة الأحداث:
 * - PageView (زيارة الصفحة)
 * - ViewContent (مشاهدة العروض)
 * - InitiateCheckout (بدء عملية الحجز)
 * - Purchase (الشراء وتأكيد الحجز في صفحة thankyou)
 * - Lead (تسجيل عميلة جديدة)
 * - Contact (التواصل عبر واتساب)
 */

import { Order } from '../types';

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
    __currentMetaPixelId?: string;
    __currentMetaTestCode?: string;
  }
}

export interface PixelEventLog {
  id: string;
  eventName: string;
  pixelId: string;
  cairoTime: string;
  params?: Record<string, any>;
  status: 'success' | 'warning' | 'error';
  message: string;
}

const PIXEL_LOGS_STORAGE_KEY = 'beauty_salon_aya_pixel_logs';

/**
 * جلب سجل الأحداث المحفوظة محلياً للمعاينة في لوحة التحكم
 */
export function getPixelLogs(): PixelEventLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PIXEL_LOGS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    // Ignore
  }
  return [];
}

/**
 * تسجيل حدث في سجل الأحداث المحلي وإرسال إشعار للمكونات
 */
function recordPixelLog(log: Omit<PixelEventLog, 'id' | 'cairoTime'>): void {
  if (typeof window === 'undefined') return;
  try {
    const now = new Date();
    const cairoTime = now.toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });

    const newEntry: PixelEventLog = {
      id: 'pxl-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      cairoTime,
      ...log
    };

    const currentLogs = getPixelLogs();
    const updated = [newEntry, ...currentLogs].slice(0, 30); // الاحتفاظ بآخر 30 حدث
    localStorage.setItem(PIXEL_LOGS_STORAGE_KEY, JSON.stringify(updated));

    // إرسال تنبيه بالحدث عبر CustomEvent لكي تتحدث لوحة الإدارة فوراً دون إعادة تحميل
    window.dispatchEvent(new CustomEvent('meta_pixel_event_logged', { detail: newEntry }));

    // تسجيل غير معطل (Non-blocking) في الباك إند
    try {
      fetch('/api/pixel-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry)
      }).catch(() => {});
    } catch (_) {}
  } catch (e) {
    console.warn('Failed to record pixel log', e);
  }
}

/**
 * تفريغ سجل أحداث البيكسل
 */
export function clearPixelLogs(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(PIXEL_LOGS_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('meta_pixel_event_logged', { detail: null }));
  } catch (e) {}
}

/**
 * دالة حقن وتشغيل كود الميتا بيكسل الرسمي
 */
export function injectMetaPixelScript(): void {
  if (typeof window === 'undefined') return;

  if (!window.fbq) {
    /* eslint-disable */
    (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = !0;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e);
      t.async = !0;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
  }
}

/**
 * تهيئة البيكسل باستخدام المعرف المحدد مع دعم كود اختبار الأحداث
 */
export function initMetaPixel(pixelId: string, testEventCode?: string): boolean {
  if (typeof window === 'undefined') return false;

  const cleanId = (pixelId || '').trim().replace(/[^0-9]/g, '');
  if (!cleanId) {
    return false;
  }

  injectMetaPixelScript();

  try {
    if (testEventCode) {
      window.__currentMetaTestCode = testEventCode.trim();
    }

    if (window.__currentMetaPixelId !== cleanId) {
      window.fbq('init', cleanId);
      window.__currentMetaPixelId = cleanId;
      console.log(`[Meta Pixel] ✅ Initialized successfully with ID: ${cleanId}`);

      recordPixelLog({
        eventName: 'init',
        pixelId: cleanId,
        params: { testEventCode: testEventCode || null },
        status: 'success',
        message: `تمت تهيئة البيكسل بنجاح برقم: ${cleanId}`
      });
    }
    return true;
  } catch (e: any) {
    console.warn('[Meta Pixel] Init error:', e);
    recordPixelLog({
      eventName: 'init_error',
      pixelId: cleanId,
      status: 'error',
      message: `خطأ في تهيئة البيكسل: ${e?.message || e}`
    });
    return false;
  }
}

/**
 * تتبع حدث عام في الميتا بيكسل
 */
export function trackPixelEvent(eventName: string, params?: Record<string, any>): void {
  if (typeof window === 'undefined') return;

  injectMetaPixelScript();

  // الحصول على المعرف الحالي إن وجد
  const currentPixelId = window.__currentMetaPixelId || (function() {
    try {
      const raw = localStorage.getItem('beauty_salon_aya_settings');
      if (raw) {
        const parsed = JSON.parse(raw);
        return (parsed?.metaPixelId || '').trim().replace(/[^0-9]/g, '');
      }
    } catch(e) {}
    return '';
  })();

  // دمج كود الاختبار test_event_code تلقائياً إن وجد ليظهر في Facebook Events Manager
  const finalParams: Record<string, any> = { ...(params || {}) };
  const activeTestCode = window.__currentMetaTestCode || (function() {
    try {
      const raw = localStorage.getItem('beauty_salon_aya_settings');
      if (raw) {
        const parsed = JSON.parse(raw);
        return (parsed?.metaTestEventCode || '').trim();
      }
    } catch(e) {}
    return '';
  })();

  if (activeTestCode && !finalParams.test_event_code) {
    finalParams.test_event_code = activeTestCode;
  }

  try {
    if (typeof window.fbq === 'function') {
      if (Object.keys(finalParams).length > 0) {
        window.fbq('track', eventName, finalParams);
        console.log(`[Meta Pixel Event Fired] ${eventName}`, finalParams);
      } else {
        window.fbq('track', eventName);
        console.log(`[Meta Pixel Event Fired] ${eventName}`);
      }

      recordPixelLog({
        eventName,
        pixelId: currentPixelId || 'لم يتم تحديده بعد',
        params: finalParams,
        status: currentPixelId ? 'success' : 'warning',
        message: currentPixelId
          ? `تم إرسال حدث ${eventName} إلى البيكسل (${currentPixelId})`
          : `تم تشغيل حدث ${eventName} ولكن لم يتم ربط Pixel ID بعد`
      });
    } else {
      console.warn(`[Meta Pixel] fbq function not ready for event: ${eventName}`);
      recordPixelLog({
        eventName,
        pixelId: currentPixelId || 'غير متوفر',
        params: finalParams,
        status: 'warning',
        message: `تم وضع حدث ${eventName} في قائمة الانتظار لعدم اكتمال تحميل fbq`
      });
    }
  } catch (e: any) {
    console.warn(`[Meta Pixel] Failed to track ${eventName}:`, e);
    recordPixelLog({
      eventName,
      pixelId: currentPixelId || 'غير متوفر',
      params: finalParams,
      status: 'error',
      message: `فشل تتبع ${eventName}: ${e?.message || e}`
    });
  }
}

/**
 * 1. تتبع زيارة الصفحة (PageView)
 */
export function trackPageView(pageName?: string): void {
  trackPixelEvent('PageView', pageName ? { page_name: pageName } : undefined);
}

/**
 * 2. تتبع مشاهدة باقة أو عرض (ViewContent)
 */
export function trackViewContent(packageId: string, packageName: string, price: number): void {
  trackPixelEvent('ViewContent', {
    content_ids: [packageId],
    content_name: packageName,
    content_type: 'product',
    value: price,
    currency: 'EGP'
  });
}

/**
 * 3. تتبع بدء ملء استمارة الحجز (InitiateCheckout)
 */
export function trackInitiateCheckout(packageId: string, packageName: string, price: number): void {
  trackPixelEvent('InitiateCheckout', {
    content_ids: [packageId],
    content_name: packageName,
    content_type: 'product',
    value: price,
    currency: 'EGP',
    num_items: 1
  });
}

/**
 * 4. تتبع حدث الشراء الأساسي (Purchase) - يتم تفعيله عند وصول العميلة لصفحة /thankyou
 */
export function trackPurchase(order: Order): void {
  const purchaseData = {
    value: Number(order.totalPrice) || 500,
    currency: 'EGP',
    content_name: order.packageName,
    content_type: 'product',
    content_ids: [order.orderCode, order.packageId || 'offer'],
    num_items: 1,
    order_id: order.orderCode,
    deposit_value: Number(order.depositAmount) || 150
  };

  // حدث الشراء الرئيسي (Purchase)
  trackPixelEvent('Purchase', purchaseData);

  // إرسال حدث Lead أيضاً لضمان التقاط الحملات الإعلانية الموجهة لتوليد العملاء المحتملين
  trackPixelEvent('Lead', {
    content_name: order.packageName,
    value: Number(order.totalPrice) || 500,
    currency: 'EGP',
    order_id: order.orderCode
  });
}

/**
 * 5. تتبع النقر على زر الواتساب لإرسال الإيصال (Contact)
 */
export function trackContactWhatsApp(orderCode: string): void {
  trackPixelEvent('Contact', {
    content_name: 'WhatsApp Receipt Confirmation',
    content_category: 'Customer Support',
    order_id: orderCode
  });
}

/**
 * فحص حالة البيكسل واختبار إرسال حدث تجريبي من لوحة التحكم
 */
export function testMetaPixelConnection(
  pixelId: string,
  testEventCode?: string,
  eventType: 'PageView' | 'Purchase' | 'Lead' = 'PageView'
): { success: boolean; message: string } {
  if (typeof window === 'undefined') {
    return { success: false, message: 'بيئة غير صالحة' };
  }

  const cleanId = (pixelId || '').trim().replace(/[^0-9]/g, '');
  if (!cleanId) {
    return { success: false, message: 'يرجى إدخال معرّف بيكسل صحيح يتكون من أرقام فقط (مثال: 100076153371113)' };
  }

  const inited = initMetaPixel(cleanId, testEventCode);
  if (!inited) {
    return { success: false, message: 'فشل تفعيل كود البيكسل في المتصفح' };
  }

  try {
    if (eventType === 'Purchase') {
      trackPixelEvent('Purchase', {
        value: 600,
        currency: 'EGP',
        content_name: 'باقة الكافيار والصبغة الملكية (طلب تجريبي)',
        content_type: 'product',
        content_ids: ['TEST-AYA-001'],
        num_items: 1,
        order_id: 'TEST-' + Math.floor(10000 + Math.random() * 90000),
        test_mode: true
      });
      return {
        success: true,
        message: `✅ تم إرسال حدث شراء تجريبي (Purchase بقيمة 600 ج) إلى البيكسل (${cleanId}) بنجاح! راجعي Events Manager الآن.`
      };
    } else if (eventType === 'Lead') {
      trackPixelEvent('Lead', {
        content_name: 'باقة ترتمنت الأرجان (تسجيل عميلة تجريبي)',
        value: 999,
        currency: 'EGP',
        test_mode: true
      });
      return {
        success: true,
        message: `✅ تم إرسال حدث عميلة محتملة (Lead) تجريبي إلى البيكسل (${cleanId}) بنجاح!`
      };
    } else {
      trackPixelEvent('PageView', {
        test: true,
        triggered_from: 'dashboard_test',
        cairo_time: new Date().toISOString()
      });
      return {
        success: true,
        message: `✅ تم تفعيل البيكسل (${cleanId}) وإرسال حدث PageView تجريبي بنجاح! راجعي تبويب Test Events في Events Manager.`
      };
    }
  } catch (err: any) {
    return { success: false, message: `خطأ أثناء إرسال الحدث: ${err.message}` };
  }
}

