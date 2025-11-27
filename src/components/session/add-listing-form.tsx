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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const listingSchema = z.object({
  url: z.string().url({ message: 'Por favor, ingresá una URL válida.' }),
  rent: z.coerce.number().positive({ message: 'El alquiler debe ser un número positivo.' }),
  expenses: z.coerce.number().min(0, { message: 'Las expensas no pueden ser negativas.' }).optional(),
  agencyFee: z.coerce.number().min(0, { message: 'El costo no puede ser negativo.' }).optional(),
  deposit: z.string().optional(),
  adjustmentFrequency: z.enum(['trimestral', 'cuatrimestral', 'semestral']).optional(),
  adjustmentIndex: z.enum(['IPC', 'ICL']).optional(),
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
      agencyFee: 0,
      deposit: '',
    },
  });

  const onSubmit = (data: ListingFormValues) => {
    if (!firestore) return;

    const listingsCollection = collection(firestore, `sessions/${sessionId}/listings`);
    addDocumentNonBlocking(listingsCollection, {
        ...data,
        sessionId,
        creationDate: new Date().toISOString()
    });
    
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
            <div className="grid grid-cols-2 gap-4">
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
            </div>
            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="agencyFee"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Costo Inmobiliaria</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="400000" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="deposit"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Depósito / Pagaré</FormLabel>
                        <FormControl>
                            <Input placeholder="1 mes / Pagaré" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="adjustmentFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ajuste</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Frecuencia" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="trimestral">Trimestral</SelectItem>
                        <SelectItem value="cuatrimestral">Cuatrimestral</SelectItem>
                        <SelectItem value="semestral">Semestral</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="adjustmentIndex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Índice</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Índice" />
                        </Trigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ICL">ICL</SelectItem>
                        <SelectItem value="IPC">IPC</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="w-full">
              Agregar
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}