'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirebase } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const listingSchema = z.object({
  url: z.string().url({ message: 'Por favor, ingresá una URL válida.' }),
  rent: z.coerce.number().positive({ message: 'El alquiler debe ser un número positivo.' }),
  expenses: z.coerce.number().min(0, { message: 'Las expensas no pueden ser negativas.' }).optional(),
});

type ListingFormValues = z.infer<typeof listingSchema>;

interface AddListingFormProps {
  sessionId: string;
}

export function AddListingForm({ sessionId }: AddListingFormProps) {
  const { firestore } = useFirebase();
  const { toast } = useToast();

  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      url: '',
      rent: 0,
      expenses: 0,
    },
  });

  const onSubmit = (data: ListingFormValues) => {
    if (!firestore) return;

    const listingsCollection = collection(firestore, `sessions/${sessionId}/listings`);
    addDocumentNonBlocking(listingsCollection, { ...data, sessionId, creationDate: new Date().toISOString() });
    
    toast({
      title: "Propiedad agregada!",
      description: "La nueva propiedad fue añadida a la lista.",
    });

    form.reset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agregar Nueva Propiedad</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de la Propiedad</FormLabel>
                  <FormControl>
                    <Input placeholder="https://www.zonaprop.com.ar/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alquiler (ARS)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="250000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="expenses"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expensas (ARS)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="50000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">Agregar</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
