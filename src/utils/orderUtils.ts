import { Order, StoreSettings } from '../types';
import { trackPixelEvent, trackContactWhatsApp } from './pixelManager';

/**
 * Generate formatted WhatsApp message for customer order confirmation
 */
export function generateWhatsAppOrderMessage(order: Order, settings: StoreSettings): string {
  const depositText = `${order.depositAmount} ${settings.currency}`;
  const remainingText = `${order.remainingAmount} ${settings.currency}`;
  const hairWashText = order.addHairWash ? `نعم (+${order.hairWashPrice} ${settings.currency})` : 'لا';
  const prizeText = order.wonPrize ? `🎁 جائزة ساعة حظ هبولة: *${order.wonPrize}*` : '';

  const message = `✨ *طلب حجز موعد - بيوتي سنتر آية هبولة* ✨
--------------------------------
👑 *كود الحجز:* ${order.orderCode}
📅 *تاريخ الحجز:* ${order.cairoFormattedDate}
--------------------------------
👤 *اسم العميلة:* ${order.customerName}
📱 *رقم الهاتف:* ${order.phone1} ${order.phone2 ? `\n📞 *هاتف إضافي:* ${order.phone2}` : ''}
📍 *الفرع المختار:* ${order.branch}
🏡 *المحافظة والعنوان:* ${order.governorate} - ${order.address}
--------------------------------
🎀 *تفاصيل العرض المختار:*
📦 *الباقة:* ${order.packageName} (${order.packagePrice} ${settings.currency})
💇‍♀️ *غسيل الشعر:* ${hairWashText}
🎨 *درجة الصبغة:* ${order.selectedShade || 'سيتم تحديدها بالفرع'}
${prizeText}
--------------------------------
💰 *تفاصيل الحساب والعربون:*
💵 *الإجمالي الكلي:* ${order.totalPrice} ${settings.currency}
💳 *مبلغ العربون المحول (إنستاباي):* ${depositText}
🏷️ *المبلغ المتبقي عند الحضور:* ${remainingText}
${order.notes ? `📝 *ملاحظات:* ${order.notes}\n` : ''}--------------------------------
⚠️ *برجاء إرفاق صورة إيصال التحويل مع هذه الرسالة لتأكيد الحجز فوراً وتثبيت الميعاد.* شكراً لاختيارك بيوتي سنتر آية هبولة 🤍`;

  return message;
}

/**
 * Open WhatsApp with pre-filled message
 */
export function openWhatsAppConfirmation(order: Order, settings: StoreSettings) {
  trackContactWhatsApp(order.orderCode);
  const text = encodeURIComponent(generateWhatsAppOrderMessage(order, settings));
  const cleanPhone = settings.whatsappNumber.replace(/[^0-9]/g, '');
  const url = `https://wa.me/${cleanPhone}?text=${text}`;
  window.open(url, '_blank');
}

/**
 * Trigger Facebook Pixel Events safely
 */
export function trackFacebookEvent(eventName: string, params?: Record<string, any>) {
  trackPixelEvent(eventName, params);
}

/**
 * Print order receipt / thermal ticket
 */
export function printOrderReceipt(order: Order, settings: StoreSettings) {
  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>بوليصة حجز - ${order.orderCode}</title>
      <style>
        body { font-family: 'Cairo', Tahoma, sans-serif; padding: 25px; color: #222; margin: 0; }
        .receipt { max-width: 480px; margin: 0 auto; border: 2px dashed #ff6600; padding: 20px; border-radius: 12px; }
        .header { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 15px; margin-bottom: 15px; }
        .header h1 { color: #ff6600; margin: 0 0 5px 0; font-size: 24px; }
        .header p { margin: 2px 0; font-size: 13px; color: #666; }
        .badge { background: #ff6600; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: bold; display: inline-block; margin-top: 5px; }
        .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dotted #e5e5e5; font-size: 14px; }
        .row.bold { font-weight: bold; font-size: 15px; }
        .total-box { background: #fff7ed; border: 1px solid #ffedd5; border-radius: 8px; padding: 12px; margin: 15px 0; }
        .footer { text-align: center; font-size: 12px; color: #777; margin-top: 20px; }
        @media print {
          body { padding: 0; }
          .receipt { border: 1px solid #000; }
        }
      </style>
    </head>
    <body>
      <div class="receipt">
        <div class="header">
          <h1>${settings.storeName}</h1>
          <p>إدارة: ${settings.salonOwner} | هاتف: ${settings.whatsappDepositNumber}</p>
          <div class="badge">كود الحجز: ${order.orderCode}</div>
          <p style="margin-top: 8px; font-size: 12px;">${order.cairoFormattedDate}</p>
        </div>

        <div class="row"><span>اسم العميلة:</span> <strong>${order.customerName}</strong></div>
        <div class="row"><span>رقم الهاتف:</span> <strong>${order.phone1}</strong></div>
        ${order.phone2 ? `<div class="row"><span>هاتف إضافي:</span> <strong>${order.phone2}</strong></div>` : ''}
        <div class="row"><span>الفرع:</span> <strong>${order.branch}</strong></div>
        <div class="row"><span>المحافظة / العنوان:</span> <strong>${order.governorate} - ${order.address}</strong></div>

        <div class="total-box">
          <div class="row"><span>العرض المختار:</span> <strong>${order.packageName}</strong></div>
          <div class="row"><span>سعر الباقة:</span> <strong>${order.packagePrice} ${settings.currency}</strong></div>
          <div class="row"><span>غسيل الشعر:</span> <strong>${order.addHairWash ? `+${order.hairWashPrice} ${settings.currency}` : 'لا'}</strong></div>
          ${order.selectedShade ? `<div class="row"><span>درجة الصبغة:</span> <strong>${order.selectedShade}</strong></div>` : ''}
          ${order.wonPrize ? `<div class="row" style="color:#c2410c;"><span>هدية ساعة الحظ:</span> <strong>🎁 ${order.wonPrize}</strong></div>` : ''}
        </div>

        <div class="total-box" style="background:#fef2f2; border-color:#fee2e2;">
          <div class="row bold"><span>الإجمالي الكلي:</span> <span style="color:#c2410c;">${order.totalPrice} ${settings.currency}</span></div>
          <div class="row"><span>العربون المحول (إنستاباي):</span> <strong>${order.depositAmount} ${settings.currency}</strong></div>
          <div class="row bold" style="color:#047857;"><span>المتبقي عند الحضور:</span> <span>${order.remainingAmount} ${settings.currency}</span></div>
        </div>

        ${order.notes ? `<div style="font-size:12px; margin-bottom:10px;"><strong>ملاحظات:</strong> ${order.notes}</div>` : ''}

        <div class="footer">
          <p>⚠️ يرجى إبراز هذا الإيصال أو رسالة الواتساب عند الحضور للفرع.</p>
          <p>شكراً لثقتك في ${settings.storeName} ✨</p>
        </div>
      </div>
      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
