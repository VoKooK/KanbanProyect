# Kanban Board Proyect

Un tablero Kanban premium, altamente interactivo y responsivo construido con tecnologías web modernas.

## 🚀 Características
- **Tablero Kanban Interactivo:** Añade, edita, elimina y reorganiza columnas y tareas de forma fluida.
- **Drag and Drop nativo:** Sistema de arrastrar y soltar personalizado desarrollado con la API nativa de HTML5 para garantizar la compatibilidad total con React 19 y Next.js 16.
- **Diseño Premium y Dark Mode:** Interfaz moderna y sofisticada con glassmorphism, gradientes atractivos y micro-animaciones fluidas utilizando **CSS Modules**.
- **Autenticación Segura:** Sistema de registro e inicio de sesión personalizado con tokens JWT almacenados de forma segura en cookies HTTP-only, protegidos con Next.js **Proxy** (Middleware).
- **Base de Datos Autocontenida (SQLite):** Configurada mediante **Prisma ORM** para una instalación rápida con cero dependencias externas.

## 🛠️ Tecnologías Utilizadas
- **Frontend / Backend:** [Next.js 16 (App Router)](https://nextjs.org/) y [React 19](https://react.dev/) con TypeScript.
- **Base de Datos:** [SQLite](https://sqlite.org/) gestionado con [Prisma ORM](https://www.prisma.io/).
- **Estilos:** Custom Vanilla CSS con CSS Modules.
- **Seguridad:** Autenticación JWT mediante cookies HTTP-only usando la librería `jose`.

## ⚙️ Configuración e Instalación

1. **Instalar Dependencias:**
   ```bash
   npm install
   ```

2. **Configurar el entorno:**
   Crea un archivo `.env` en la raíz del proyecto con las siguientes variables de configuración:
   ```env
   # Ruta de conexión SQLite
   DATABASE_URL="file:./dev.db"

   # Clave secreta de al menos 32 caracteres para firmar tokens JWT de forma segura
   JWT_SECRET="tu_clave_secreta_aqui_generada_de_forma_segura"
   ```

3. **Inicializar la base de datos:**
   Sincroniza el esquema de Prisma y genera el cliente ejecutando:
   ```bash
   npx prisma db push
   ```

## 🏃 Ejecutar el proyecto

Para iniciar el servidor de desarrollo local:
```bash
npm run dev
```
Abre **[http://localhost:3000](http://localhost:3000)** en tu navegador para interactuar con la aplicación.

Para compilar la aplicación para producción:
```bash
npm run build
npm start
```

## 🔍 Visualizar la Base de Datos

El proyecto incluye **Prisma Studio**, un panel web visual para explorar los datos almacenados de forma sencilla. Para iniciarlo, ejecuta:
```bash
npx prisma studio
```
Luego abre **[http://localhost:5555](http://localhost:5555)** en tu navegador.

---
Creado para gestionar tus tareas y proyectos con la mejor experiencia visual y de usuario.
