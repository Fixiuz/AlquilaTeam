'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { doc, collection, query, orderBy, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useDoc, useCollection, useFirestore, useFirebase, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { SiteHeader } from '@/components/shared/site-header';
import { AddListingForm } from '@/components/session/add-listing-form';
import { ListingsGrid } from '@/components/session/listings-grid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Check, X, Share2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';

export default function SessionPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const { firestore, user, isUserLoading } = useFirebase();
  const auth = useAuth();
  const { toast } = useToast();
  const { isCopied, copyToClipboard } = useCopyToClipboard();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [permissionState, setPermissionState] = useState<'checking' | 'granted' | 'denied'>('checking');

  // Data fetching hooks
  const sessionRef = useMemoFirebase(() => 
    firestore && permissionState === 'granted' ? doc(firestore, 'sessions', sessionId) : null
  , [firestore, sessionId, permissionState]);

  const { data: session, isLoading: isSessionLoading } = useDoc(sessionRef);

  const listingsQuery = useMemoFirebase(() => 
    firestore && permissionState === 'granted'
      ? query(collection(firestore, `sessions/${sessionId}/listings`), orderBy('creationDate', 'desc'))
      : null
  , [firestore, sessionId, permissionState]);
  
  const { data: listings, isLoading: areListingsLoading } = useCollection(listingsQuery);

  useEffect(() => {
    if (isUserLoading || !firestore) return;

    const checkAndGrantPermissions = async () => {
      let currentUser = user;
      
      // If no user, sign in anonymously
      if (!currentUser) {
        initiateAnonymousSignIn(auth);
        // We can't proceed until the user is signed in, so we'll let the effect re-run when auth state changes.
        return;
      }
      
      // Now that we have a user, check their membership
      try {
        const sessionDocRef = doc(firestore, 'sessions', sessionId);
        const sessionSnap = await getDoc(sessionDocRef);

        if (sessionSnap.exists()) {
          const sessionData = sessionSnap.data();
          // Public session - anyone can access
           setPermissionState('granted');
        } else {
          setPermissionState('denied');
        }
      } catch (error) {
        console.error("Error checking permissions:", error);
        setPermissionState('denied');
      }
    };

    checkAndGrantPermissions();

  }, [user, isUserLoading, firestore, sessionId, auth]);


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

  const handleShare = () => {
    copyToClipboard(window.location.href);
    toast({
      title: "¡Enlace copiado!",
      description: "Ya podés compartir el link con tus amigos.",
    });
  }

  if (permissionState === 'checking' || (permissionState === 'granted' && isSessionLoading)) {
    return (
      <div className="flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Cargando sesión y verificando permisos...</p>
            </div>
        </main>
      </div>
    );
  }

  if (permissionState === 'denied' || !session) {
     return (
      <div className="flex flex-col min-h-screen">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
             <div className="text-center">
                <h1 className="text-2xl font-bold mb-2">Sesión no encontrada o sin acceso</h1>
                <p className="text-muted-foreground">Asegurate de que el link sea correcto.</p>
            </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <main className="flex-1 container py-8">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
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
            <Button onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              {isCopied ? '¡Copiado!' : 'Compartir Sesión'}
            </Button>
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
