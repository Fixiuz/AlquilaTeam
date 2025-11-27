'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { collection, query, orderBy } from 'firebase/firestore';
import { WithId, useCollection, useFirebase, useMemoFirebase } from '@/firebase';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { MessageCircle } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Comment {
  text: string;
  author: string;
  creationDate: string;
}

interface ListingCommentsProps {
  listing: WithId<{ sessionId: string }>;
}

const commentSchema = z.object({
  text: z.string().min(1, 'El comentario no puede estar vacío.'),
});

export function ListingComments({ listing }: ListingCommentsProps) {
  const { firestore, user } = useFirebase();
  
  const commentsQuery = useMemoFirebase(() =>
    firestore
      ? query(
          collection(firestore, `sessions/${listing.sessionId}/listings/${listing.id}/comments`),
          orderBy('creationDate', 'asc')
        )
      : null
  , [firestore, listing.sessionId, listing.id]);

  const { data: comments, isLoading: areCommentsLoading } = useCollection<Comment>(commentsQuery);

  const form = useForm({
    resolver: zodResolver(commentSchema),
    defaultValues: { text: '' },
  });

  const onSubmit = (data: { text: string }) => {
    if (!firestore || !user) return;

    const commentsCollection = collection(firestore, `sessions/${listing.sessionId}/listings/${listing.id}/comments`);
    addDocumentNonBlocking(commentsCollection, {
      text: data.text,
      author: user.isAnonymous ? `Anónimo-${user.uid.substring(0, 5)}` : user.displayName || 'Usuario',
      creationDate: new Date().toISOString(),
      listingId: listing.id,
    });

    form.reset();
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            <span>Comentarios ({comments?.length ?? 0})</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4">
            <div className="max-h-48 space-y-3 overflow-y-auto pr-2">
              {areCommentsLoading && (
                <>
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </>
              )}
              {comments && comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="text-sm bg-secondary/50 p-2 rounded-md">
                    <p className="font-medium">{comment.text}</p>
                    <p className="text-xs text-muted-foreground">
                      {comment.author} -{' '}
                      {formatDistanceToNow(new Date(comment.creationDate), { addSuffix: true, locale: es })}
                    </p>
                  </div>
                ))
              ) : (
                !areCommentsLoading && <p className="text-sm text-muted-foreground">No hay comentarios todavía.</p>
              )}
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-2">
                <FormField
                  control={form.control}
                  name="text"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder="Escribí un comentario..." {...field} disabled={!user} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={!user}>Enviar</Button>
              </form>
            </Form>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
    