export interface QRPayload {
  reservationId: string;
  userId: string;
  spaceId: string;
  validFrom: string;
  validUntil: string;
  iat: number; // Issued at timestamp
}

export interface VerifyResult {
  valid: boolean;
  accessGranted: boolean;
  reason?: string;
  reservation?: {
    id: string;
    space: {
      id: string;
      name: string;
      floor?: string | null;
      building?: string | null;
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
  accessTime: Date;
  message: string;
}
