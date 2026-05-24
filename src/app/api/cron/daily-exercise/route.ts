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

    // 4. Get all users in the database
    const users = await prisma.user.findMany();
    if (users.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No hay usuarios en la base de datos para generar ejercicios.",
        tasksCreated: 0
      });
    }

    const createdTasksInfo = [];

    // 5. For each user, find or create the default board and insert the exercise
    for (const user of users) {
      let board = await prisma.board.findFirst({
        where: {
          name: "Ejercicios de Programación",
          userId: user.id,
        },
        include: {
          columns: {
            orderBy: { position: "asc" },
          },
        },
      });

      // If the default board does not exist, create it with default columns
      if (!board) {
        board = await prisma.board.create({
          data: {
            name: "Ejercicios de Programación",
            userId: user.id,
            columns: {
              create: [
                { name: "Por Hacer", position: 0 },
                { name: "En Progreso", position: 1 },
                { name: "Terminado", position: 2 },
              ],
            },
          },
          include: {
            columns: {
              orderBy: { position: "asc" },
            },
          },
        });
      }

      // Find the first column (ideally "Por Hacer")
      const targetColumn = board.columns.find((c) => c.name === "Por Hacer") || board.columns[0];
      if (!targetColumn) continue;

      // Calculate position for the new task in this column
      const highestTask = await prisma.task.findFirst({
        where: { columnId: targetColumn.id },
        orderBy: { position: "desc" },
      });

      const newPosition = highestTask ? highestTask.position + 1 : 0;

      // Create the task for this user
      const newTask = await prisma.task.create({
        data: {
          title: `🎯 Ejercicio Diario: ${exercise.title}`,
          description: exercise.description,
          columnId: targetColumn.id,
          position: newPosition,
        },
      });

      createdTasksInfo.push({
        userId: user.id,
        taskId: newTask.id,
        title: newTask.title,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Ejercicio diario generado con éxito para ${createdTasksInfo.length} usuario(s).`,
      tasks: createdTasksInfo,
    });
  } catch (error: any) {
    console.error("Error en la ruta del Cron:", error);
    return NextResponse.json(
      { error: "Error al generar o guardar el ejercicio diario.", details: error.message || error },
      { status: 500 }
    );
  }
}
