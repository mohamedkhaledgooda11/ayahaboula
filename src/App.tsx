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
import { getLocalSettings, saveLocalSettings, submitOrderDualEngine } from './utils/storage';
import { trackFacebookEvent } from './utils/orderUtils';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'thankyou' | 'dashboard'>('home');
  const [settings, setSettings] = useState<StoreSettings>(() => getLocalSettings());
  
  // Active booking configuration state
  const [selectedPackageId, setSelectedPackageId] = useState<string>('offer-1');
  const [addHairWash, setAddHairWash] = useState<boolean>(false);
  const [selectedShade, setSelectedShade] = useState<string>('');
  const [wonPrize, setWonPrize] = useState<string>('');
  
  // Last completed order for thank you page
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Unified HTML5 History navigation (No #admin)
  const navigateTo = (tab: 'home' | 'thankyou' | 'dashboard') => {
    setActiveTab(tab);
    if (tab === 'dashboard') {
      if (window.location.pathname !== '/admin') {
        window.history.pushState(null, '', '/admin');
      }
    } else if (tab === 'home') {
      if (window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin')) {
        window.history.pushState(null, '', '/');
      }
    }
  };

  // Sync settings when loaded & check for real /admin path
  useEffect(() => {
    const saved = getLocalSettings();
    setSettings(saved);

    // Initial pageview tracking
    trackFacebookEvent('PageView');

    const handleLocationChange = () => {
      const path = window.location.pathname;
      if (path === '/admin' || path.startsWith('/admin')) {
        setActiveTab('dashboard');
      } else if (path === '/' || path === '') {
        setActiveTab(prev => (prev === 'dashboard' ? 'home' : prev));
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
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
      setActiveTab('thankyou');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error submitting order', err);
      // Fallback display
      setLastOrder(newOrder);
      setActiveTab('thankyou');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSettings = (newSettings: StoreSettings) => {
    setSettings(newSettings);
    saveLocalSettings(newSettings);
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
        onAdminClick={() => navigateTo('dashboard')}
      />

    </div>
  );
}

