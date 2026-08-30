/**
 * كود الميتا بيكسل الرسمي لصالون آية هبولة
 */
export function getMetaPixelCodeSnippet(pixelId: string = 'YOUR_PIXEL_ID', testEventCode?: string): string {
  const cleanId = (pixelId || '').trim() || 'YOUR_PIXEL_ID';
  const testTrack = testEventCode ? `\nfbq('track', 'PageView', { test_event_code: '${testEventCode}' });` : `\nfbq('track', 'PageView');`;
  return `<!-- Meta Pixel Code for Beauty Salon Aya Haboula -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${cleanId}');${testTrack}
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=${cleanId}&ev=PageView&noscript=1"
/></noscript>
<!-- End Meta Pixel Code -->`;
}
