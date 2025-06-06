import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="text-center py-16 bg-gradient-to-r from-primary/10 via-background to-primary/10 rounded-lg shadow-lg">
        <h1 className="text-5xl font-bold text-primary mb-4">
          Austin Clean Sweep
        </h1>
        <p className="text-xl text-foreground/80 mb-8 max-w-2xl mx-auto">
          Your trusted partner for sparkling clean homes and Airbnbs in Austin, TX. Get an instant quote and book your cleaning in minutes!
        </p>
        <Link href="/booking">
          <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-8 py-6">
            Get Your Instant Quote
          </Button>
        </Link>
      </section>

      <section className="py-12">
        <h2 className="text-3xl font-headline font-semibold text-center mb-10 text-primary">Why Choose Us?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="shadow-md hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <Image src="https://placehold.co/100x100.png" alt="Professional staff" width={80} height={80} className="rounded-full" data-ai-hint="cleaning staff team" />
              </div>
              <CardTitle className="text-center text-xl font-headline text-primary">Professional &amp; Reliable</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/70 text-center">Our experienced and vetted cleaners ensure a consistently high-quality service.</p>
            </CardContent>
          </Card>
          <Card className="shadow-md hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
               <div className="flex justify-center mb-4">
                <Image src="https://placehold.co/100x100.png" alt="Easy booking" width={80} height={80} className="rounded-full" data-ai-hint="calendar booking online" />
              </div>
              <CardTitle className="text-center text-xl font-headline text-primary">Easy Online Booking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/70 text-center">Get instant quotes and book your cleaning service online in just a few clicks.</p>
            </CardContent>
          </Card>
          <Card className="shadow-md hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
               <div className="flex justify-center mb-4">
                <Image src="https://placehold.co/100x100.png" alt="Customizable cleaning" width={80} height={80} className="rounded-full" data-ai-hint="cleaning checklist services" />
              </div>
              <CardTitle className="text-center text-xl font-headline text-primary">Tailored to Your Needs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/70 text-center">Choose from various cleaning types and add-ons to perfectly match your requirements.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-12 bg-secondary/30 rounded-lg shadow-md">
        <h2 className="text-3xl font-headline font-semibold text-center mb-10 text-primary">Our Services</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 px-6">
          {['Standard Cleaning', 'Deep Cleaning', 'Move-In/Out Cleaning', 'Airbnb Cleaning'].map((service) => (
            <div key={service} className="flex items-center space-x-3 p-4 bg-card rounded-md shadow-sm">
              <CheckCircle className="text-primary h-6 w-6" />
              <span className="text-foreground/80">{service}</span>
            </div>
          ))}
        </div>
         <div className="text-center mt-8">
            <Link href="/booking">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                Learn More & Book
              </Button>
            </Link>
          </div>
      </section>
    </div>
  );
}
