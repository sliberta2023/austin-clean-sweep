import AdminRouteGuard from "@/components/auth/AdminRouteGuard";
import BookingTable from "@/components/admin/BookingTable";
import { getBookings } from "@/actions/bookingActions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

async function BookingsList() {
  const bookings = await getBookings();
  return <BookingTable bookings={bookings} />;
}

export default function AdminDashboardPage() {
  return (
    <AdminRouteGuard>
      <div className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-headline text-primary">Admin Dashboard</CardTitle>
            <CardDescription className="text-lg text-foreground/70">Manage all customer bookings.</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" /> 
                <span className="ml-2">Loading bookings...</span>
              </div>
            }>
              <BookingsList />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </AdminRouteGuard>
  );
}
