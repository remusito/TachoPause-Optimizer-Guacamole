'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { FileText, Clock, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppLayout } from '@/components/app-layout';

export default function RegulationsPage() {
  return (
    <AppLayout title="Reglamento" showSettings={false}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Reglamento de Tacógrafos y Tiempos de Conducción</CardTitle>
            <CardDescription>
              Normativa europea (CE) 561/2006 sobre tiempos de conducción, pausas y descansos
            </CardDescription>
          </CardHeader>
        </Card>

        <Tabs defaultValue="driving" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="driving">Conducción</TabsTrigger>
            <TabsTrigger value="breaks">Pausas</TabsTrigger>
            <TabsTrigger value="rest">Descansos</TabsTrigger>
            <TabsTrigger value="infractions">Infracciones</TabsTrigger>
          </TabsList>

          {/* TAB: Tiempos de Conducción */}
          <TabsContent value="driving" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Tiempos Máximos de Conducción
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-4 rounded-lg border bg-muted/50">
                    <h4 className="font-semibold mb-2">Conducción diaria</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Máximo 9 horas</strong> de conducción diaria</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>Se puede extender a <strong>10 horas</strong> hasta <strong>2 veces por semana</strong></span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg border bg-muted/50">
                    <h4 className="font-semibold mb-2">Conducción semanal</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Máximo 56 horas</strong> en una semana</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Máximo 90 horas</strong> en dos semanas consecutivas</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg border bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <div className="space-y-1">
                        <h4 className="font-semibold text-amber-900 dark:text-amber-100">Importante</h4>
                        <p className="text-sm text-amber-800 dark:text-amber-200">
                          La conducción ininterrumpida no puede exceder las <strong>4 horas y 30 minutos</strong> sin una pausa.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Pausas */}
          <TabsContent value="breaks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.Play className="h-5 w-5 text-primary" />
                  Pausas Obligatorias
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg border bg-muted/50">
                  <h4 className="font-semibold mb-2">Pausa ininterrumpida</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Después de <strong>4 horas y 30 minutos</strong> de conducción, es obligatoria una pausa ininterrumpida de al menos <strong>45 minutos</strong>.</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg border bg-muted/50">
                  <h4 className="font-semibold mb-2">Pausa fraccionada</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    La pausa de 45 minutos se puede sustituir por dos pausas:
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Una primera pausa de al menos <strong>15 minutos</strong>.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Una segunda pausa de al menos <strong>30 minutos</strong>, que debe completarse dentro del período de 4.5 horas de conducción.</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-lg border bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="space-y-1">
                      <h4 className="font-semibold text-amber-900 dark:text-amber-100">Importante</h4>
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        Cualquier trabajo realizado durante este tiempo (incluso tareas de carga/descarga) <strong>no cuenta como pausa</strong> y se considera "otros trabajos". La pausa implica un cese total de la actividad laboral.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Descansos */}
          <TabsContent value="rest" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icons.moon className="h-5 w-5 text-primary" />
                  Descansos Diarios y Semanales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="p-4 rounded-lg border bg-muted/50">
                    <h4 className="font-semibold mb-2">Descanso Diario</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Normal:</strong> 11 horas ininterrumpidas.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Fraccionado:</strong> Se puede dividir en 2 períodos: el primero de 3h y el segundo de 9h.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Reducido:</strong> 9 horas, no más de 3 veces entre dos descansos semanales.</span>
                      </li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg border bg-muted/50">
                    <h4 className="font-semibold mb-2">Descanso Semanal</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Normal:</strong> 45 horas ininterrumpidas.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>Reducido:</strong> 24 horas, pero debe compensarse antes del final de la tercera semana.</span>
                      </li>
                       <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span>En 2 semanas consecutivas, se debe tomar al menos un descanso normal (45h) y uno reducido (24h).</span>
                      </li>
                    </ul>
                  </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Infracciones */}
          <TabsContent value="infractions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-destructive" />
                  Infracciones y Sanciones
                </CardTitle>
                <CardDescription>
                  Principales infracciones y sus posibles sanciones económicas (pueden variar según el país).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20">
                    <h4 className="font-semibold mb-2 text-red-800 dark:text-red-200">Muy Graves (2.001€ - 4.000€)</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                        <span>Exceso de conducción de más del 50% sobre los tiempos máximos.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                        <span>Reducción de los descansos diarios en más de un 50%.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                         <span>Manipulación, falsificación o carencia del tacógrafo.</span>
                      </li>
                    </ul>
                </div>
                <div className="p-4 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20">
                    <h4 className="font-semibold mb-2 text-amber-800 dark:text-amber-200">Graves (1.001€ - 2.000€)</h4>
                    <ul className="space-y-2 text-sm">
                       <li className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <span>Exceso de conducción de más del 20% sobre los tiempos máximos.</span>
                      </li>
                       <li className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <span>Reducción de los descansos diarios en más de un 20%.</span>
                      </li>
                    </ul>
                </div>
                <div className="p-4 rounded-lg border bg-muted/50">
                    <h4 className="font-semibold mb-2">Leves (301€ - 400€)</h4>
                    <ul className="space-y-2 text-sm">
                       <li className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                         <span>Uso incorrecto del selector de actividades del tacógrafo.</span>
                      </li>
                       <li className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                         <span>Ligeros excesos en los tiempos de conducción o reducción en los descansos.</span>
                      </li>
                    </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Icons.BookOpen className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <h4 className="font-semibold">Referencias legales</h4>
                <p className="text-sm text-muted-foreground">
                  Reglamento (CE) nº 561/2006 del Parlamento Europeo y del Consejo, de 15 de marzo de 2006, 
                  relativo a la armonización de determinadas disposiciones en materia social en el sector de los transportes por carretera.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
