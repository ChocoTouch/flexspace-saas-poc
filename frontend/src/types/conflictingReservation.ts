import { Role } from "./role";

export type ConflictingReservation = {
  id: string;
  startTime: string;
  endTime: string;
  user: {
    firstName: string;
    lastName: string;
    role: Role;
  };
};
