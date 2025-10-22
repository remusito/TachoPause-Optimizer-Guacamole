'use client';

import React from 'react';
import { MainSidebar } from '@/components/main-sidebar';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

const tutorialSteps = [
    {
        icon: <Icons.Play className="h-5 w-5"/>,
        title: "1. Inicia tu Jornada",
        content: "Ve a la pantalla principal (Dashboard) y pulsa el botón 'Iniciar Jornada'. Esto registrará la hora de inicio y empezará a monitorizar tu actividad automáticamente."
    },
    {
        icon: <Icons.Truck className="h-5 w-5"/>,
        title: "2. Conducción Automática",
        content: "La aplicación detectará automáticamente cuándo empiezas a moverte y cuándo te detienes, registrando estos eventos sin que tengas que hacer nada."
    },
    {
        icon: <Icons.Pause className="h-5 w-5"/>,
        title: "3. Pausas de Conducción",
        content: "Pulsa el botón 'Pausa de Conducción' cuando necesites tomar un descanso. Vuelve a pulsarlo para reanudar la conducción. La app se encarga de registrar los tiempos por ti."
    },
    {
        icon: <Icons.Speedometer className="h-5 w-5"/>,
        title: "4. Control de Tiempos de Conducción",
        content: "En el Dashboard, puedes ver en tiempo real cuánto tiempo de conducción continua llevas, cuánto te queda antes de la próxima pausa obligatoria y la duración de tu pausa actual."
    },
    {
        icon: <Icons.close className="h-5 w-5"/>,
        title: "5. Finaliza tu Jornada",
        content: "Cuando termines tu día de trabajo, pulsa 'Finalizar Jornada'. Todos los eventos del día quedarán guardados de forma segura."
    },
    {
        icon: <Icons.History className="h-5 w-5"/>,
        title: "6. Revisa tu Historial",
        content: "En la sección 'Historial', puedes consultar los detalles de cada jornada laboral, incluyendo la cronología de eventos y los tiempos totales."
    },
    {
        icon: <Icons.Route className="h-5 w-5"/>,
        title: "7. Optimiza tus Rutas",
        content: "Usa el 'Optimizador de Ruta' para planificar tus viajes. Añade un origen, un destino y múltiples paradas. La app calculará la ruta más eficiente, ahorrándote tiempo y combustible."
    },
    {
        icon: <Icons.Wrench className="h-5 w-5"/>,
        title: "8. Gestiona el Mantenimiento",
        content: "Registra y supervisa el mantenimiento de tus vehículos, como los cambios de neumáticos, en la sección de 'Mantenimiento'."
    }
];

const faqData = [
    {
        question: "¿Cómo calcula la app los tiempos de conducción?",
        answer: "La aplicación utiliza los sensores de movimiento de tu dispositivo para detectar cuándo el vehículo está en movimiento. Los tiempos se calculan desde que se detecta el inicio del movimiento hasta que se detiene."
    },
    {
        question: "¿Necesito tener la aplicación abierta todo el tiempo?",
        answer: "No. Una vez que inicias tu jornada, la app puede funcionar en segundo plano. Sin embargo, para registrar pausas manualmente, necesitarás interactuar con la aplicación."
    },
    {
        question: "¿Qué pasa si olvido finalizar mi jornada?",
        answer: "La jornada permanecerá activa. Te recomendamos que la finalices tan pronto como te des cuenta para que los registros sean precisos. En el futuro, añadiremos recordatorios para evitar esto."
    },
    {
        question: "¿Son mis datos privados y seguros?",
        answer: "Sí. Todos tus datos se almacenan de forma segura y solo tú tienes acceso a ellos. No compartimos tu información con terceros."
    }
]

export default function TutorialPage() {
  return (
    <div className="flex min-h-dvh bg-background">
      <MainSidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 flex h-16 items-center border-b px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Icons.BookOpen className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-bold">Tutorial y Ayuda</h1>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <section id="how-it-works" className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">¿Cómo Funciona?</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {tutorialSteps.map((step, index) => (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                            {step.icon}
                            <CardTitle className="text-base font-semibold">{step.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{step.content}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
             <Card className="mt-8 bg-gradient-to-r from-primary/10 to-primary/20 border-primary/30">
                <CardHeader className="flex-row items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                         <Icons.Premium className="h-6 w-6 text-primary"/>
                    </div>
                    <div>
                        <CardTitle>Desbloquea Todo el Potencial</CardTitle>
                        <CardDescription>Pásate a Premium para obtener informes avanzados, copias de seguridad en la nube y soporte prioritario.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                   <Link href="/premium">
                         <Button variant="default" size="sm">
                            <Icons.Premium className="h-4 w-4 mr-2"/>
                            Ver Planes Premium
                        </Button>
                   </Link>
                </CardContent>
            </Card>
          </section>

          <section id="faq">
            <h2 className="text-2xl font-semibold mb-4">Preguntas Frecuentes (FAQ)</h2>
            <Accordion type="single" collapsible className="w-full">
                {faqData.map((faq, index) => (
                     <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger>{faq.question}</AccordionTrigger>
                        <AccordionContent>
                           {faq.answer}
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
          </section>
        </main>
      </div>
    </div>
  );
}
