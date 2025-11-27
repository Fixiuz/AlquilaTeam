'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, collection, query, orderBy } from 'firebase/firestore';
import { useDoc, useCollection, useFirestore, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { SiteHeader } from '@/components/shared/site-header';
import { AddListingForm } from '@/components/session/add-listing-form';
import { ListingsGrid } from '@/components/session/listings-grid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SessionPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const firestore = useFirestore();
  const { toast } = useToast();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const sessionRef = useMemoFirebase(() => 
    firestore && sessionId ? doc(firestore, 'sessions', sessionId) : null
  , [firestore, sessionId]);
  
  const { data: session, isLoading: isSessionLoading } = useDoc(sessionRef);

  const listingsQuery = useMemoFirebase(() =>
    firestore && sessionId ? query(collection(firestore, `sessions/${sessionId}/listings`), orderBy('creationDate', 'desc')) : null
  , [firestore, sessionId]);

  const { data: listings, isLoading: areListingsLoading } = useCollection(listingsQuery);

  const handleTitleEdit = () => {
    if (session) {
      setNewTitle(session.name);
      setIsEditingTitle(true);
    }
  };

  const handleTitleSave = () => {
    if (sessionRef && newTitle.trim() !== '' && newTitle.trim() !== session?.name) {
      updateDocumentNonBlocking(sessionRef, { name: newTitle.trim() });
      toast({
        title: "Título actualizado",
        description: "El nombre de la sesión se guardó correctamente.",
      });
    }
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setIsEditingTitle(false);
  };

  if (isSessionLoading) {
    return <div>Cargando sesión...</div>;
  }

  if (!session) {
    return <div>Sesión no encontrada.</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 container py-8">
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <Input 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                    className="text-3xl font-bold h-12"
                  />
                  <Button size="icon" onClick={handleTitleSave}><Check className="h-5 w-5" /></Button>
                  <Button size="icon" variant="ghost" onClick={handleTitleCancel}><X className="h-5 w-5" /></Button>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold">{session.name}</h1>
                  <Button variant="ghost" size="icon" onClick={handleTitleEdit} className="text-muted-foreground hover:text-primary">
                    <Pencil className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1">
                <AddListingForm sessionId={sessionId} />
            </div>
            <div className="lg:col-span-2">
                <ListingsGrid listings={listings || []} isLoading={areListingsLoading} />
            </div>
        </div>
      </main>
    </div>
  );
}
    