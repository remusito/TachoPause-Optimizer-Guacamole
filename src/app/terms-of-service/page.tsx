import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { FileText } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-8">
      <Card className="border-none shadow-none">
        <CardHeader className="text-center">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Términos de Uso</h1>
          </div>
          <CardDescription>
            
          </CardDescription>
        </CardHeader>
        <CardContent className="prose prose-zinc dark:prose-invert max-w-none">
          <p>
            Estos términos y condiciones describen las reglas y regulaciones para el uso de la aplicación TachoPause Optimizer.
          </p>

          <h2>1. Aceptación de los Términos</h2>
          <p>
            Al acceder y utilizar nuestra aplicación, aceptas estar sujeto a estos Términos de Uso y a todas las leyes y regulaciones aplicables. Si no estás de acuerdo con alguno de estos términos, tienes prohibido usar o acceder a esta aplicación.
          </p>

          <h2>2. Licencia de Uso</h2>
          <p>
            Se concede permiso para descargar temporalmente una copia de los materiales (información o software) en la aplicación TachoPause Optimizer solo para visualización transitoria personal y no comercial. Esta es la concesión de una licencia, no una transferencia de título.
          </p>

          <h2>3. Funcionalidades Premium</h2>
          <p>
            Ofrecemos funcionalidades 'Premium' a través de una compra única. Esta compra está destinada a apoyar el desarrollo continuo de la aplicación y desbloquear características avanzadas. No garantizamos que todas las futuras funcionalidades estarán incluidas en la compra inicial.
          </p>

          <h2>4. Limitaciones y Responsabilidad</h2>
          <p>
            La aplicación TachoPause Optimizer se proporciona 'tal cual'. No garantizamos que el servicio sea ininterrumpido o libre de errores. Los datos proporcionados, como la velocidad del GPS y los cálculos de tiempo, pueden no ser 100% precisos y deben usarse solo como referencia. No nos hacemos responsables de ninguna multa, sanción o consecuencia legal derivada del uso de la información proporcionada por la aplicación.
          </p>

          <h2>5. Cambios a estos Términos</h2>
          <p>
            Podemos revisar estos términos de uso en cualquier momento sin previo aviso. Al usar esta aplicación, aceptas estar sujeto a la versión actual de estos Términos de Uso.
          </p>

          <h2>6. Contacto</h2>
          <p>
            Si tienes alguna pregunta sobre estos Términos, contáctanos en <a href="mailto:tachopauseoptimizer@gmail.com">tachopauseoptimizer@gmail.com</a>.
          </p>

        </CardContent>
      </Card>
    </div>
  );
}
