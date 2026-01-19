"use client";

import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800";
      case "MANAGER":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">🏢 FlexSpace</h1>
          <Button variant="outline" onClick={logout}>
            Déconnexion
          </Button>
        </div>
      </header>

      {user.role === "ADMIN" && (
        <div className="p-4 bg-orange-50 rounded-lg">
          <div className="text-2xl mb-2">⚙️</div>
          <h3 className="font-semibold">Administration</h3>
          <p className="text-sm text-gray-600 mt-1">
            Gérer les espaces et utilisateurs
          </p>
          <Button className="mt-3 w-full" asChild>
            <Link href="/admin/spaces">Gérer les espaces</Link>
          </Button>
        </div>
      )}

      <div className="pt-4 border-t">
        <Button variant="outline" className="w-full" asChild>
          <Link href="/spaces">📋 Voir tous les espaces disponibles</Link>
        </Button>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>
              Bienvenue, {user.firstName} {user.lastName}!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(user.role)}`}
              >
                {user.role}
              </span>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-500 mb-3">
                Fonctionnalités disponibles :
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl mb-2">📅</div>
                  <h3 className="font-semibold">Réservations</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Réserver des espaces de travail
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Jour 5 - À venir</p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl mb-2">🔐</div>
                  <h3 className="font-semibold">QR Code</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Accès sécurisé par QR
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Jour 6 - À venir</p>
                </div>

                {(user.role === "MANAGER" || user.role === "ADMIN") && (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl mb-2">📊</div>
                    <h3 className="font-semibold">Analytics</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Statistiques d&apos;occupation
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Jour 7 - À venir
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t text-sm text-gray-500">
              <p>
                Compte créé le :{" "}
                {new Date(user.createdAt).toLocaleDateString("fr-FR")}
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
