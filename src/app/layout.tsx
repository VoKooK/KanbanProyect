import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlowKanban - Gestor de Tareas Moderno",
  description: "Administra tus proyectos y tareas con una interfaz Kanban premium, rápida y segura, conectada a PostgreSQL.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <body className="h-full flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
