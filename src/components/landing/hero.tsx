import Link from "next/link";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
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
        <Button size="lg">Crear Nueva Sesión</Button>
        <Button variant="outline" size="lg" asChild>
          <Link href="#" target="_blank" rel="noreferrer">
            <Github className="mr-2 h-5 w-5" />
            Ver en GitHub
          </Link>
        </Button>
      </div>
    </section>
  );
}
