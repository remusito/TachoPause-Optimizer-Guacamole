# TachoPause Optimizer

TachoPause Optimizer es una aplicación web progresiva (PWA) diseñada para ayudar a los conductores de camiones a optimizar sus tiempos de conducción y descanso, aprovechando la "regla del minuto" y otras herramientas útiles para el día a día en la carretera.

 <!-- Reemplaza esto con una captura de pantalla de tu app -->

## ✨ Características Principales

- **Temporizador de Conducción (Semáforo)**: Un sistema visual e intuitivo con alertas sonoras que gestiona los ciclos de conducción y pausa para maximizar la eficiencia.
- **Velocímetro GPS**: Muestra la velocidad actual, velocidad máxima, velocidad media, distancia recorrida y tiempo transcurrido, todo ello utilizando el GPS del dispositivo.
- **Calculadora de Ruta**: Estima la distancia y el tiempo de viaje para múltiples tramos, optimizado para una velocidad media de camión. *(Función Premium)*
- **Buscador de Paradas**: Encuentra áreas de servicio, gasolineras y restaurantes a lo largo de tu ruta. *(Función Premium)*
- **Directorio Telefónico**: Acceso rápido a una lista de contactos importantes de la empresa. *(Función Premium)*
- **Historial y Estadísticas**: Registra y visualiza tus actividades de conducción y pausas, con gráficos semanales y resúmenes mensuales.
- **Sistema de Logros**: Desbloquea recompensas por alcanzar hitos dentro de la aplicación.
- **Autenticación de Usuarios**: Soporte para inicio de sesión con Google y con correo electrónico/contraseña a través de Firebase.
- **Tema Claro/Oscuro**: Adaptable a las preferencias del usuario.
- **Diseño Responsivo y PWA**: Funciona como una aplicación nativa en dispositivos móviles y es totalmente funcional sin conexión.

## 🚀 Stack Tecnológico

- **Framework**: [Next.js](https://nextjs.org/) (con App Router)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
- **Componentes UI**: [Shadcn/ui](https://ui.shadcn.com/)
- **Backend, Autenticación y Base de Datos**: [Firebase](https://firebase.google.com/) (Authentication, Firestore)
- **Funcionalidades AI**: [Genkit (Google AI)](https://firebase.google.com/docs/genkit)
- **Mapas y Rutas**: [Google Maps Platform APIs](https://developers.google.com/maps)

## 🛠️ Cómo Empezar

Sigue estos pasos para poner en marcha el proyecto en tu entorno local.

### Prerrequisitos

- [Node.js](https://nodejs.org/en/) (versión 18 o superior)
- `npm`, `yarn` o `pnpm`

### 1. Clona el Repositorio

```bash
git clone https://github.com/tu-usuario/tachopause-optimizer.git
cd tachopause-optimizer
```

### 2. Instala las Dependencias

```bash
npm install
```

### 3. Configura las Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto y añade tu clave de la API de Google Maps para las funciones de rutas:

```.env.local
# Es necesario tener habilitadas las APIs: Directions API, Places API, Maps JavaScript API
GOOGLE_MAPS_API_KEY="TU_API_KEY_DE_GOOGLE_MAPS"
```

### 4. Configuración de Firebase

La aplicación ya viene preconfigurada con un proyecto de Firebase para la autenticación y la base de datos (Firestore). Sin embargo, para que el inicio de sesión con Google funcione correctamente en tu entorno local, necesitas autorizar el dominio de desarrollo:

1.  Ve a la [Consola de Firebase](https://console.firebase.google.com/) y busca el proyecto con el ID que aparece en tu archivo `src/firebase/config.ts`.
2.  En el menú de la izquierda, ve a **Authentication**.
3.  Selecciona la pestaña **Settings** (Configuración) y luego **Authorized domains** (Dominios autorizados).
4.  Haz clic en **Add domain** y añade el dominio local desde el que se ejecuta la aplicación (ej: `localhost` o el dominio de tu entorno de desarrollo en la nube).

### 5. Ejecuta la Aplicación

```bash
npm run dev
```

Abre [http://localhost:9005](http://localhost:9005) en tu navegador para ver la aplicación en funcionamiento.

---

Hecho con ❤️ para los héroes de la carretera.
