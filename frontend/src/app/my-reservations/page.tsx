'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { api, Reservation } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

type FilterType = 'all' | 'upcoming' | 'past';

interface ReservationFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
}

export default function MyReservationsPage() {
  const router = useRouter();
  const { token, isAuthenticated } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('upcoming');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, filter]);

  const loadReservations = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const filters: ReservationFilters = { status: 'ACTIVE' };

      if (filter === 'upcoming') {
        filters.startDate = new Date().toISOString();
      } else if (filter === 'past') {
        filters.endDate = new Date().toISOString();
      }

      const data = await api.getMyReservations(token, filters);
      setReservations(data);
    } catch (error) {
      console.error('Error loading reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string, spaceName: string) => {
    if (!token) return;

    if (!confirm(`Annuler la réservation de "${spaceName}" ?`)) {
      return;
    }

    try {
      await api.cancelReservation(id, token);
      loadReservations();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur lors de l\'annulation';
      alert(message);
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

  const isUpcoming = (reservation: Reservation) => {
    return new Date(reservation.startTime) > new Date();
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Mes réservations</h1>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/spaces">+ Nouvelle réservation</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === 'upcoming' ? 'default' : 'outline'}
            onClick={() => setFilter('upcoming')}
          >
            À venir
          </Button>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            Toutes
          </Button>
          <Button
            variant={filter === 'past' ? 'default' : 'outline'}
            onClick={() => setFilter('past')}
          >
            Passées
          </Button>
        </div>

        {/* Reservations List */}
        {loading ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500">Chargement...</p>
            </CardContent>
          </Card>
        ) : reservations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 mb-4">Aucune réservation</p>
              <Button asChild>
                <Link href="/spaces">Réserver un espace</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <Card key={reservation.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{reservation.space.name}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
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

                      <div className="space-y-1 text-sm text-gray-600">
                        <p>📅 {formatDate(reservation.startTime)}</p>
                        <p>
                          🕐 {formatTime(reservation.startTime)} -{' '}
                          {formatTime(reservation.endTime)}
                        </p>
                        <p>
                          📍{' '}
                          {reservation.space.type === 'DESK' && 'Bureau'}
                          {reservation.space.type === 'MEETING_ROOM' && 'Salle de réunion'}
                          {reservation.space.type === 'COLLABORATIVE_SPACE' &&
                            'Espace collaboratif'}
                          {reservation.space.building &&
                            ` • Bâtiment ${reservation.space.building}`}
                          {reservation.space.floor && `, Étage ${reservation.space.floor}`}
                        </p>
                      </div>
                    </div>

                    {reservation.status === 'ACTIVE' && isUpcoming(reservation) && (
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/reservations/${reservation.id}`)}
                        >
                          Voir QR Code
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleCancel(reservation.id, reservation.space.name)}
                        >
                          Annuler
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}