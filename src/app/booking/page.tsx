import BookingForm from "@/components/booking/BookingForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function BookingPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline text-primary">Book Your Cleaning Service</CardTitle>
          <CardDescription className="text-lg text-foreground/70">
            Fill out the form below to get an instant quote and schedule your cleaning.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BookingForm />
        </CardContent>
      </Card>
    </div>
  );
}
