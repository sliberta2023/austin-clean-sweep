import type { Timestamp } from "firebase/firestore";
import type { CleaningType, Bedrooms, Bathrooms, AddOnId } from "@/config/pricing";

export interface Booking {
  id?: string;
  name: string;
  email: string;
  serviceType: CleaningType;
  bedrooms: Bedrooms;
  bathrooms: Bathrooms;
  addOns: AddOnId[];
  serviceDate: string; // YYYY-MM-DD
  serviceTime?: string; // HH:mm (optional, from AI suggestion or manual input)
  quote: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  calendarEventId?: string;
  reminderNoticeSuggestion?: string; // From AI
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  isAdmin?: boolean;
}
