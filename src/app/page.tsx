import Link from "next/link";
import { ArrowRight, LayoutDashboard, CheckSquare, Sparkles, Shield, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#070913] text-slate-100">
      {/* Header */}
      <header className="w-full glass-panel sticky top-0 z-50 border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-indigo-500" />
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            FlowKanban
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-2 px-4 rounded-lg shadow-lg shadow-indigo-500/20 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Registrarse
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 text-center py-20 relative max-w-7xl mx-auto w-full">
        {/* Glow background effect */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full py-1.5 px-4 text-xs font-semibold text-indigo-400 mb-6 backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Organiza tu trabajo de forma inteligente</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-3xl leading-tight md:leading-none mb-6">
          Lleva tu productividad al siguiente nivel con{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            FlowKanban
          </span>
        </h1>

        <p className="text-slate-400 text-base md:text-xl max-w-2xl mb-10 leading-relaxed">
          Un gestor de tareas ágil, rápido y seguro. Crea tableros, columnas y organiza tus actividades diarias de forma visual e intuitiva con tecnología Next.js y almacenamiento en PostgreSQL.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link
            href="/register"
            className="group flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 px-8 rounded-xl shadow-xl shadow-indigo-600/30 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Comenzar Gratis
            <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="flex items-center justify-center bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 font-semibold py-3.5 px-8 rounded-xl transition-all duration-300"
          >
            Ver Tablero Demostración
          </Link>
        </div>

        {/* Mock Kanban Board Preview */}
        <div className="w-full glass-panel rounded-2xl border border-white/5 p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl max-w-5xl">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none" />
          
          {/* Mock Board Header */}
          <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm font-semibold text-slate-400 ml-2">Proyecto Alfa</span>
            </div>
            <div className="h-6 w-24 bg-slate-800/80 rounded-md animate-shimmer" />
          </div>

          {/* Mock Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Column 1 */}
            <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4 flex flex-col gap-3 min-h-[220px]">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-bold text-slate-300">Por Hacer</span>
                <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-indigo-400">2</span>
              </div>
              <div className="bg-[#12192c] border border-white/5 p-3.5 rounded-lg shadow-sm hover:border-indigo-500/50 cursor-grab transition-all">
                <h4 className="text-xs font-bold mb-1 text-slate-200">Diseño UI/UX del Landing Page</h4>
                <p className="text-[11px] text-slate-400">Crear paleta de colores y componentes con glassmorphism.</p>
              </div>
              <div className="bg-[#12192c] border border-white/5 p-3.5 rounded-lg shadow-sm hover:border-indigo-500/50 cursor-grab transition-all">
                <h4 className="text-xs font-bold mb-1 text-slate-200">Modelado de Base de Datos</h4>
                <p className="text-[11px] text-slate-400">Definir relaciones en Prisma ORM para Postgres.</p>
              </div>
            </div>

            {/* Column 2 */}
            <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4 flex flex-col gap-3 min-h-[220px]">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-bold text-slate-300">En Progreso</span>
                <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-indigo-400">1</span>
              </div>
              <div className="bg-[#12192c] border border-indigo-500/40 p-3.5 rounded-lg shadow-sm hover:border-indigo-500/50 cursor-grab transition-all relative">
                <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
                <h4 className="text-xs font-bold mb-1 text-slate-200">Rutas de Autenticación</h4>
                <p className="text-[11px] text-slate-400">Integrar JWT seguro y almacenamiento en HTTP-only cookies.</p>
              </div>
            </div>

            {/* Column 3 */}
            <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4 flex flex-col gap-3 min-h-[220px]">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-bold text-slate-300">Completado</span>
                <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-indigo-400">1</span>
              </div>
              <div className="bg-[#12192c]/50 border border-white/5 p-3.5 rounded-lg opacity-60 line-through decoration-slate-500">
                <h4 className="text-xs font-bold mb-1 text-slate-400">Instalación de Next.js</h4>
                <p className="text-[11px] text-slate-500">Configurar entorno inicial y paquetes necesarios.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="border-t border-white/5 py-20 px-6 md:px-12 bg-slate-950/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            ¿Por qué elegir FlowKanban?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel border border-white/5 p-6 rounded-2xl flex flex-col gap-3">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg w-fit">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-200">Arrastra y Suelta Intuitivo</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Mueve tus tareas rápidamente entre columnas con un sistema nativo fluido y guarda su orden de forma persistente al instante.
              </p>
            </div>
            <div className="glass-panel border border-white/5 p-6 rounded-2xl flex flex-col gap-3">
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg w-fit">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-200">Autenticación Segura</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Tus datos están resguardados bajo un inicio de sesión cifrado y cookies de sesión HTTP-only seguras frente a ataques web.
              </p>
            </div>
            <div className="glass-panel border border-white/5 p-6 rounded-2xl flex flex-col gap-3">
              <div className="p-3 bg-pink-500/10 text-pink-400 rounded-lg w-fit">
                <CheckSquare className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-200">Base de Datos PostgreSQL</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Almacena múltiples tableros, columnas y tareas sin pérdida de información, respaldados en una base de datos Postgres empresarial.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-slate-500 bg-[#070913]">
        <p>© {new Date().getFullYear()} FlowKanban. Todos los derechos reservados. Creado con Next.js y Prisma.</p>
      </footer>
    </div>
  );
}
