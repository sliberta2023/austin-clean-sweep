"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { addOnOptions, cleaningTypeOptions, bedroomOptions, bathroomOptions, type AddOnId, type Bedrooms, type Bathrooms, type CleaningType } from "@/config/pricing";
import { calculateQuote, type CalculateQuoteInput } from "@/actions/quoteActions";
import { createBooking } from "@/actions/bookingActions";
import { suggestOptimalBookingTime, type SuggestOptimalBookingTimeInput, type SuggestOptimalBookingTimeOutput } from "@/ai/flows/intelligent-scheduling";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Wand2, AlertTriangle, CheckCircle } from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const bookingFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  serviceDate: z.date({ required_error: "Service date is required." }),
  bedrooms: z.coerce.number().min(1).max(4) as z.ZodType<Bedrooms>,
  bathrooms: z.coerce.number().min(1).max(3) as z.ZodType<Bathrooms>,
  serviceType: z.enum(["standard", "deep", "move-in/out", "airbnb"]),
  addOns: z.array(z.enum(addOnOptions.map(ao => ao.id) as [AddOnId, ...AddOnId[]])).optional(),
  serviceTime: z.string().optional(), // For AI suggested time
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

export default function BookingForm() {
  const { toast } = useToast();
  const [quote, setQuote] = useState<number | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [isCalculatingQuote, setIsCalculatingQuote] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<SuggestOptimalBookingTimeOutput | null>(null);
  const [isFetchingAiSuggestion, setIsFetchingAiSuggestion] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      name: "",
      email: "",
      bedrooms: 1,
      bathrooms: 1,
      serviceType: "standard",
      addOns: [],
    },
  });

  const watchedFields = form.watch(["serviceType", "bedrooms", "bathrooms", "addOns", "serviceDate"]);

  const handleQuoteCalculation = useCallback(async () => {
    const { serviceType, bedrooms, bathrooms, addOns } = form.getValues();
    if (serviceType && bedrooms && bathrooms) {
      setIsCalculatingQuote(true);
      setQuoteError(null);
      const result = await calculateQuote({
        serviceType: serviceType as CleaningType,
        bedrooms: bedrooms as Bedrooms,
        bathrooms: bathrooms as Bathrooms,
        addOns: addOns as AddOnId[],
      });
      if ("price" in result) {
        setQuote(result.price);
      } else {
        setQuote(null);
        setQuoteError(result.error);
      }
      setIsCalculatingQuote(false);
    }
  }, [form]);

  const handleAiSuggestion = useCallback(async () => {
    const { serviceType, bedrooms, bathrooms, serviceDate } = form.getValues();
    if (serviceType && bedrooms && bathrooms && serviceDate) {
      setIsFetchingAiSuggestion(true);
      setAiError(null);
      setAiSuggestion(null);
      try {
        const result = await suggestOptimalBookingTime({
          serviceType: serviceType as CleaningType,
          bedrooms: bedrooms as Bedrooms,
          bathrooms: bathrooms as Bathrooms,
          datePreference: format(serviceDate, "yyyy-MM-dd"),
        });
        setAiSuggestion(result);
        form.setValue("serviceTime", result.suggestedTime); 
      } catch (error) {
        console.error("AI suggestion error:", error);
        setAiError("Could not fetch scheduling suggestion at this time.");
      }
      setIsFetchingAiSuggestion(false);
    }
  }, [form]);

  useEffect(() => {
    handleQuoteCalculation();
  }, [watchedFields[0], watchedFields[1], watchedFields[2], watchedFields[3], handleQuoteCalculation]);

  useEffect(() => {
    if (watchedFields[0] && watchedFields[1] && watchedFields[2] && watchedFields[4]) {
        handleAiSuggestion();
    }
  }, [watchedFields[0], watchedFields[1], watchedFields[2], watchedFields[4], handleAiSuggestion]);


  async function onSubmit(data: BookingFormValues) {
    if (quote === null) {
      toast({
        title: "Error",
        description: "Please ensure all fields are correctly filled to calculate a quote.",
        variant: "destructive",
      });
      return;
    }
    
    const bookingData = {
      ...data,
      serviceDate: format(data.serviceDate, "yyyy-MM-dd"),
      quote,
      status: "pending" as const,
      reminderNoticeSuggestion: aiSuggestion?.reminderNoticeSuggestion,
      serviceTime: aiSuggestion?.suggestedTime, // Using AI suggested time if available
    };

    try {
      const result = await createBooking(bookingData);
      if (result.success && result.bookingId) {
        toast({
          title: "Booking Submitted!",
          description: `Your cleaning service has been requested. Booking ID: ${result.bookingId}. We will contact you shortly.`,
          className: "bg-green-100 border-green-400 text-green-700",
        });
        form.reset();
        setQuote(null);
        setAiSuggestion(null);
      } else {
        toast({
          title: "Booking Failed",
          description: result.error || "An unknown error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Booking Error",
        description: "An unexpected error occurred while submitting your booking.",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="serviceDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Preferred Service Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1)) } // Disable past dates
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="serviceType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cleaning Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cleaning type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cleaningTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bedrooms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bedrooms</FormLabel>
                <Select onValueChange={(val) => field.onChange(parseInt(val))} defaultValue={String(field.value)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select number of bedrooms" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {bedroomOptions.map((option) => (
                      <SelectItem key={option.value} value={String(option.value)}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bathrooms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bathrooms</FormLabel>
                <Select onValueChange={(val) => field.onChange(parseInt(val))} defaultValue={String(field.value)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select number of bathrooms" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {bathroomOptions.map((option) => (
                      <SelectItem key={option.value} value={String(option.value)}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="addOns"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel className="text-base">Optional Add-ons</FormLabel>
                <FormDescription>Select any additional services you need.</FormDescription>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {addOnOptions.map((item) => (
                  <FormField
                    key={item.id}
                    control={form.control}
                    name="addOns"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={item.id}
                          className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...(field.value || []), item.id])
                                  : field.onChange(
                                      (field.value || []).filter(
                                        (value) => value !== item.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {item.label} (+${item.price})
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {isFetchingAiSuggestion && (
          <Alert variant="default" className="bg-blue-50 border-blue-300">
             <Wand2 className="h-5 w-5 text-blue-600" />
            <AlertTitle className="text-blue-700 font-semibold">Hold on a moment...</AlertTitle>
            <AlertDescription className="text-blue-600">
              Our AI is finding the best time slot and crafting a reminder for you!
            </AlertDescription>
          </Alert>
        )}

        {aiError && (
           <Alert variant="destructive">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle>Suggestion Error</AlertTitle>
            <AlertDescription>{aiError}</AlertDescription>
          </Alert>
        )}

        {aiSuggestion && !isFetchingAiSuggestion && (
          <Alert variant="default" className="bg-primary/10 border-primary/30">
            <Wand2 className="h-5 w-5 text-primary" />
            <AlertTitle className="text-primary font-semibold">Scheduling Suggestion</AlertTitle>
            <AlertDescription className="text-foreground/80 space-y-1">
              <p>We suggest booking for <strong>{aiSuggestion.suggestedTime}</strong> on your selected date.</p>
              <p><strong>Proposed Reminder:</strong> "{aiSuggestion.reminderNoticeSuggestion}"</p>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="pt-6 border-t border-border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-headline font-semibold text-primary">Estimated Quote:</h3>
            {isCalculatingQuote ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            ) : quoteError ? (
              <span className="text-xl font-bold text-destructive">{quoteError}</span>
            ) : quote !== null ? (
              <span className="text-3xl font-bold text-primary">${quote.toFixed(2)}</span>
            ) : (
              <span className="text-xl text-muted-foreground">Fill form for quote</span>
            )}
          </div>
          <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-3" disabled={form.formState.isSubmitting || isCalculatingQuote || quote === null}>
            {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-5 w-5" /> }
            {form.formState.isSubmitting ? "Submitting..." : "Book Now"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
