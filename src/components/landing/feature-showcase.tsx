import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, FileClock, LayoutGrid } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const features = [
  {
    icon: <LayoutGrid className="h-8 w-8 text-primary" />,
    title: "Centralización",
    description: "Pegan el link y se genera una ficha compartida para todos.",
  },
  {
    icon: <Calculator className="h-8 w-8 text-primary" />,
    title: "Cuentas Claras",
    description: "Visualicen el costo real sumando Alquiler + Expensas.",
  },
  {
    icon: <FileClock className="h-8 w-8 text-primary" />,
    title: "Sin Sorpresas",
    description: "Registren el tipo de ajuste (ICL o IPC) y la frecuencia de aumento antes de ir a visitar.",
  },
];

export function FeatureShowcase() {
  const dashboardImage = PlaceHolderImages.find(p => p.id === 'dashboard-showcase');

  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-secondary/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Toda la información importante, en un solo lugar.</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Dejen de hacer scroll infinito en el chat buscando ese link que alguien mandó ayer.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
          <div className="relative rounded-xl shadow-2xl overflow-hidden">
            {dashboardImage && (
              <Image
                alt="Dashboard de AlquilaTeam"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full"
                src={dashboardImage.imageUrl}
                width={1200}
                height={800}
                data-ai-hint={dashboardImage.imageHint}
              />
            )}
             <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </div>
          <div className="flex flex-col justify-center space-y-4">
            <ul className="grid gap-6">
              {features.map((feature, index) => (
                <li key={index}>
                  <div className="grid grid-flow-col auto-cols-max items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
