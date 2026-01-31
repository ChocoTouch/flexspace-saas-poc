'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { api, VerifyQRResult } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function ScannerPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [qrData, setQrData] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<VerifyQRResult | null>(null);
  const [history, setHistory] = useState<VerifyQRResult[]>([]);

  useEffect(() => {
    if (!isAuthenticated || (user && user.role !== 'ADMIN')) {
      router.push('/dashboard');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  const handleScan = async () => {
    if (!qrData.trim()) {
      alert('Veuillez entrer des données QR');
      return;
    }

    try {
      setScanning(true);
      const verifyResult = await api.verifyQRCode(qrData);
      
      setResult(verifyResult);
      setHistory([verifyResult, ...history.slice(0, 9)]); // Garder les 10 derniers
      setQrData(''); // Reset input
    } catch (err) {
      console.error('Scan error:', err);
      alert(err instanceof Error ? err.message : 'Erreur lors du scan');
    } finally {
      setScanning(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">🔍 Scanner QR Code</h1>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/spaces">Gérer espaces</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scanner */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Simulateur de scanner</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                  <p className="text-blue-800">
                    💡 <strong>Instructions :</strong>
                  </p>
                  <ul className="list-disc list-inside text-blue-700 mt-2 space-y-1">
                    <li>Allez sur une de vos réservations</li>
                    <li>Clic droit sur l&apos;image QR → Inspecter l&apos;élément</li>
                    <li>Cherchez l&apos;attribut <code>src</code> qui contient le Base64</li>
                    <li>Utilisez un décodeur QR en ligne pour extraire les données</li>
                    <li>Collez les données Base64 extraites ci-dessous</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qrData">Données QR Code (Base64)</Label>
                  <textarea
                    id="qrData"
                    className="w-full min-h-30 px-3 py-2 border rounded-md font-mono text-sm"
                    placeholder="Collez les données du QR Code ici (format Base64)...&#10;&#10;Exemple: eyJyZXNlcnZhdGlvbklkIjoi..."
                    value={qrData}
                    onChange={(e) => setQrData(e.target.value)}
                  />
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleScan}
                  disabled={scanning || !qrData.trim()}
                >
                  {scanning ? 'Vérification...' : '🔍 Scanner le QR Code'}
                </Button>
              </CardContent>
            </Card>

            {/* Résultat du scan */}
            {result && (
              <Card
                className={`border-2 ${
                  result.accessGranted
                    ? 'border-green-500 bg-green-50'
                    : 'border-red-500 bg-red-50'
                }`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {result.accessGranted ? (
                      <>
                        <span className="text-3xl">✅</span>
                        <span className="text-green-800">ACCÈS AUTORISÉ</span>
                      </>
                    ) : (
                      <>
                        <span className="text-3xl">❌</span>
                        <span className="text-red-800">ACCÈS REFUSÉ</span>
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Message</p>
                    <p className="font-medium">{result.message}</p>
                  </div>

                  {result.reason && (
                    <div>
                      <p className="text-sm text-gray-600">Raison</p>
                      <p className="font-medium text-red-700">{result.reason}</p>
                    </div>
                  )}

                  {result.reservation && (
                    <>
                      <div className="pt-3 border-t">
                        <p className="text-sm text-gray-600">Utilisateur</p>
                        <p className="font-medium">
                          {result.reservation.user.firstName}{' '}
                          {result.reservation.user.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {result.reservation.user.role}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600">Espace</p>
                        <p className="font-medium">{result.reservation.space.name}</p>
                        {result.reservation.space.building && (
                          <p className="text-xs text-gray-500">
                            Bâtiment {result.reservation.space.building}
                            {result.reservation.space.floor &&
                              `, Étage ${result.reservation.space.floor}`}
                          </p>
                        )}
                      </div>

                      <div>
                        <p className="text-sm text-gray-600">Période de validité</p>
                        <p className="text-xs text-gray-600">
                          De {formatTime(result.reservation.validFrom)} à{' '}
                          {formatTime(result.reservation.validUntil)}
                        </p>
                      </div>
                    </>
                  )}

                  <div className="pt-3 border-t">
                    <p className="text-xs text-gray-500">
                      Scanné à : {formatTime(result.accessTime)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Historique des scans */}
          <Card>
            <CardHeader>
              <CardTitle>Historique des scans</CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Aucun scan effectué
                </p>
              ) : (
                <div className="space-y-3 max-h-150 overflow-y-auto">
                  {history.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border ${
                        item.accessGranted
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-lg">
                          {item.accessGranted ? '✅' : '❌'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTime(item.accessTime)}
                        </span>
                      </div>

                      {item.reservation ? (
                        <>
                          <p className="font-medium text-sm">
                            {item.reservation.user.firstName}{' '}
                            {item.reservation.user.lastName}
                          </p>
                          <p className="text-xs text-gray-600">
                            {item.reservation.space.name}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-gray-600">{item.message}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instructions détaillées */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Comment tester le scanner</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-2">1. Créer réservation</h3>
                <p className="text-sm text-gray-700 mb-3">
                  En tant qu&apos;employé, créez une réservation pour aujourd&apos;hui
                </p>
                <Button size="sm" className="w-full" asChild>
                  <Link href="/spaces">Réserver</Link>
                </Button>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold mb-2">2. Voir le QR</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Allez sur &quot;Mes réservations&quot; → Cliquez &quot;Voir QR Code&quot;
                </p>
                <Button size="sm" variant="outline" className="w-full" asChild>
                  <Link href="/my-reservations">Mes réservations</Link>
                </Button>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold mb-2">3. Extraire données</h3>
                <p className="text-sm text-gray-700">
                  Utilisez un décodeur QR en ligne (qr-code-generator.com) pour extraire
                  les données Base64
                </p>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg">
                <h3 className="font-semibold mb-2">4. Scanner</h3>
                <p className="text-sm text-gray-700">
                  Collez les données dans le champ ci-dessus et scannez pour voir le
                  résultat
                </p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                <strong>💡 Astuce technique :</strong> Le QR Code contient un payload
                JSON signé avec HMAC-SHA256. Le backend vérifie :
              </p>
              <ul className="list-disc list-inside text-sm text-green-700 mt-2 space-y-1">
                <li>La signature cryptographique (impossible de forger)</li>
                <li>La validité temporelle (doit être dans le créneau)</li>
                <li>Le statut de la réservation (ACTIVE uniquement)</li>
                <li>Logs chaque tentative d&apos;accès dans AccessLog</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}