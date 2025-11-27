'use server';
/**
 * @fileOverview An AI flow to extract rental listing information from a URL.
 *
 * - extractListingInfo - A function that handles the listing info extraction.
 * - ExtractListingInfoInput - The input type for the extractListingInfo function.
 * - ExtractListingInfoOutput - The return type for the extractListingInfo function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ExtractListingInfoInputSchema = z.object({
  url: z.string().url().describe('The URL of the rental listing.'),
});
export type ExtractListingInfoInput = z.infer<
  typeof ExtractListingInfoInputSchema
>;

const ExtractListingInfoOutputSchema = z.object({
  title: z
    .string()
    .describe('A concise and descriptive title for the property listing.'),
  description: z
    .string()
    .describe(
      'A summary of the property including key features like number of rooms, bathrooms, and any standout amenities.'
    ),
  images: z
    .array(z.string().url())
    .describe('An array of URLs for the main images of the property.'),
});
export type ExtractListingInfoOutput = z.infer<
  typeof ExtractListingInfoOutputSchema
>;

export async function extractListingInfo(
  input: ExtractListingInfoInput
): Promise<ExtractListingInfoOutput> {
  return extractListingInfoFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractListingInfoPrompt',
  input: { schema: ExtractListingInfoInputSchema },
  output: { schema: ExtractListingInfoOutputSchema },
  prompt: `You are an expert real estate listing data extractor.
You will be given the content of a rental property listing page from a URL.
Your task is to extract the following information:
1.  A clear, descriptive title for the listing.
2.  A brief summary of its key features.
3.  An array of URLs for the main property images.

Analyze the provided web page content and return the data in the specified JSON format.
Web Page Content:
{{web url=url}}
`,
});

const extractListingInfoFlow = ai.defineFlow(
  {
    name: 'extractListingInfoFlow',
    inputSchema: ExtractListingInfoInputSchema,
    outputSchema: ExtractListingInfoOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
