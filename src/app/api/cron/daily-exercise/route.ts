import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini API client
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function POST(request: Request) {
  // 1. Authorization check
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "cron-secret-super-key-987654321-zyxwvuts";

  if (authHeader !== `Bearer ${cronSecret}`) {
    return new Response("No autorizado", { status: 401 });
  }

  // 2. Validate API Key
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "tu_api_key_de_gemini") {
    return NextResponse.json(
      { error: "API Key de Gemini no configurada. Por favor actualiza la variable GEMINI_API_KEY en tu .env" },
      { status: 500 }
    );
  }

  try {
    // 3. Generate exercise using Google Gemini API
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Genera un ejercicio práctico de programación para resolver en menos de 1 hora. El ejercicio debe ser retador pero accesible. Debe incluir un título y una descripción clara en formato Markdown con explicaciones paso a paso y ejemplos de entrada y salida.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            description: { type: "STRING" },
          },
          required: ["title", "description"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No se recibió respuesta de la API de Gemini.");
    }

    const exercise = JSON.parse(text);

    // 4. Find target column in the database (e.g. To Do, Backlog, or fall back to any first column)
    let targetColumn = await prisma.column.findFirst({
      where: {
        name: {
          in: ["To Do", "Backlog", "Por hacer", "Pendiente", "Pendientes", "Tareas", "Inbox"],
        },
      },
      orderBy: { createdAt: "asc" },
    });

    if (!targetColumn) {
      // Fallback: Pick the first available column in the entire database
      targetColumn = await prisma.column.findFirst({
        orderBy: { position: "asc" },
      });
    }

    if (!targetColumn) {
      return NextResponse.json(
        { error: "No se encontraron columnas en la base de datos. Por favor crea un tablero y al menos una columna primero." },
        { status: 404 }
      );
    }

    // 5. Calculate position for the new task (put it at the top of the column)
    const highestTask = await prisma.task.findFirst({
      where: { columnId: targetColumn.id },
      orderBy: { position: "desc" },
    });

    const newPosition = highestTask ? highestTask.position + 1 : 0;

    // 6. Create the task in the database
    const newTask = await prisma.task.create({
      data: {
        title: `🎯 Ejercicio Diario: ${exercise.title}`,
        description: exercise.description,
        columnId: targetColumn.id,
        position: newPosition,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Ejercicio diario generado con éxito",
      task: {
        id: newTask.id,
        title: newTask.title,
        columnId: newTask.columnId,
      },
    });
  } catch (error: any) {
    console.error("Error en la ruta del Cron:", error);
    return NextResponse.json(
      { error: "Error al generar o guardar el ejercicio diario.", details: error.message || error },
      { status: 500 }
    );
  }
}
