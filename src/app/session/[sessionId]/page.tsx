'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { doc, collection, query, orderBy, updateDoc, getDoc } from 'firebase/firestore';
import { useDoc, useCollection, useFirestore, useFirebase, useUser, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { SiteHeader } from '@/components/shared/site-header';
import { AddListingForm } from '@/components/session/add-listing-form';
import { ListingsGrid } from '@/components/session/listings-grid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Check, X, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { Auth } from 'firebase/auth';

async function addUserToSession(firestore: any, sessionId: string, userId: string) {
    const sessionRef = doc(firestore, 'sessions', sessionId);
    try {
        await updateDoc(sessionRef, {
            [`members.${userId}`]: 'member'
        });
        return true;
    } catch (error) {
        console.error("Error adding user to session:", error);
        // This might fail if rules don't allow it, so we check access again.
        const updatedSession = await getDoc(sessionRef);
        return updatedSession.exists() && updatedSession.data().members[userId];
    }
}

export default function SessionPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const firestore = useFirestore();
  const { auth } = useFirebase();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const { isCopied, copyToClipboard } = useCopyToClipboard();

  const [isReadyToFetch, setIsReadyToFetch] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  // This effect handles the auth and session membership logic
  useEffect(() => {
    if (isUserLoading || !firestore || !auth) {
      return; // Wait until user state and firebase services are ready
    }

    if (!user) {
      // If no user, sign in anonymously. The onAuthStateChanged listener
      // in the useUser hook will cause this effect to re-run with the new user.
      initiateAnonymousSignIn(auth as Auth);
      return; 
    }

    // Now we have a user. Let's check if they are part of the session.
    const checkAndJoinSession = async () => {
        const sessionRef = doc(firestore, 'sessions', sessionId);
        const sessionSnap = await getDoc(sessionRef);

        if (sessionSnap.exists()) {
            const sessionData = sessionSnap.data();
            if (sessionData.members && sessionData.members[user.uid]) {
                // User is already a member, we are ready to fetch data
                setIsReadyToFetch(true);
            } else {
                // User is not a member, let's add them
                const success = await addUserToSession(firestore, sessionId, user.uid);
                if (success) {
                    setIsReadyToFetch(true);
                }
            }
        } else {
            // Session doesn't exist. Maybe handle this case with a toast or redirect.
            console.error("Session not found");
        }
    };

    checkAndJoinSession();

  }, [user, isUserLoading, sessionId, firestore, auth]);


  // Data fetching hooks will only run when isReadyToFetch is true
  const sessionRef = useMemoFirebase(() => 
    isReadyToFetch && firestore ? doc(firestore, 'sessions', sessionId) : null
  , [isReadyToFetch, firestore, sessionId]);
  const { data: session, isLoading: isSessionLoading } = useDoc(sessionRef);

  const listingsQuery = useMemoFirebase(() => 
    isReadyToFetch && firestore 
      ? query(collection(firestore, `sessions/${sessionId}/listings`), orderBy('creationDate', 'desc'))
      : null
  , [isReadyToFetch, firestore, sessionId]);
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

  const handleShare = () => {
    copyToClipboard(window.location.href);
    toast({
      title: "¡Enlace copiado!",
      description: "Ya podés compartir el link con tus amigos.",
    });
  }

  // Show a generic loading state until we are ready to fetch or if we are fetching
  if (!isReadyToFetch || isSessionLoading || isUserLoading) {
    return <div>Cargando sesión...</div>;
  }

  if (!session) {
    return <div>Sesión no encontrada o no tenés permiso para verla.</div>;
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
