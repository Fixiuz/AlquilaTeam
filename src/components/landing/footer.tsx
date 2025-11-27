import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bug, Code, FileText, Users } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t">
      <div className="container grid items-center gap-8 pb-8 pt-6 md:py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-6 w-6" />
            <span className="text-lg font-bold">AlquilaTeam</span>
          </div>
          <p className="max-w-md text-balance text-sm leading-loose text-muted-foreground">
            Hecho para ayudar, no para vender. Este proyecto es de uso libre y gratuito. Creemos que encontrar un hogar ya es lo suficientemente difícil como para complicarlo más.
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} AlquilaTeam. Todos los derechos reservados.
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="#">
                <Bug className="h-4 w-4 mr-2" />
                Reportar un bug
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="#">
                <Code className="h-4 w-4 mr-2" />
                Contribuir al Código
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="#">
                <FileText className="h-4 w-4 mr-2" />
                Licencia MIT
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
