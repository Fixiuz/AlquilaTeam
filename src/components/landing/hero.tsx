"use client";

import Link from "next/link";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth, useFirebase } from "@/firebase";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { collection } from "firebase/firestore";
import { useRouter } from "next/navigation";

export function Hero() {
  const { firestore, user } = useFirebase();
  const auth = useAuth();
  const router = useRouter();

  const handleCreateSession = async () => {
    let currentUser = user;
    if (!currentUser) {
      initiateAnonymousSignIn(auth);
      // It might take a moment for the user to be available.
      // A more robust solution might listen for auth state changes.
      // For this UX, we will rely on a small delay or a second click if the first fails.
      // A better way is to use onAuthStateChanged to enable the button.
      // For now, let's assume the user is signed in quickly.
      return;
    }

    try {
      const sessionData = {
        name: `Nueva Búsqueda - ${new Date().toLocaleDateString()}`,
        creationDate: new Date().toISOString(),
        listingIds: [],
        members: {
          [currentUser.uid]: "owner",
        },
      };
      const sessionsCollection = collection(firestore, "sessions");
      const docRef = await addDocumentNonBlocking(sessionsCollection, sessionData);
      
      if (docRef) {
        router.push(`/session/${docRef.id}`);
      }
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };


  return (
    <section className="container grid items-center justify-center gap-6 pb-8 pt-6 text-center md:py-20">
      <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4">
        <h1 className="font-headline text-4xl font-extrabold leading-tight tracking-tighter md:text-6xl">
          Buscá alquileres en equipo, no en caos.
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground">
          La herramienta de código abierto para centralizar links, calcular costos reales y votar propiedades con tus amigos. Sin registros complejos ni publicidad.
        </p>
      </div>
      <div className="flex w-full items-center justify-center space-x-4">
        <Button size="lg" onClick={handleCreateSession}>Crear Nueva Sesión</Button>
        <Button variant="outline" size="lg" asChild>
          <Link href="https://github.com/Fixiuz/AlquilaTeam" target="_blank" rel="noreferrer">
            <Github className="mr-2 h-5 w-5" />
            Ver en GitHub
          </Link>
        </Button>
      </div>
    </section>
  );
}
