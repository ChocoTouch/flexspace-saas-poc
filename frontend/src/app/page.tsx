'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold text-gray-900">
            🏢 FlexSpace
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            Intelligent Workspace Booking System
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">🚀 POC Version 1.0</h3>
            <p className="text-sm text-blue-700">
              Système de réservation d&apos;espaces de travail avec contrôle d&apos;accès QR Code et analytics temps réel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-3xl mb-2">📅</div>
              <h4 className="font-semibold text-gray-900">Smart Booking</h4>
              <p className="text-sm text-gray-600 mt-1">
                Réservation avec détection de conflits
              </p>
            </div>

            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-3xl mb-2">🔐</div>
              <h4 className="font-semibold text-gray-900">QR Access</h4>
              <p className="text-sm text-gray-600 mt-1">
                Codes d&apos;accès temporaires sécurisés
              </p>
            </div>

            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-3xl mb-2">📊</div>
              <h4 className="font-semibold text-gray-900">Analytics</h4>
              <p className="text-sm text-gray-600 mt-1">
                Insights d&apos;occupation en temps réel
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="flex-1" size="lg" asChild>
              <Link href="/login">Se connecter</Link>
            </Button>
            <Button variant="outline" className="flex-1" size="lg" asChild>
              <Link href="/register">Créer un compte</Link>
            </Button>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-500">
              Built with Next.js, NestJS, Prisma & PostgreSQL
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}