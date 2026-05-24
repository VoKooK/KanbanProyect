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
    const { boardId, name } = body;

    if (!boardId || !name) {
      return NextResponse.json({ error: "El ID del tablero y el nombre son obligatorios." }, { status: 400 });
    }

    // Verify board belongs to user
    const board = await prisma.board.findFirst({
      where: { id: boardId, userId: user.id },
    });

    if (!board) {
      return NextResponse.json({ error: "Tablero no encontrado." }, { status: 404 });
    }

    // Get current max position of columns in this board
    const maxCol = await prisma.column.findFirst({
      where: { boardId },
      orderBy: { position: "desc" },
    });
    const position = maxCol ? maxCol.position + 1 : 0;

    const column = await prisma.column.create({
      data: {
        name,
        position,
        boardId,
      },
    });

    return NextResponse.json(column, { status: 201 });
  } catch (error) {
    console.error("POST Column Error:", error);
    return NextResponse.json({ error: "Error al crear la columna." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Check if bulk reordering columns
    if (body.columns && Array.isArray(body.columns)) {
      const updates = body.columns.map(async (col: { id: string; position: number }) => {
        // Verify this column belongs to user's board
        const dbCol = await prisma.column.findFirst({
          where: { id: col.id, board: { userId: user.id } },
        });
        if (dbCol) {
          return prisma.column.update({
            where: { id: col.id },
            data: { position: col.position },
          });
        }
      });
      await Promise.all(updates);
      return NextResponse.json({ message: "Columnas reordenadas correctamente." });
    } else {
      // Rename column
      const { columnId, name } = body;
      if (!columnId || !name) {
        return NextResponse.json({ error: "ID de columna y nombre son obligatorios." }, { status: 400 });
      }

      // Verify column belongs to user
      const dbCol = await prisma.column.findFirst({
        where: { id: columnId, board: { userId: user.id } },
      });

      if (!dbCol) {
        return NextResponse.json({ error: "Columna no encontrada." }, { status: 404 });
      }

      const updated = await prisma.column.update({
        where: { id: columnId },
        data: { name },
      });

      return NextResponse.json(updated);
    }
  } catch (error) {
    console.error("PUT Column Error:", error);
    return NextResponse.json({ error: "Error al actualizar la columna." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const columnId = searchParams.get("columnId");

  if (!columnId) {
    return NextResponse.json({ error: "El ID de la columna es obligatorio." }, { status: 400 });
  }

  try {
    const dbCol = await prisma.column.findFirst({
      where: { id: columnId, board: { userId: user.id } },
    });

    if (!dbCol) {
      return NextResponse.json({ error: "Columna no encontrada o no autorizada." }, { status: 404 });
    }

    await prisma.column.delete({
      where: { id: columnId },
    });

    return NextResponse.json({ message: "Columna eliminada correctamente." });
  } catch (error) {
    console.error("DELETE Column Error:", error);
    return NextResponse.json({ error: "Error al eliminar la columna." }, { status: 500 });
  }
}
