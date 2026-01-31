const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: "EMPLOYEE" | "MANAGER" | "ADMIN";
}

interface LoginData {
  email: string;
  password: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "EMPLOYEE" | "MANAGER" | "ADMIN";
  createdAt: string;
}

interface LoginResponse {
  access_token: string;
  user: User;
}

interface Space {
  id: string;
  name: string;
  type: "DESK" | "MEETING_ROOM" | "COLLABORATIVE_SPACE";
  capacity: number;
  floor?: string;
  building?: string;
  openTime: string;
  closeTime: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateSpaceData {
  name: string;
  type: "DESK" | "MEETING_ROOM" | "COLLABORATIVE_SPACE";
  capacity: number;
  floor?: string;
  building?: string;
  openTime: string;
  closeTime: string;
}

interface SpaceFilters {
  type?: string;
  capacity?: number;
  floor?: string;
  building?: string;
  search?: string;
}

interface Reservation {
  id: string;
  userId: string;
  spaceId: string;
  startTime: string;
  endTime: string;
  status: "ACTIVE" | "CANCELLED" | "COMPLETED";
  qrCode?: string;
  qrSignature?: string;
  createdAt: string;
  updatedAt: string;
  space: Space;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

interface CreateReservationData {
  spaceId: string;
  startTime: string;
  endTime: string;
  overrideConflict?: boolean;
}

interface AvailabilityCheck {
  available: boolean;
  space: {
    id: string;
    name: string;
    type: string;
    capacity: number;
  };
  requestedSlot: {
    startTime: string;
    endTime: string;
  };
  conflictingReservations: Array<{
    id: string;
    startTime: string;
    endTime: string;
    user: {
      firstName: string;
      lastName: string;
      role: string;
    };
  }>;
}

interface QRResult {
  qrCode: string;
  qrSignature: string;
  payload: {
    reservationId: string;
    userId: string;
    spaceId: string;
    validFrom: string;
    validUntil: string;
    iat: number;
  };
}

interface VerifyQRResult {
  valid: boolean;
  accessGranted: boolean;
  reason?: string;
  reservation?: {
    id: string;
    space: {
      id: string;
      name: string;
      floor?: string;
      building?: string;
    };
    user: {
      id: string;
      firstName: string;
      lastName: string;
      role: string;
    };
    validFrom: string;
    validUntil: string;
  };
  message: string;
  accessTime: string;
}

class ApiClient {
  private getHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  async register(data: RegisterData): Promise<User> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Registration failed");
    }

    return response.json();
  }

  async login(data: LoginData): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Login failed");
    }

    return response.json();
  }

  async getProfile(token: string): Promise<User> {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: this.getHeaders(token),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch profile");
    }

    return response.json();
  }

  async getSpaces(filters?: SpaceFilters): Promise<Space[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          params.append(key, value.toString());
        }
      });
    }

    const url = `${API_URL}/spaces${params.toString() ? `?${params}` : ""}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch spaces");
    }

    return response.json();
  }

  async getSpace(id: string): Promise<Space> {
    const response = await fetch(`${API_URL}/spaces/${id}`);

    if (!response.ok) {
      throw new Error("Failed to fetch space");
    }

    return response.json();
  }

  async createSpace(data: CreateSpaceData, token: string): Promise<Space> {
    const response = await fetch(`${API_URL}/spaces`, {
      method: "POST",
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create space");
    }

    return response.json();
  }

  async updateSpace(
    id: string,
    data: Partial<CreateSpaceData>,
    token: string,
  ): Promise<Space> {
    const response = await fetch(`${API_URL}/spaces/${id}`, {
      method: "PATCH",
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update space");
    }

    return response.json();
  }

  async deleteSpace(id: string, token: string): Promise<void> {
    const response = await fetch(`${API_URL}/spaces/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(token),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete space");
    }
  }

  async createReservation(
    data: CreateReservationData,
    token: string,
  ): Promise<Reservation> {
    const response = await fetch(`${API_URL}/reservations`, {
      method: "POST",
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw error; // Inclut conflicts si présents
    }

    return response.json();
  }

  async getMyReservations(
    token: string,
    filters?: {
      status?: string;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<Reservation[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }

    const url = `${API_URL}/reservations${params.toString() ? `?${params}` : ""}`;
    const response = await fetch(url, {
      headers: this.getHeaders(token),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch reservations");
    }

    return response.json();
  }

  async cancelReservation(id: string, token: string): Promise<Reservation> {
    const response = await fetch(`${API_URL}/reservations/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(token),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to cancel reservation");
    }

    return response.json();
  }

  async checkAvailability(
    data: {
      spaceId: string;
      startTime: string;
      endTime: string;
    },
    token: string,
  ): Promise<AvailabilityCheck> {
    const response = await fetch(`${API_URL}/reservations/check-availability`, {
      method: "POST",
      headers: this.getHeaders(token),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to check availability");
    }

    return response.json();
  }

  async generateQRCode(
    reservationId: string,
    token: string,
  ): Promise<QRResult> {
    const response = await fetch(`${API_URL}/qr/generate/${reservationId}`, {
      headers: this.getHeaders(token),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to generate QR code");
    }

    return response.json();
  }

  async verifyQRCode(qrData: string): Promise<VerifyQRResult> {
    const response = await fetch(`${API_URL}/qr/verify`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ qrData }),
    });

    if (!response.ok) {
      throw new Error("Failed to verify QR code");
    }

    return response.json();
  }
}

export const api = new ApiClient();
export type {
  User,
  RegisterData,
  LoginData,
  LoginResponse,
  Space,
  CreateSpaceData,
  SpaceFilters,
  Reservation,
  CreateReservationData,
  AvailabilityCheck,
  QRResult,
  VerifyQRResult
};
