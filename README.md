# FlowKanban Proyect

Un tablero Kanban premium, altamente interactivo y responsivo construido con Next.js 16, React 19 y PostgreSQL (Neon).

## 🚀 Características
- **Tablero Kanban Interactivo:** Añade, edita, elimina y reorganiza columnas y tareas de forma fluida.
- **Auto-refresco en tiempo real:** Polling de fondo cada 5 segundos y botón de actualización manual para mantener los datos sincronizados en tiempo real sin recargar la página.
- **Drag and Drop nativo:** Sistema de arrastrar y soltar personalizado desarrollado con la API nativa de HTML5 para garantizar la compatibilidad con React 19 y Next.js 16.
- **Autenticación Segura:** Registro e inicio de sesión con tokens JWT almacenados en cookies HTTP-only, protegidos con Next.js **Proxy** (Middleware).
- **Ejercicios de Programación Diarios:** Endpoint de cron-job integrado con la API de **Google Gemini** para inyectar automáticamente un reto de programación diario a todos los usuarios.
- **Tableros Protegidos:** El tablero `"Ejercicios de Programación"` se crea por defecto en el registro y está bloqueado contra edición o eliminación en la API y el frontend.

## 🛠️ Tecnologías Utilizadas
- **Frontend / Backend:** [Next.js 16 (App Router)](https://nextjs.org/) y [React 19](https://react.dev/) con TypeScript.
- **Base de Datos:** [Neon PostgreSQL](https://neon.tech/) gestionado con [Prisma ORM](https://www.prisma.io/).
- **IA Generativa:** [Google Gemini API](https://aistudio.google.com/) via `@google/genai`.
- **Seguridad:** Autenticación JWT en cookies HTTP-only usando la librería `jose`.
- **Estilos:** Custom Vanilla CSS con CSS Modules (Glassmorphism, Dark mode y micro-animaciones).

## ⚙️ Configuración e Instalación

1. **Instalar Dependencias:**
   ```bash
   npm install
   ```

2. **Configurar el entorno:**
   Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:
   ```env
   # URL de conexión a Neon PostgreSQL
   DATABASE_URL="postgresql://neondb_owner:...@ep-..."

   # Clave secreta para tokens JWT
   JWT_SECRET="tu-clave-secreta-jwt"

   # Clave de API de Google Gemini (AI Studio)
   GEMINI_API_KEY="tu-api-key-de-gemini"

   # Token secreto para validar llamadas de Cron-Job.org
   CRON_SECRET="tu-token-secreta-de-cron"
   ```

3. **Inicializar la base de datos:**
   Sincroniza el esquema de Prisma y genera el cliente de PostgreSQL en tu base de datos Neon:
   ```bash
   npx prisma db push
   ```

## 🏃 Ejecutar el proyecto

Para iniciar el servidor de desarrollo local:
```bash
npm run dev
```
Abre **[http://localhost:3000](http://localhost:3000)** en tu navegador.

Para compilar la aplicación para producción:
```bash
npm run build
npm start
```

## 🧪 Pruebas y Tests

El proyecto incluye un conjunto de pruebas unitarias y de integración para validar el flujo del cron diario:

1. **Pruebas Unitarias (Mocks):**
   Valida la lógica del cron simulando a Prisma y Gemini (no requiere internet ni claves reales):
   ```bash
   npx tsx --test tests/daily-exercise.test.ts
   ```

2. **Prueba de Integración Local:**
   Valida el flujo real localmente consultando a Gemini y guardando la tarea en tu base de datos de Neon:
   ```bash
   npx tsx tests/daily-exercise-integration.ts
   ```

3. **Prueba de Integración en Producción (Vercel):**
   Envía una petición autenticada al servidor web en producción para forzar la generación de una tarea diaria:
   ```bash
   npx tsx tests/daily-exercise-production.ts https://tu-proyecto.vercel.app
   ```

---
Creado para gestionar tus tareas y proyectos con la mejor experiencia visual y de usuario.
