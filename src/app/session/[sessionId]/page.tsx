'use client';

import { useParams } from 'next/navigation';
import { doc, collection, query, orderBy } from 'firebase/firestore';
import { useDoc, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { SiteHeader } from '@/components/shared/site-header';
import { AddListingForm } from '@/components/session/add-listing-form';
import { ListingsGrid } from '@/components/session/listings-grid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SessionPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const firestore = useFirestore();

  const sessionRef = useMemoFirebase(() => 
    firestore && sessionId ? doc(firestore, 'sessions', sessionId) : null
  , [firestore, sessionId]);
  
  const { data: session, isLoading: isSessionLoading } = useDoc(sessionRef);

  const listingsQuery = useMemoFirebase(() =>
    firestore && sessionId ? query(collection(firestore, `sessions/${sessionId}/listings`), orderBy('creationDate', 'desc')) : null
  , [firestore, sessionId]);

  const { data: listings, isLoading: areListingsLoading } = useCollection(listingsQuery);

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
            <h1 className="text-3xl font-bold">{session.name}</h1>
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
    