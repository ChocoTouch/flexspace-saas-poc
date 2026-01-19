'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, Space } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/auth-context';

const spaceTypeLabels = {
  DESK: '🪑 Bureau',
  MEETING_ROOM: '🏢 Salle de réunion',
  COLLABORATIVE_SPACE: '🤝 Espace collaboratif',
};

export default function SpacesPage() {
  const { user } = useAuth();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  useEffect(() => {
    loadSpaces();
  }, [typeFilter]);

  const loadSpaces = async () => {
    try {
      setLoading(true);
      const data = await api.getSpaces({ 
        type: typeFilter || undefined,
        search: search || undefined 
      });
      setSpaces(data);
    } catch (error) {
      console.error('Error loading spaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadSpaces();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            <Link href={user ? '/dashboard' : '/'}>🏢 FlexSpace</Link>
          </h1>
          <div className="flex gap-2">
            {user?.role === 'ADMIN' && (
              <Button asChild>
                <Link href="/admin/spaces">Gérer les espaces</Link>
              </Button>
            )}
            {user && (
              <Button variant="outline" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Espaces disponibles</h2>
          <p className="text-gray-600">Découvrez tous nos espaces de travail</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Rechercher un espace..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              
              <select
                className="px-4 py-2 border rounded-md"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">Tous les types</option>
                <option value="DESK">Bureaux</option>
                <option value="MEETING_ROOM">Salles de réunion</option>
                <option value="COLLABORATIVE_SPACE">Espaces collaboratifs</option>
              </select>

              <Button onClick={handleSearch}>Rechercher</Button>
            </div>
          </CardContent>
        </Card>

        {/* Spaces Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Chargement...</p>
          </div>
        ) : spaces.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500">Aucun espace trouvé</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spaces.map((space) => (
              <Card key={space.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{space.name}</span>
                    <span className="text-sm font-normal text-gray-500">
                      {space.capacity} {space.capacity > 1 ? 'places' : 'place'}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <span className="font-medium w-20">Type:</span>
                      <span className="text-gray-600">
                        {spaceTypeLabels[space.type]}
                      </span>
                    </div>

                    {space.building && (
                      <div className="flex items-center text-sm">
                        <span className="font-medium w-20">Lieu:</span>
                        <span className="text-gray-600">
                          Bâtiment {space.building}
                          {space.floor && `, Étage ${space.floor}`}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center text-sm">
                      <span className="font-medium w-20">Horaires:</span>
                      <span className="text-gray-600">
                        {space.openTime} - {space.closeTime}
                      </span>
                    </div>

                    <Button className="w-full mt-4" asChild>
                      <Link href={`/spaces/${space.id}`}>Voir détails</Link>
                    </Button>
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