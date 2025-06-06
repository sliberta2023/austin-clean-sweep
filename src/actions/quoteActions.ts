"use server";

import { z } from "zod";
import { basePrices, addOnPrices, type CleaningType, type Bedrooms, type Bathrooms, type AddOnId } from "@/config/pricing";

export const CalculateQuoteSchema = z.object({
  serviceType: z.enum(["standard", "deep", "move-in/out", "airbnb"]),
  bedrooms: z.coerce.number().min(1).max(4) as z.ZodType<Bedrooms>,
  bathrooms: z.coerce.number().min(1).max(3) as z.ZodType<Bathrooms>,
  addOns: z.array(z.enum(["fridge", "oven", "cabinets", "windows", "linen", "laundry", "petHair"])).optional(),
});

export type CalculateQuoteInput = z.infer<typeof CalculateQuoteSchema>;

export async function calculateQuote(
  input: CalculateQuoteInput
): Promise<{ price: number } | { error: string }> {
  try {
    const validatedInput = CalculateQuoteSchema.parse(input);
    const { serviceType, bedrooms, bathrooms, addOns = [] } = validatedInput;

    const basePriceKey = `${bedrooms}-${bathrooms}`;
    const serviceBasePrice = basePrices[basePriceKey]?.[serviceType];

    if (typeof serviceBasePrice === "undefined") {
      return { error: "Invalid service configuration for base price." };
    }

    let totalPrice = serviceBasePrice;

    for (const addOn of addOns) {
      totalPrice += addOnPrices[addOn as AddOnId] || 0;
    }
    
    // Specific Airbnb rule: linen change is often included or specially priced.
    // For this implementation, if 'linen' is an add-on for Airbnb, it's already handled by generic addOnPrices.
    // If Airbnb inherently includes linen and it's not an add-on, logic would be:
    // if (serviceType === 'airbnb' && !addOns.includes('linen')) { totalPrice += addOnPrices.linen; }
    // But current setup implies 'linen' is always an optional add-on.

    return { price: totalPrice };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: "Invalid input: " + error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') };
    }
    console.error("Error calculating quote:", error);
    return { error: "Failed to calculate quote." };
  }
}
