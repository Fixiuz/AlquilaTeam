'use server';
/**
 * @fileOverview Extracts listing information from a URL.
 *
 * - extractListingInfo - A function that handles the listing information extraction process.
 * - ExtractListingInfoInput - The input type for the extractListingInfo function.
 * - ExtractListingInfoOutput - The return type for the extractListingInfo function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractListingInfoInputSchema = z.object({
  url: z.string().url().describe('The URL of the property listing.'),
});
export type ExtractListingInfoInput = z.infer<typeof ExtractListingInfoInputSchema>;

const ExtractListingInfoOutputSchema = z.object({
  imageUrl: z.string().url().optional().describe('The main image URL of the property.'),
  rent: z.number().optional().describe('The monthly rent amount.'),
  expenses: z.number().optional().describe('The monthly expenses amount.'),
  title: z.string().optional().describe('The title of the listing.'),
});
export type ExtractListingInfoOutput = z.infer<typeof ExtractListingInfoOutputSchema>;


export async function extractListingInfo(input: ExtractListingInfoInput): Promise<ExtractListingInfoOutput> {
  return extractListingInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractListingInfoPrompt',
  input: {schema: ExtractListingInfoInputSchema},
  output: {schema: ExtractListingInfoOutputSchema},
  prompt: `You are an expert real estate listing analyst. Your task is to extract structured information from a given URL.

Please analyze the content of the following URL and extract the main image URL of the property, the rent amount, and the expenses amount.

If you cannot find a specific piece of information, leave it out.

URL: {{{url}}}`,
});

const extractListingInfoFlow = ai.defineFlow(
  {
    name: 'extractListingInfoFlow',
    inputSchema: ExtractListingInfoInputSchema,
    outputSchema: ExtractListingInfoOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
