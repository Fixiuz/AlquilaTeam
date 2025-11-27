import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  {
    step: "01",
    title: "Iniciá la Sesión",
    description: "Creá una sala temporal y ponéle nombre a la búsqueda.",
  },
  {
    step: "02",
    title: "Compartí el Link",
    description: "Pasale el enlace a tus amigos o compañeros de piso. No necesitan crear cuenta.",
  },
  {
    step: "03",
    title: "Colaboren",
    description: "Cada uno carga lo que encuentra. Voten, comenten y decidan cuál visitar.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Simple. Gratis. Privado.</h2>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl gap-8 py-12 md:grid-cols-3">
          {steps.map((step, index) => (
            <Card key={index} className="flex flex-col text-center shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-primary/20">
              <CardHeader>
                <div className="mx-auto text-4xl font-black text-primary/30">{step.step}</div>
                <CardTitle className="font-headline">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
