/**
 * ==============================================================================
 * صالون آية هبولة - كود Google Apps Script لمزامنة الشيت التلقائية (Code.gs)
 * ==============================================================================
 * الصق هذا الكود في Google Sheets -> Extensions -> Apps Script
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'الخادم مشغول جداً، يرجى إعادة المحاولة'
    })).setMimeType(ContentService.MimeType.JSON);
  }

  try {
    var rawPostData = e.postData ? e.postData.contents : '';
    var postData = {};
    if (rawPostData) {
      try {
        postData = JSON.parse(rawPostData);
      } catch (jsonErr) {
        postData = e.parameter || {};
      }
    } else {
      postData = e.parameter || {};
    }

    var action = postData.action || 'ping';
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'addOrder') {
      var order = postData.order || postData;
      var sheet = getOrCreateOrdersSheet(ss);

      var orderCode = String(order.orderCode || order.order_code || ('AYA-' + Math.floor(10000 + Math.random() * 90000)));
      var cairoDate = String(order.cairoFormattedDate || order.cairo_date || formatArabicCairoDateNow());
      var customerName = String(order.customerName || order.customer_name || '').trim();
      var phone1 = String(order.phone1 || '').trim();
      var phone2 = String(order.phone2 || '').trim();
      var branch = String(order.branch || 'فرع القاهرة - مصر الجديدة');
      var governorate = String(order.governorate || 'القاهرة');
      var address = String(order.address || '');
      var packageName = String(order.packageName || order.package_name || 'باقة الكافيار والصبغة الملكية');
      var packagePrice = Number(order.packagePrice || order.package_price) || 500;
      var addHairWash = (order.addHairWash || order.add_hair_wash) ? 'نعم (+100 ج)' : 'لا';
      var selectedShade = String(order.selectedShade || order.selected_shade || '-');
      var wonPrize = String(order.wonPrize || order.won_prize || '-');
      var depositAmount = Number(order.depositAmount || order.deposit_amount) || 150;
      var remainingAmount = Number(order.remainingAmount || order.remaining_amount) || 0;
      var totalPrice = Number(order.totalPrice || order.total_price) || 500;
      var status = String(order.status || 'deposit_pending');
      var notes = String(order.notes || '');

      var statusAr = 'بانتظار تحويل العربون (150 ج)';
      if (status === 'confirmed') statusAr = 'مؤكد - تم استلام العربون';
      else if (status === 'completed') statusAr = 'مكتمل - حضرت الجلسة';
      else if (status === 'cancelled') statusAr = 'ملغي';

      var newRow = [
        orderCode,
        cairoDate,
        customerName,
        "'" + phone1,
        phone2 ? ("'" + phone2) : '-',
        branch,
        governorate,
        address,
        packageName,
        packagePrice,
        addHairWash,
        selectedShade,
        wonPrize,
        depositAmount,
        remainingAmount,
        totalPrice,
        statusAr,
        notes
      ];

      sheet.appendRow(newRow);

      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'تم تسجيل الحجز بنجاح في الشيت',
        orderCode: orderCode,
        cairoDate: cairoDate
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'getOrders') {
      var orders = getOrdersFromSheet(ss);
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        data: orders
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'شيت صالون آية هبولة متصل ويعمل بنجاح'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'Google Apps Script Webhook جاهز لاستقبال الطلبات',
    time: formatArabicCairoDateNow()
  })).setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateOrdersSheet(ss) {
  var sheet = ss.getSheetByName('الطلبات والحجوزات');
  if (!sheet) sheet = ss.getSheetByName('Orders');
  if (!sheet) {
    sheet = ss.insertSheet('الطلبات والحجوزات');
    var headers = [
      'كود الحجز',
      'تاريخ الحجز (توقيت القاهرة)',
      'اسم العميلة',
      'رقم الهاتف الأساسي',
      'رقم هاتف بديل',
      'الفرع المختار',
      'المحافظة',
      'العنوان بالتفصيل',
      'الباقة المختارة',
      'سعر الباقة (ج)',
      'غسيل شعر احترافي',
      'درجة الصبغة المختارة',
      'جائزة ساعة الحظ',
      'عربون إنستاباي (ج)',
      'المتبقي بالصالون (ج)',
      'الإجمالي الكلي (ج)',
      'حالة الحجز',
      'ملاحظات إضافية'
    ];
    sheet.appendRow(headers);
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#FF6600');
    headerRange.setFontColor('#FFFFFF');
    headerRange.setFontWeight('bold');
    headerRange.setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getOrdersFromSheet(ss) {
  var sheet = ss.getSheetByName('الطلبات والحجوزات') || ss.getSheetByName('Orders');
  if (!sheet) return [];
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];

  var data = sheet.getRange(2, 1, lastRow - 1, 18).getValues();
  var orders = [];

  for (var i = data.length - 1; i >= 0; i--) {
    var row = data[i];
    var orderCode = String(row[0] || '').trim();
    if (!orderCode) continue;

    orders.push({
      id: 'gs-' + (i + 2),
      orderCode: orderCode,
      cairoFormattedDate: String(row[1] || ''),
      customerName: String(row[2] || ''),
      phone1: String(row[3] || ''),
      phone2: String(row[4] || ''),
      branch: String(row[5] || ''),
      governorate: String(row[6] || ''),
      address: String(row[7] || ''),
      packageName: String(row[8] || ''),
      packagePrice: Number(row[9]) || 500,
      addHairWash: String(row[10] || '').indexOf('نعم') !== -1,
      selectedShade: String(row[11] || ''),
      wonPrize: String(row[12] || ''),
      depositAmount: Number(row[13]) || 150,
      remainingAmount: Number(row[14]) || 0,
      totalPrice: Number(row[15]) || 500,
      status: String(row[16] || 'deposit_pending'),
      notes: String(row[17] || ''),
      syncedToGoogleSheet: true
    });
  }
  return orders;
}

function formatArabicCairoDateNow() {
  var d = new Date();
  var cairoOffset = 2 * 60; // UTC+2
  var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
  var cairoDate = new Date(utc + (cairoOffset * 60000));

  var days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  var months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

  var dayName = days[cairoDate.getDay()];
  var dayNum = cairoDate.getDate();
  var monthName = months[cairoDate.getMonth()];
  var year = cairoDate.getFullYear();

  var hours = cairoDate.getHours();
  var minutes = cairoDate.getMinutes();
  var ampm = hours >= 12 ? 'م' : 'ص';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;

  return dayName + '، ' + dayNum + ' ' + monthName + ' ' + year + ' - ' + hours + ':' + minutes + ' ' + ampm;
}
