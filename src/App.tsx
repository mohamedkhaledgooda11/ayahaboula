import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CompactHero } from './components/CompactHero';
import { ProductGallery } from './components/ProductGallery';
import { PackageSelector } from './components/PackageSelector';
import { ShadesSelector } from './components/ShadesSelector';
import { GiftSelector } from './components/GiftSelector';
import { FeaturesAndBenefits } from './components/FeaturesAndBenefits';
import { OrderForm } from './components/OrderForm';
import { ReviewsSection } from './components/ReviewsSection';
import { FloatingWidgets } from './components/FloatingWidgets';
import { ThankYouPage } from './components/ThankYouPage';
import { DashboardPage } from './components/DashboardPage';
import { Footer } from './components/Footer';
import { DEFAULT_STORE_SETTINGS, PACKAGE_OFFERS } from './data/constants';
import { Order, StoreSettings } from './types';
import { getLocalSettings, saveLocalSettings, submitOrderDualEngine, getLastSavedOrder, fetchServerSettings } from './utils/storage';
import { initMetaPixel, trackPageView } from './utils/pixelManager';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'thankyou' | 'dashboard'>('home');
  const [settings, setSettings] = useState<StoreSettings>(() => getLocalSettings());
  
  // Active booking configuration state
  const [selectedPackageId, setSelectedPackageId] = useState<string>('offer-1');
  const [addHairWash, setAddHairWash] = useState<boolean>(false);
  const [selectedShade, setSelectedShade] = useState<string>('');
  const [wonPrize, setWonPrize] = useState<string>('');
  
  // Last completed order for thank you page
  const [lastOrder, setLastOrder] = useState<Order | null>(() => getLastSavedOrder());
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Unified HTML5 History navigation (/admin, /thankyou, /)
  const navigateTo = (tab: 'home' | 'thankyou' | 'dashboard') => {
    setActiveTab(tab);
    if (tab === 'dashboard') {
      if (window.location.pathname !== '/admin') {
        window.history.pushState(null, '', '/admin');
      }
      trackPageView('Dashboard');
    } else if (tab === 'thankyou') {
      if (window.location.pathname !== '/thankyou') {
        window.history.pushState(null, '', '/thankyou');
      }
      trackPageView('ThankYou');
    } else if (tab === 'home') {
      if (window.location.pathname !== '/') {
        window.history.pushState(null, '', '/');
      }
      trackPageView('Home');
    }
  };

  // Sync settings when loaded & check for real URL paths
  useEffect(() => {
    const saved = getLocalSettings();
    setSettings(saved);

    // Initialize Meta Pixel with saved Pixel ID & Test Event Code
    if (saved.metaPixelId) {
      initMetaPixel(saved.metaPixelId, saved.metaTestEventCode);
    }
    trackPageView(activeTab === 'dashboard' ? 'Dashboard' : activeTab === 'thankyou' ? 'ThankYou' : 'Home');

    // جلب أحدث الإعدادات المحدثة من الباك إند والسيرفر فوراً
    fetchServerSettings().then(serverSettings => {
      if (serverSettings) {
        setSettings(serverSettings);
        if (serverSettings.metaPixelId) {
          initMetaPixel(serverSettings.metaPixelId, serverSettings.metaTestEventCode);
        }
      }
    }).catch(() => {});

    const handleLocationChange = () => {
      // If user arrives via legacy hash /#admin or #admin, rewrite URL to /admin cleanly
      if (window.location.hash.includes('admin')) {
        window.history.replaceState(null, '', '/admin');
        setActiveTab('dashboard');
        return;
      }
      const path = window.location.pathname;
      if (path === '/admin' || path.startsWith('/admin')) {
        setActiveTab('dashboard');
      } else if (path === '/thankyou' || path.startsWith('/thankyou')) {
        setActiveTab('thankyou');
        if (!lastOrder) {
          const recent = getLastSavedOrder();
          if (recent) setLastOrder(recent);
        }
      } else if (path === '/' || path === '') {
        setActiveTab(prev => (prev === 'dashboard' ? 'home' : prev));
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);

    // Secret shortcut for store owner to access dashboard without public button: Ctrl + Shift + A
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        navigateTo(activeTab === 'dashboard' ? 'home' : 'dashboard');
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelectPackageAndScroll = (packageId: string) => {
    setSelectedPackageId(packageId);
    scrollToBookingForm();
  };

  const handleSelectPackageSync = (packageId: string) => {
    setSelectedPackageId(packageId);
  };

  const scrollToBookingForm = () => {
    setActiveTab('home');
    setTimeout(() => {
      const el = document.getElementById('order-form-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const scrollToLuckyClock = () => {
    setActiveTab('home');
    setTimeout(() => {
      const el = document.getElementById('lucky-clock-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const handlePrizeWon = (prizeName: string) => {
    setWonPrize(prizeName);
  };

  const handleSubmitOrder = async (newOrder: Order) => {
    setIsSubmitting(true);
    try {
      const result = await submitOrderDualEngine(newOrder, settings);
      setLastOrder(result.order);
      navigateTo('thankyou');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error submitting order', err);
      // Fallback display
      setLastOrder(newOrder);
      navigateTo('thankyou');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSettings = (newSettings: StoreSettings) => {
    setSettings(newSettings);
    saveLocalSettings(newSettings);
    if (newSettings.metaPixelId) {
      initMetaPixel(newSettings.metaPixelId, newSettings.metaTestEventCode);
    }
  };

  const selectedPkg = PACKAGE_OFFERS.find(p => p.id === selectedPackageId) || PACKAGE_OFFERS[0];
  const currentTotalPrice = selectedPkg.price + (addHairWash ? settings.hairWashPrice : 0);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-['Cairo',sans-serif]">
      
      {/* Global Header */}
      <Header
        settings={settings}
        activeTab={activeTab}
        setActiveTab={navigateTo}
        onSpinClick={scrollToLuckyClock}
        onBookClick={scrollToBookingForm}
      />

      {/* Dynamic View Routing */}
      <main className="flex-1 pb-16 sm:pb-0">
        {activeTab === 'home' && (
          <>
            {/* 1. Compact Hero Section */}
            <CompactHero
              settings={settings}
              selectedPackageId={selectedPackageId}
              onSelectPackage={handleSelectPackageSync}
              onBookClick={scrollToBookingForm}
              onSpinClick={scrollToLuckyClock}
            />

            {/* 2. Interactive Video & Service Gallery */}
            <ProductGallery 
              selectedPackageId={selectedPackageId}
              onSelectPackage={handleSelectPackageSync} 
            />

            {/* 3. Package & Offer Selector */}
            <PackageSelector
              selectedPackageId={selectedPackageId}
              onSelectPackage={handleSelectPackageSync}
              addHairWash={addHairWash}
              onToggleHairWash={setAddHairWash}
              settings={settings}
            />

            {/* 4. Hair Color Shade Selector */}
            <ShadesSelector
              selectedShade={selectedShade}
              onSelectShade={setSelectedShade}
            />

            {/* 5. Haboula Lucky Clock (ساعة حظ هبولة) */}
            <GiftSelector
              wonPrize={wonPrize}
              onPrizeWon={handlePrizeWon}
            />

            {/* 6. Features and Benefits */}
            <FeaturesAndBenefits />

            {/* 7. Fast High-Conversion Order Form with integrated Shade selector, Hair Wash & Disclaimer */}
            <OrderForm
              selectedPackageId={selectedPackageId}
              addHairWash={addHairWash}
              onToggleHairWash={setAddHairWash}
              selectedShade={selectedShade}
              onSelectShade={setSelectedShade}
              wonPrize={wonPrize}
              settings={settings}
              onSubmitOrder={handleSubmitOrder}
              isSubmitting={isSubmitting}
            />

            {/* 8. Social Proof Reviews Section */}
            <ReviewsSection />

            {/* Floating Quick Action Widgets */}
            <FloatingWidgets
              settings={settings}
              onBookClick={scrollToBookingForm}
              onSpinClick={scrollToLuckyClock}
              selectedPackagePrice={currentTotalPrice}
            />
          </>
        )}

        {activeTab === 'thankyou' && (
          <ThankYouPage
            order={lastOrder}
            settings={settings}
            onBackToHome={() => {
              navigateTo('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardPage
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onBackToHome={() => {
              navigateTo('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      {/* Global Footer */}
      <Footer
        settings={settings}
      />

    </div>
  );
}

