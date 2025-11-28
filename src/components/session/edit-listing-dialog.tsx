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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useFirebase, WithId, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useEffect } from 'react';

const listingSchema = z.object({
  url: z.string().url({ message: 'Por favor, ingresá una URL válida.' }),
  rent: z.coerce.number().positive({ message: 'El alquiler debe ser un número positivo.' }),
  expenses: z.coerce.number().min(0, { message: 'Las expensas no pueden ser negativas.' }).optional(),
  agencyFee: z.coerce.number().min(0, { message: 'El costo no puede ser negativo.' }).optional(),
  deposit: z.string().optional(),
  adjustmentFrequency: z.enum(['trimestral', 'cuatrimestral', 'semestral', 'desconocido']).optional(),
  adjustmentIndex: z.enum(['IPC', 'ICL', 'desconocido']).optional(),
});

type ListingFormValues = z.infer<typeof listingSchema>;

interface Listing {
    sessionId: string;
    url: string;
    rent: number;
    expenses?: number;
    agencyFee?: number;
    deposit?: string;
    adjustmentFrequency?: 'trimestral' | 'cuatrimestral' | 'semestral' | 'desconocido';
    adjustmentIndex?: 'IPC' | 'ICL' | 'desconocido';
}

interface EditListingDialogProps {
  listing: WithId<Listing>;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function EditListingDialog({ listing, isOpen, onOpenChange }: EditListingDialogProps) {
  const { firestore } = useFirebase();
  const { toast } = useToast();

  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      url: listing.url || '',
      rent: listing.rent || 0,
      expenses: listing.expenses || 0,
      agencyFee: listing.agencyFee || 0,
      deposit: listing.deposit || '',
      adjustmentFrequency: listing.adjustmentFrequency || 'desconocido',
      adjustmentIndex: listing.adjustmentIndex || 'desconocido'
    },
  });

  useEffect(() => {
    form.reset({
      url: listing.url || '',
      rent: listing.rent || 0,
      expenses: listing.expenses || 0,
      agencyFee: listing.agencyFee || 0,
      deposit: listing.deposit || '',
      adjustmentFrequency: listing.adjustmentFrequency || 'desconocido',
      adjustmentIndex: listing.adjustmentIndex || 'desconocido'
    });
  }, [listing, form]);

  const onSubmit = (data: ListingFormValues) => {
    if (!firestore) return;

    const listingRef = doc(firestore, `sessions/${listing.sessionId}/listings`, listing.id);
    updateDocumentNonBlocking(listingRef, data);
    
    toast({
      title: "Propiedad actualizada!",
      description: "Los cambios se guardaron correctamente.",
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Propiedad</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Frecuencia" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="desconocido">Desconocido</SelectItem>
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
                     <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Índice" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="desconocido">Desconocido</SelectItem>
                        <SelectItem value="ICL">ICL</SelectItem>
                        <SelectItem value="IPC">IPC</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
                <Button type="submit">Guardar Cambios</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
