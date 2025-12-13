'use client'

import React from 'react'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import DashboardSlideshow from '@/components/DashboardSlideshow'
import Calculator from '@/components/Calculator'
import Features from '@/components/Features'
import FAQ from '@/components/FAQ'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main id="main-content" className="min-h-screen bg-gray-50" role="main" suppressHydrationWarning>
      <Header />
      <Hero />
      <DashboardSlideshow />
      <Features />
      <Calculator />
      <FAQ />
      <Contact />
      <Footer />
    </main>
  )
}

