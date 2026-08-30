/**
 * Complete Google Apps Script (Code.gs) for Beauty Salon Aya Haboula
 * Provides dual-sync webhook engine with concurrency locking and Cairo Arabic formatting
 */

export const GOOGLE_APPS_SCRIPT_FULL_CODE = `/**
 * ==============================================================================
 * Google Apps Script Web App - Beauty Salon Aya Haboula
 * Dual-Engine E-Commerce Order Receiver with Strict Arabic Cairo Time
 * ==============================================================================
 */

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  var lock = LockService.getScriptLock();
  // Wait up to 30 seconds for concurrent requests
  try {
    lock.waitLock(30000);
  } catch (error) {
    return jsonOutput({ status: 'error', message: 'Server busy. Please retry in a few moments.' });
  }

  try {
    var params = {};
    if (e && e.postData && e.postData.contents) {
      try {
        params = JSON.parse(e.postData.contents);
      } catch (err) {
        params = e.parameter || {};
      }
    } else if (e && e.parameter) {
      params = e.parameter;
    }

    var action = params.action || (e && e.parameter ? e.parameter.action : '') || 'ping';

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      ss = SpreadsheetApp.create('طلبات وحجوزات بيوتي سنتر آية هبولة - Aya Haboula Orders');
    }

    initSpreadsheetStructure(ss);

    if (action === 'addOrder') {
      var order = params.order || params;
      var result = addOrderToSheet(ss, order);
      return jsonOutput({ status: 'success', message: 'تم استلام وحفظ الحجز بنجاح في جوجل شيت', data: result });
    } else if (action === 'getOrders') {
      var orders = getOrdersFromSheet(ss);
      return jsonOutput({ status: 'success', data: orders });
    } else if (action === 'updateOrderStatus') {
      var orderCode = params.orderCode || params.order_code;
      var newStatus = params.status;
      var updated = updateOrderStatusInSheet(ss, orderCode, newStatus);
      return jsonOutput({ status: 'success', updated: updated });
    } else if (action === 'getSettings') {
      var settings = getSettingsFromSheet(ss);
      return jsonOutput({ status: 'success', data: settings });
    } else if (action === 'updateSettings') {
      var updatedSettings = updateSettingsInSheet(ss, params.settings || params);
      return jsonOutput({ status: 'success', data: updatedSettings });
    } else {
      return jsonOutput({
        status: 'success',
        message: 'Google Apps Script Web App is connected and active for Beauty Salon Aya Haboula',
        cairoTime: formatArabicCairoDateNow()
      });
    }
  } catch (err) {
    return jsonOutput({ status: 'error', message: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Initialize Sheets and Headers
 */
function initSpreadsheetStructure(ss) {
  var ordersSheet = ss.getSheetByName('Orders') || ss.getSheetByName('الطلبات والحجوزات');
  if (!ordersSheet) {
    ordersSheet = ss.insertSheet('Orders');
    var headers = [
      'كود الحجز',
      'التاريخ والوقت (بتوقيت القاهرة)',
      'اسم العميلة',
      'الهاتف الأساسي',
      'هاتف إضافي',
      'الفرع المختار',
      'المحافظة',
      'العنوان',
      'اسم الباقة',
      'سعر الباقة (ج)',
      'غسيل شعر (+100 ج)',
      'درجة الصبغة',
      'جائزة ساعة الحظ',
      'العربون إنستاباي (ج)',
      'المبلغ المتبقي (ج)',
      'الإجمالي الكلي (ج)',
      'حالة الحجز',
      'ملاحظات إضافية'
    ];
    ordersSheet.appendRow(headers);

    // Format Header Row (Mobinil Orange Theme #FF6600)
    var headerRange = ordersSheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#FF6600');
    headerRange.setFontColor('#FFFFFF');
    headerRange.setFontWeight('bold');
    headerRange.setHorizontalAlignment('center');
    ordersSheet.setFrozenRows(1);
  }

  var settingsSheet = ss.getSheetByName('Settings') || ss.getSheetByName('الإعدادات');
  if (!settingsSheet) {
    settingsSheet = ss.insertSheet('Settings');
    settingsSheet.appendRow(['المفتاح (Key)', 'القيمة (Value)']);
    var setHeader = settingsSheet.getRange(1, 1, 1, 2);
    setHeader.setBackground('#333333');
    setHeader.setFontColor('#FFFFFF');
    setHeader.setFontWeight('bold');

    var defaults = [
      ['store_name', 'Beauty Salon Aya Haboula'],
      ['whatsapp_number', '01286886296'],
      ['instapay_username', '01286886296 / ayanailss'],
      ['deposit_amount', '150'],
      ['hair_wash_price', '100']
    ];
    for (var i = 0; i < defaults.length; i++) {
      settingsSheet.appendRow(defaults[i]);
    }
  }
}

/**
 * Add Order to Google Sheet
 */
function addOrderToSheet(ss, order) {
  var sheet = ss.getSheetByName('Orders') || ss.getSheetByName('الطلبات والحجوزات');
  var dateStr = order.cairoFormattedDate || formatArabicCairoDateNow();
  var orderCode = order.orderCode || ('AYA-' + Math.floor(10000 + Math.random() * 90000));
  var hairWashText = order.addHairWash ? 'نعم (+100 ج)' : 'لا';

  var rowData = [
    orderCode,
    dateStr,
    order.customerName || '',
    order.phone1 || '',
    order.phone2 || '',
    order.branch || 'فرع القاهرة مصر الجديدة',
    order.governorate || 'القاهرة',
    order.address || '',
    order.packageName || 'باقة الكافيار والصبغة الملكية',
    order.packagePrice || 500,
    hairWashText,
    order.selectedShade || '',
    order.wonPrize || 'لم تسحب',
    order.depositAmount || 150,
    order.remainingAmount || (order.totalPrice - 150),
    order.totalPrice || 500,
    order.status || 'في انتظار تأكيد العربون',
    order.notes || ''
  ];

  sheet.appendRow(rowData);
  var lastRow = sheet.getLastRow();
  var newRowRange = sheet.getRange(lastRow, 1, 1, rowData.length);
  newRowRange.setHorizontalAlignment('center');

  return { orderCode: orderCode, row: lastRow, date: dateStr };
}

/**
 * Strict Arabic Cairo Time in Google Apps Script
 */
function formatArabicCairoDateNow() {
  var now = new Date();
  var days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  var months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

  var dayName = days[now.getDay()];
  var dayNum = Utilities.formatDate(now, 'Africa/Cairo', 'd');
  var monthNum = parseInt(Utilities.formatDate(now, 'Africa/Cairo', 'M'), 10) - 1;
  var monthName = months[monthNum] || '';
  var year = Utilities.formatDate(now, 'Africa/Cairo', 'yyyy');
  var timeStr = Utilities.formatDate(now, 'Africa/Cairo', 'hh:mm a');
  timeStr = timeStr.replace('AM', 'ص').replace('PM', 'م');

  return dayName + '، ' + dayNum + ' ' + monthName + ' ' + year + ' - ' + timeStr;
}

function jsonOutput(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
