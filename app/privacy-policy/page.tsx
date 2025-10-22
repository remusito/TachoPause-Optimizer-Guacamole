'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { useDeveloperMode } from '@/hooks/use-developer-mode';
import { FileLock } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const [tapCount, setTapCount] = useState(0);
  const { activateDeveloperMode } = useDeveloperMode();
  const { toast } = useToast();

  const handleTitleTap = () => {
    const newTapCount = tapCount + 1;
    setTapCount(newTapCount);

    if (newTapCount >= 8) {
      activateDeveloperMode();
      toast({
        title: "Modo Desarrollador Activado",
        description: "Todas las funciones premium están disponibles por 1 hora.",
      });
      setTapCount(0); // Reset count after activation
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-8">
      <Card className="border-none shadow-none">
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <FileLock className="h-8 w-8 text-primary" />
            <h1 
              className="text-3xl font-bold select-none cursor-pointer"
              onClick={handleTitleTap}
            >
              Política de Privacidad
            </h1>
          </div>
          <CardDescription>
            
          </CardDescription>
        </CardHeader>
        <CardContent className="prose prose-zinc dark:prose-invert max-w-none">
          <p>
            Tu privacidad es importante para nosotros. En TachoPause Optimizer, tenemos la política de respetar tu privacidad con respecto a cualquier información que podamos recopilar de ti a través de nuestra aplicación.
          </p>

          <h2>1. Qué información recopilamos</h2>
          <p>
            Recopilamos varios tipos de información con el fin de proporcionar y mejorar nuestro servicio:
          </p>
          <ul>
            <li><strong>Datos de Cuenta:</strong> Al registrarte, recopilamos información personal como tu nombre, dirección de correo electrónico y foto de perfil (si la proporcionas a través de un servicio de terceros como Google).</li>
            <li><strong>Datos de uso y GPS:</strong> Para proporcionarte las funcionalidades principales como el velocímetro, el historial y las estadísticas, recopilamos datos sobre tu actividad en la aplicación, incluyendo datos de ubicación GPS, velocidad, distancia y tiempos de conducción/pausa.</li>
            <li><strong>Información del dispositivo:</strong> Recopilamos información sobre el dispositivo que utilizas para acceder a nuestros servicios.</li>
          </ul>

          <h2>2. Cómo usamos la información</h2>
          <p>
            Usamos la información que recopilamos para los siguientes propósitos:
          </p>
          <ul>
            <li>Proporcionar, operar y mantener nuestros servicios.</li>
            <li>Mejorar, personalizar y ampliar nuestros servicios.</li>
            <li>Entender y analizar cómo utilizas nuestros servicios.</li>
            <li>Desarrollar nuevos productos, servicios y funcionalidades.</li>
            <li>Comunicarnos contigo para proporcionar actualizaciones y otra información relacionada con el servicio.</li>
            <li>Para fines de cumplimiento, incluida la aplicación de nuestros Términos de Servicio.</li>
          </ul>

          <h2>3. Seguridad de los Datos</h2>
          <p>
            La seguridad de tus datos es una prioridad, pero recuerda que ningún método de transmisión por Internet o de almacenamiento electrónico es 100% seguro. Aunque nos esforzamos por utilizar medios comercialmente aceptables para proteger tus Datos Personales, no podemos garantizar su seguridad absoluta.
          </p>

          <h2>4. Cambios a esta Política de Privacidad</h2>
          <p>
            Podemos actualizar nuestra Política de Privacidad de vez en cuando. Te notificaremos cualquier cambio publicando la nueva Política de Privacidad en esta página. Se recomienda revisar esta página periódicamente.
          </p>

          <h2>5. Contacto</h2>
          <p>
            Si tienes alguna pregunta sobre esta Política de Privacidad, contáctanos en <a href="mailto:tachopauseoptimizer@gmail.com">tachopauseoptimizer@gmail.com</a>.
          </p>

        </CardContent>
      </Card>
    </div>
  );
}
