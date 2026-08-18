'use client';

import React, { useState } from 'react';
import Navbar from './components/Navbar';
import SakuraFalling from './components/SakuraFalling';
import HeroBanner from './components/HeroBanner';
import FeaturesBar from './components/FeaturesBar';
import AccountDataSection from './components/AccountDataSection';
import NominalSection from './components/NominalSection';
import PaymentSection from './components/PaymentSection';
import PromoBannerSection from './components/PromoBannerSection';
import TestimonialSection from './components/TestimonialSection';
import OrderSummaryBar from './components/OrderSummaryBar';
import Footer from './components/Footer';
import { ROBUX_PRICELIST, RobuxItem } from './components/data';

export default function Home() {
  // State for topup process
  const [username, setUsername] = useState('');
  const [selectedItem, setSelectedItem] = useState<RobuxItem | null>(ROBUX_PRICELIST[1]); // Default 2200 Robux Promo
  const [paymentChannel, setPaymentChannel] = useState<'website' | 'whatsapp'>('website');
  const [cart, setCart] = useState<RobuxItem[]>([]);
  const [isOpenCart, setIsOpenCart] = useState(false);

  // Cart operations
  const handleAddToCart = (item: RobuxItem) => {
    setCart((prev) => [...prev, item]);
  };

  const handleRemoveFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#fff7fa] text-[#2d1822]">
      
      {/* 🌸 Sakura Falling Effect Overlay */}
      <SakuraFalling />

      {/* 🧭 Navbar */}
      <Navbar
        cartCount={cart.length}
        onOpenCart={() => setIsOpenCart(true)}
      />

      <main className="flex-1 w-full space-y-4 pb-28">
        {/* 🌟 Hero Promo Banner with Countdown */}
        <HeroBanner />

        {/* ⚡ Features & Guarantees Bar */}
        <FeaturesBar />

        {/* 👤 Step 1: Input Account Data */}
        <AccountDataSection
          username={username}
          onChangeUsername={setUsername}
        />

        {/* 💎 Step 2: Choose Robux Nominal (Pricelist) */}
        <NominalSection
          selectedItem={selectedItem}
          onSelectItem={(item) => setSelectedItem(item)}
          onAddToCart={handleAddToCart}
        />

        {/* 💳 Step 3: Choose Payment Channel (Website QRIS vs WhatsApp) */}
        <PaymentSection
          paymentChannel={paymentChannel}
          onChangeChannel={setPaymentChannel}
        />

        {/* 💖 Value Props & Process Showcase */}
        <PromoBannerSection />

        {/* ⭐ Step 4: Member Reviews & Submission Form */}
        <TestimonialSection />
      </main>

      {/* 🛒 Sticky Summary & Checkout QRIS/Proof Drawer */}
      <OrderSummaryBar
        username={username}
        selectedItem={selectedItem}
        paymentChannel={paymentChannel}
        cart={cart}
        isOpenCart={isOpenCart}
        onCloseCart={() => setIsOpenCart(false)}
        onRemoveFromCart={handleRemoveFromCart}
        onClearCart={handleClearCart}
      />

      {/* 📜 Footer */}
      <Footer />

    </div>
  );
}
