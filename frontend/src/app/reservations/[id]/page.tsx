'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Reservation } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';

export default function ReservationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const reservationId = params.id;

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadReservation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const loadReservation = async () => {
    if (!token) return;

    try {
      setLoading(true);
      // Récupérer la réservation (elle contient déjà le QR Code)
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reservations/${reservationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error('Réservation non trouvée');
      }

      const data = await response.json();
      setReservation(data);
    } catch (err) {
      console.error('Error loading reservation:', err);
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isValidNow = () => {
    if (!reservation) return false;
    const now = new Date();
    const start = new Date(reservation.startTime);
    const end = new Date(reservation.endTime);
    return now >= start && now <= end;
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <p className="text-red-600 mb-4">{error || 'Réservation non trouvée'}</p>
            <Button asChild>
              <Link href="/my-reservations">Retour à mes réservations</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">QR Code d&apos;accès</h1>
          <Button variant="outline" asChild>
            <Link href="/my-reservations">← Retour</Link>
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* QR Code */}
          <Card className="lg:col-span-2">
            <CardHeader className="text-center">
              <CardTitle>Votre QR Code d&apos;accès</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {reservation.qrCode ? (
                <>
                  <div className="bg-white p-6 rounded-lg shadow-lg mb-4">
                    <Image
                      src={reservation.qrCode}
                      alt="QR Code"
                      width={300}
                      height={300}
                      className="w-full max-w-xs"
                    />
                  </div>

                  <div
                    className={`text-center p-4 rounded-lg ${
                      isValidNow()
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-orange-50 border border-orange-200'
                    }`}
                  >
                    {isValidNow() ? (
                      <p className="text-green-800 font-medium">
                        ✅ QR Code actif - Scannez pour accéder
                      </p>
                    ) : (
                      <p className="text-orange-800 font-medium">
                        ⏰ QR Code sera actif à partir de{' '}
                        {formatTime(reservation.startTime)}
                      </p>
                    )}
                  </div>

                  <p className="text-sm text-gray-500 mt-4">
                    Présentez ce QR Code au scanner à l&apos;entrée
                  </p>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">QR Code non disponible</p>
                  <Button onClick={loadReservation}>Réessayer</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informations réservation */}
          <Card>
            <CardHeader>
              <CardTitle>Détails de la réservation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Espace</p>
                <p className="font-medium text-lg">{reservation.space.name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{formatDate(reservation.startTime)}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Horaire</p>
                <p className="font-medium">
                  {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
                </p>
              </div>

              {reservation.space.building && (
                <div>
                  <p className="text-sm text-gray-500">Localisation</p>
                  <p className="font-medium">
                    Bâtiment {reservation.space.building}
                    {reservation.space.floor && `, Étage ${reservation.space.floor}`}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-500">Statut</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    reservation.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-800'
                      : reservation.status === 'CANCELLED'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {reservation.status === 'ACTIVE' && 'Actif'}
                  {reservation.status === 'CANCELLED' && 'Annulé'}
                  {reservation.status === 'COMPLETED' && 'Terminé'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Instructions d&apos;utilisation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex gap-3">
                <span className="text-2xl">1️⃣</span>
                <div>
                  <p className="font-medium">Arrivez à l&apos;heure</p>
                  <p className="text-gray-600">
                    Le QR Code est actif uniquement pendant votre créneau de réservation
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="text-2xl">2️⃣</span>
                <div>
                  <p className="font-medium">Scannez le QR Code</p>
                  <p className="text-gray-600">
                    Présentez ce QR Code au scanner situé à l&apos;entrée du bâtiment
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="text-2xl">3️⃣</span>
                <div>
                  <p className="font-medium">Accédez à votre espace</p>
                  <p className="text-gray-600">
                    Une fois validé, vous pouvez accéder à {reservation.space.name}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t">
                <p className="text-gray-500 text-xs">
                  💡 Conseil : Capturez ce QR Code pour y accéder hors ligne
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}