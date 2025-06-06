"use server";

import { z } from "zod";
import { collection, addDoc, Timestamp, doc, updateDoc, getDocs, query, where, orderBy, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Booking } from "@/types";
import { addOnOptions, type AddOnId, type Bedrooms, type Bathrooms, type CleaningType } from "@/config/pricing";
import { revalidatePath } from "next/cache";

const CreateBookingSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  serviceType: z.enum(["standard", "deep", "move-in/out", "airbnb"]),
  bedrooms: z.number().min(1).max(4) as z.ZodType<Bedrooms>,
  bathrooms: z.number().min(1).max(3) as z.ZodType<Bathrooms>,
  addOns: z.array(z.enum(addOnOptions.map(ao => ao.id) as [AddOnId, ...AddOnId[]])).optional(),
  serviceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  serviceTime: z.string().optional(),
  quote: z.number().min(0),
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]),
  reminderNoticeSuggestion: z.string().optional(),
});

export async function createBooking(
  data: z.infer<typeof CreateBookingSchema>
): Promise<{ success: boolean; bookingId?: string; error?: string }> {
  try {
    const validatedData = CreateBookingSchema.parse(data);
    const bookingData: Omit<Booking, "id" | "createdAt" | "updatedAt" | "calendarEventId"> & { createdAt: Timestamp, updatedAt: Timestamp } = {
      ...validatedData,
      addOns: validatedData.addOns || [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, "bookings"), bookingData);
    revalidatePath("/admin"); // Revalidate admin page to show new booking
    revalidatePath("/booking"); // Potentially clear form or show success
    return { success: true, bookingId: docRef.id };
  } catch (error) {
    console.error("Error creating booking:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: "Invalid data: " + error.errors.map(e => e.message).join(", ") };
    }
    return { success: false, error: "Failed to create booking." };
  }
}

export async function getBookings(filters?: { status?: string; date?: string }): Promise<Booking[]> {
  try {
    const bookingsCol = collection(db, "bookings");
    let q = query(bookingsCol, orderBy("serviceDate", "desc"), orderBy("createdAt", "desc"));

    if (filters?.status) {
      q = query(q, where("status", "==", filters.status));
    }
    if (filters?.date) {
      // This assumes date is YYYY-MM-DD. Firestore range queries on dates can be tricky if not stored as Timestamps.
      // For simplicity, this example filters by exact match. For ranges, consider storing serviceDate as a Timestamp.
      q = query(q, where("serviceDate", "==", filters.date));
    }
    
    const querySnapshot = await getDocs(q);
    const bookings = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
    return bookings;
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return [];
  }
}

export async function updateBookingStatus(
  bookingId: string,
  status: Booking["status"]
): Promise<{ success: boolean; error?: string }> {
  try {
    const bookingRef = doc(db, "bookings", bookingId);
    await updateDoc(bookingRef, {
      status: status,
      updatedAt: Timestamp.now(),
    });

    // Placeholder for Google Calendar Integration
    if (status === "confirmed") {
      // await syncToGoogleCalendar(bookingId); // Implement this function
      console.log(`Booking ${bookingId} confirmed. Placeholder for Google Calendar sync.`);
    }
    
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error updating booking status:", error);
    return { success: false, error: "Failed to update booking status." };
  }
}

// Placeholder for a more complex Google Calendar sync function
// async function syncToGoogleCalendar(bookingId: string) {
//   const booking = await getDoc(doc(db, "bookings", bookingId));
//   if (booking.exists()) {
//     const bookingData = booking.data() as Booking;
//     // 1. Authenticate with Google Calendar API
//     // 2. Create event object
//     // 3. Send API request to create event
//     // 4. Store event ID in Firestore: await updateDoc(doc(db, "bookings", bookingId), { calendarEventId: "...", updatedAt: Timestamp.now() });
//     console.log("Simulating Google Calendar event creation for:", bookingData.name, bookingData.serviceDate);
//   }
// }

export async function deleteBookingAction(bookingId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const bookingRef = doc(db, "bookings", bookingId);
    await deleteDoc(bookingRef);
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error deleting booking:", error);
    return { success: false, error: "Failed to delete booking." };
  }
}
