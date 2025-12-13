'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

import Header from '@/components/frontend/Header';
import Footer from '@/components/frontend/Footer';

interface LegalContent {
  content: string;
  lastUpdated: string | null;
  restaurantName: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  email: string;
  atuNumber: string;
  fnNumber: string;
}

export default function ImpressumPage() {
  const [legalContent, setLegalContent] = useState<LegalContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLegalContent = async () => {
      try {
        const response = await fetch('/api/legal?type=impressum');
        if (response.ok) {
          const data = await response.json();
          setLegalContent(data);
        }
      } catch (error) {
        console.error('Error fetching legal content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLegalContent();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <Header />
        <div className="max-w-screen mx-auto px-4 md:px-6 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <Header />
      <div className="max-w-screen mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-brand-600 hover:text-brand-700 mr-4"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Zurück zur Startseite
          </Link>
          <h1 className="text-3xl font-display font-semibold text-gray-900">
            Impressum
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-8">
          <div className="prose prose-lg max-w-none">
            {legalContent?.content ? (
              <div className="whitespace-pre-wrap text-gray-700">
                {legalContent.content}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">Impressum-Inhalt wird geladen...</p>
              </div>
            )}

            {legalContent?.lastUpdated && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Stand: {new Date(legalContent.lastUpdated).toLocaleDateString('de-DE')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
