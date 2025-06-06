'use server';

/**
 * @fileOverview Provides intelligent booking suggestions based on historical data.
 *
 * - suggestOptimalBookingTime - A function that suggests an optimal booking time.
 * - SuggestOptimalBookingTimeInput - The input type for the suggestOptimalBookingTime function.
 * - SuggestOptimalBookingTimeOutput - The return type for the suggestOptimalBookingTime function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestOptimalBookingTimeInputSchema = z.object({
  serviceType: z
    .string()
    .describe('The type of cleaning service requested (e.g., standard, deep, move-in/out, Airbnb).'),
  bedrooms: z.number().describe('The number of bedrooms in the property.'),
  bathrooms: z.number().describe('The number of bathrooms in the property.'),
  datePreference: z
    .string()
    .describe('The customer date preference for the service as YYYY-MM-DD.'),
});
export type SuggestOptimalBookingTimeInput = z.infer<typeof SuggestOptimalBookingTimeInputSchema>;

const SuggestOptimalBookingTimeOutputSchema = z.object({
  suggestedTime: z
    .string()
    .describe(
      'The suggested time for the booking, based on historical data, in HH:mm format, taking into account the customer date preference.'
    ),
  reminderNoticeSuggestion: z
    .string()
    .describe(
      'A suggested reminder notice to send to the customer, designed to increase the likelihood of a successful booking. Example: A friendly reminder of your cleaning appointment scheduled for tomorrow. We look forward to making your space sparkle! If you have any questions or need to reschedule, please contact us at least 24 hours in advance.'
    ),
});
export type SuggestOptimalBookingTimeOutput = z.infer<typeof SuggestOptimalBookingTimeOutputSchema>;

export async function suggestOptimalBookingTime(
  input: SuggestOptimalBookingTimeInput
): Promise<SuggestOptimalBookingTimeOutput> {
  return suggestOptimalBookingTimeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOptimalBookingTimePrompt',
  input: {schema: SuggestOptimalBookingTimeInputSchema},
  output: {schema: SuggestOptimalBookingTimeOutputSchema},
  prompt: `You are an AI assistant designed to suggest the optimal booking time and reminder notices for cleaning services based on historical data.

  Consider the following factors when making your suggestion:
  - Historical booking data showing popular times for similar services
  - Customer's preferred date for the service: {{{datePreference}}}
  - Service Type: {{{serviceType}}}
  - Number of Bedrooms: {{{bedrooms}}}
  - Number of Bathrooms: {{{bathrooms}}}

  Output the suggested booking time in HH:mm format and provide a compelling reminder notice suggestion, using the present tense. The reminder notice should be brief and friendly, encouraging the customer to keep the booking.
  Here is a suggested output in JSON format:
  {
    "suggestedTime": "HH:mm",
    "reminderNoticeSuggestion": "Reminder notice here"
  }`,
});

const suggestOptimalBookingTimeFlow = ai.defineFlow(
  {
    name: 'suggestOptimalBookingTimeFlow',
    inputSchema: SuggestOptimalBookingTimeInputSchema,
    outputSchema: SuggestOptimalBookingTimeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
