import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/serverAuth";

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { columnId, title, description } = body;

    if (!columnId || !title) {
      return NextResponse.json({ error: "La columna y el título son obligatorios." }, { status: 400 });
    }

    // Verify column belongs to user's board
    const dbCol = await prisma.column.findFirst({
      where: { id: columnId, board: { userId: user.id } },
    });

    if (!dbCol) {
      return NextResponse.json({ error: "Columna no encontrada." }, { status: 404 });
    }

    // Get current max position of tasks in this column
    const maxTask = await prisma.task.findFirst({
      where: { columnId },
      orderBy: { position: "desc" },
    });
    const position = maxTask ? maxTask.position + 1 : 0;

    const task = await prisma.task.create({
      data: {
        title,
        description: description || "",
        position,
        columnId,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("POST Task Error:", error);
    return NextResponse.json({ error: "Error al crear la tarea." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Check if bulk reordering/moving tasks
    if (body.tasks && Array.isArray(body.tasks)) {
      const updates = body.tasks.map(async (task: { id: string; position: number; columnId: string }) => {
        // Verify this task belongs to user's board
        const dbTask = await prisma.task.findFirst({
          where: { id: task.id, column: { board: { userId: user.id } } },
        });
        if (dbTask) {
          return prisma.task.update({
            where: { id: task.id },
            data: {
              position: task.position,
              columnId: task.columnId,
            },
          });
        }
      });
      await Promise.all(updates);
      return NextResponse.json({ message: "Tareas actualizadas correctamente." });
    } else {
      // Edit a single task
      const { taskId, title, description, columnId } = body;
      if (!taskId) {
        return NextResponse.json({ error: "El ID de la tarea es obligatorio." }, { status: 400 });
      }

      // Verify task belongs to user
      const dbTask = await prisma.task.findFirst({
        where: { id: taskId, column: { board: { userId: user.id } } },
      });

      if (!dbTask) {
        return NextResponse.json({ error: "Tarea no encontrada." }, { status: 404 });
      }

      const updated = await prisma.task.update({
        where: { id: taskId },
        data: {
          title: title !== undefined ? title : dbTask.title,
          description: description !== undefined ? description : dbTask.description,
          columnId: columnId !== undefined ? columnId : dbTask.columnId,
        },
      });

      return NextResponse.json(updated);
    }
  } catch (error) {
    console.error("PUT Task Error:", error);
    return NextResponse.json({ error: "Error al actualizar la tarea." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get("taskId");

  if (!taskId) {
    return NextResponse.json({ error: "El ID de la tarea es obligatorio." }, { status: 400 });
  }

  try {
    // Verify task belongs to user
    const dbTask = await prisma.task.findFirst({
      where: { id: taskId, column: { board: { userId: user.id } } },
    });

    if (!dbTask) {
      return NextResponse.json({ error: "Tarea no encontrada o no autorizada." }, { status: 404 });
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    return NextResponse.json({ message: "Tarea eliminada correctamente." });
  } catch (error) {
    console.error("DELETE Task Error:", error);
    return NextResponse.json({ error: "Error al eliminar la tarea." }, { status: 500 });
  }
}
