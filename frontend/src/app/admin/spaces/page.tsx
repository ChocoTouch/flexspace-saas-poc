"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { api, Space, CreateSpaceData } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Type } from "@/types/type";

export default function AdminSpacesPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<CreateSpaceData>({
    name: "",
    type: "DESK",
    capacity: 1,
    floor: "",
    building: "",
    openTime: "08:00",
    closeTime: "20:00",
  });

  useEffect(() => {
    if (!isLoading && user?.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user?.role === "ADMIN") {
      loadSpaces();
    }
  }, [user]);

  const loadSpaces = async () => {
    try {
      setLoading(true);
      const data = await api.getSpaces();
      setSpaces(data);
    } catch (error) {
      console.error("Error loading spaces:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) return;

    try {
      await api.createSpace(formData, token);
      setIsDialogOpen(false);
      setFormData({
        name: "",
        type: "DESK",
        capacity: 1,
        floor: "",
        building: "",
        openTime: "08:00",
        closeTime: "20:00",
      });
      loadSpaces();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Échec de la création");
      }
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!token) return;

    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${name}" ?`)) {
      return;
    }

    try {
      await api.deleteSpace(id, token);
      loadSpaces();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Échec de la suppression");
      }
    }
  };

  if (isLoading || user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            🏢 FlexSpace - Admin
          </h1>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            ← Retour
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Gestion des espaces
            </h2>
            <p className="text-gray-600 mt-1">
              {spaces.length} espace(s) au total
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>+ Nouvel espace</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer un nouvel espace</DialogTitle>
                <DialogDescription>
                  Ajoutez un bureau, une salle de réunion ou un espace
                  collaboratif
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Nom de l&apos;espace *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ex: Bureau Open Space 1"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: Type) =>
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DESK">🪑 Bureau</SelectItem>
                        <SelectItem value="MEETING_ROOM">
                          🏢 Salle de réunion
                        </SelectItem>
                        <SelectItem value="COLLABORATIVE_SPACE">
                          🤝 Espace collaboratif
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacité *</Label>
                    <Input
                      id="capacity"
                      type="number"
                      min="1"
                      max="100"
                      value={formData.capacity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          capacity: parseInt(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="building">Bâtiment</Label>
                    <Input
                      id="building"
                      value={formData.building}
                      onChange={(e) =>
                        setFormData({ ...formData, building: e.target.value })
                      }
                      placeholder="Ex: A"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="floor">Étage</Label>
                    <Input
                      id="floor"
                      value={formData.floor}
                      onChange={(e) =>
                        setFormData({ ...formData, floor: e.target.value })
                      }
                      placeholder="Ex: 2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="openTime">Heure d&apos;ouverture *</Label>
                    <Input
                      id="openTime"
                      type="time"
                      value={formData.openTime}
                      onChange={(e) =>
                        setFormData({ ...formData, openTime: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="closeTime">Heure de fermeture *</Label>
                    <Input
                      id="closeTime"
                      type="time"
                      value={formData.closeTime}
                      onChange={(e) =>
                        setFormData({ ...formData, closeTime: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit">Créer l&apos;espace</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Spaces Table */}
        {loading ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500">Chargement...</p>
            </CardContent>
          </Card>
        ) : spaces.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 mb-4">Aucun espace créé</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                Créer le premier espace
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nom
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Capacité
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Localisation
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Horaires
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {spaces.map((space) => (
                      <tr key={space.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            {space.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {space.type === "DESK" && "🪑 Bureau"}
                            {space.type === "MEETING_ROOM" && "🏢 Salle"}
                            {space.type === "COLLABORATIVE_SPACE" &&
                              "🤝 Collaboratif"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {space.capacity}{" "}
                          {space.capacity > 1 ? "places" : "place"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {space.building && space.floor
                            ? `Bât. ${space.building}, Ét. ${space.floor}`
                            : space.building || space.floor || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {space.openTime} - {space.closeTime}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              space.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {space.isActive ? "Actif" : "Inactif"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-800"
                            onClick={() => handleDelete(space.id, space.name)}
                          >
                            Supprimer
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
