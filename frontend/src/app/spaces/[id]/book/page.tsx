'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { api, Space, AvailabilityCheck } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { isConflictError } from '@/types/ApiError';

export default function BookSpacePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuth();
  const spaceId = params.id;

  const [space, setSpace] = useState<Space | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [availability, setAvailability] = useState<AvailabilityCheck | null>(null);

  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadSpace();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const loadSpace = async () => {
    try {
      const data = await api.getSpace(spaceId);
      setSpace(data);

      // Set default date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDate(tomorrow.toISOString().split('T')[0]);
    } catch (err) {
      console.error('Error loading space:', err);
      setError('Espace non trouvé');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAvailability = async () => {

    if (!token) return;
    if (!date || !startTime || !endTime) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      setError('');
      const startDateTime = `${date}T${startTime}:00.000Z`;
      const endDateTime = `${date}T${endTime}:00.000Z`;

      const result = await api.checkAvailability({
        spaceId,
        startTime: startDateTime,
        endTime: endDateTime,
      },token);

      setAvailability(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erreur lors de la vérification');
      }
    }
  };

  const handleSubmit = async (override = false) => {
    if (!token || !date || !startTime || !endTime) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const startDateTime = `${date}T${startTime}:00.000Z`;
      const endDateTime = `${date}T${endTime}:00.000Z`;

      await api.createReservation(
        {
          spaceId,
          startTime: startDateTime,
          endTime: endDateTime,
          overrideConflict: override,
        },
        token,
      );

      router.push('/my-reservations');
    } catch (err) {
      if (isConflictError(err)) {
        setError(err.message);
        if (space) {
          setAvailability({
            available: false,
            space: {
              id: space.id,
              name: space.name,
              type: space.type,
              capacity: space.capacity,
            },
            requestedSlot: {
              startTime: `${date}T${startTime}:00.000Z`,
              endTime: `${date}T${endTime}:00.000Z`,
            },
            conflictingReservations: err.conflicts,
          });
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erreur lors de la réservation');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <p className="text-red-600 mb-4">{error || 'Espace non trouvé'}</p>
            <Button onClick={() => router.push('/spaces')}>
              Retour aux espaces
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canOverride = user?.role === 'MANAGER' || user?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Réserver un espace</h1>
          <Button variant="outline" onClick={() => router.back()}>
            ← Retour
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informations espace */}
          <Card>
            <CardHeader>
              <CardTitle>Espace sélectionné</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h3 className="text-xl font-bold">{space.name}</h3>
                <p className="text-gray-600">
                  {space.type === 'DESK' && '🪑 Bureau'}
                  {space.type === 'MEETING_ROOM' && '🏢 Salle de réunion'}
                  {space.type === 'COLLABORATIVE_SPACE' && '🤝 Espace collaboratif'}
                </p>
              </div>

              <div className="pt-3 border-t space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Capacité:</span>
                  <span className="font-medium">{space.capacity} personne(s)</span>
                </div>

                {space.building && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Localisation:</span>
                    <span className="font-medium">
                      Bâtiment {space.building}
                      {space.floor && `, Étage ${space.floor}`}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">Horaires:</span>
                  <span className="font-medium">
                    {space.openTime} - {space.closeTime}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formulaire réservation */}
          <Card>
            <CardHeader>
              <CardTitle>Sélectionner un créneau</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Heure début</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">Heure fin</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={handleCheckAvailability}
                >
                  Vérifier la disponibilité
                </Button>

                {availability && (
                  <div
                    className={`p-4 rounded-lg border ${
                      availability.available
                        ? 'bg-green-50 border-green-200'
                        : 'bg-orange-50 border-orange-200'
                    }`}
                  >
                    {availability.available ? (
                      <>
                        <p className="text-green-800 font-medium mb-2">
                          ✅ Espace disponible !
                        </p>
                        <Button
                          className="w-full"
                          onClick={() => handleSubmit(false)}
                          disabled={submitting}
                        >
                          {submitting ? 'Réservation...' : 'Confirmer la réservation'}
                        </Button>
                      </>
                    ) : (
                      <>
                        <p className="text-orange-800 font-medium mb-2">
                          ⚠️ Conflit détecté
                        </p>
                        <div className="text-sm text-orange-700 mb-3">
                          {availability.conflictingReservations.map((conflict, idx) => (
                            <div key={idx} className="mb-1">
                              • Réservé par {conflict.user.firstName}{' '}
                              {conflict.user.lastName} ({conflict.user.role})
                            </div>
                          ))}
                        </div>

                        {canOverride && (
                          <Button
                            className="w-full"
                            variant="destructive"
                            onClick={() => handleSubmit(true)}
                            disabled={submitting}
                          >
                            {submitting
                              ? 'Réservation...'
                              : '⚡ Forcer la réservation (Manager)'}
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-500 pt-2">
                Durée : 30 min minimum, 8h maximum
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}