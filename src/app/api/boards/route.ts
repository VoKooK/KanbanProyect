import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/serverAuth";

export async function GET(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const boardId = searchParams.get("boardId");

  try {
    if (boardId) {
      // Get detailed board with columns and tasks
      const board = await prisma.board.findFirst({
        where: { id: boardId, userId: user.id },
        include: {
          columns: {
            orderBy: { position: "asc" },
            include: {
              tasks: {
                orderBy: { position: "asc" },
              },
            },
          },
        },
      });

      if (!board) {
        return NextResponse.json({ error: "Tablero no encontrado." }, { status: 404 });
      }

      return NextResponse.json(board);
    }

    // Get list of all boards
    const boards = await prisma.board.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(boards);
  } catch (error) {
    console.error("GET Boards Error:", error);
    return NextResponse.json({ error: "Error al obtener tableros." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 });
    }

    const board = await prisma.board.create({
      data: {
        name,
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
        columns: true,
      },
    });

    return NextResponse.json(board, { status: 201 });
  } catch (error) {
    console.error("POST Board Error:", error);
    return NextResponse.json({ error: "Error al crear el tablero." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { boardId, name } = body;

    if (!boardId || !name) {
      return NextResponse.json({ error: "ID y nombre son obligatorios." }, { status: 400 });
    }

    const board = await prisma.board.findFirst({
      where: { id: boardId, userId: user.id }
    });

    if (board && board.name === "Ejercicios de Programación") {
      return NextResponse.json(
        { error: "No se puede renombrar el tablero de ejercicios predeterminado." },
        { status: 400 }
      );
    }

    const updatedBoard = await prisma.board.updateMany({
      where: { id: boardId, userId: user.id },
      data: { name },
    });

    if (updatedBoard.count === 0) {
      return NextResponse.json({ error: "Tablero no encontrado." }, { status: 404 });
    }

    return NextResponse.json({ message: "Tablero actualizado." });
  } catch (error) {
    console.error("PUT Board Error:", error);
    return NextResponse.json({ error: "Error al actualizar el tablero." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const boardId = searchParams.get("boardId");

  if (!boardId) {
    return NextResponse.json({ error: "El ID del tablero es obligatorio." }, { status: 400 });
  }

  try {
    const board = await prisma.board.findFirst({
      where: { id: boardId, userId: user.id }
    });

    if (board && board.name === "Ejercicios de Programación") {
      return NextResponse.json(
        { error: "No se puede eliminar el tablero de ejercicios predeterminado." },
        { status: 400 }
      );
    }

    const deleted = await prisma.board.deleteMany({
      where: { id: boardId, userId: user.id },
    });

    if (deleted.count === 0) {
      return NextResponse.json({ error: "Tablero no encontrado o no autorizado." }, { status: 404 });
    }

    return NextResponse.json({ message: "Tablero eliminado correctamente." });
  } catch (error) {
    console.error("DELETE Board Error:", error);
    return NextResponse.json({ error: "Error al eliminar el tablero." }, { status: 500 });
  }
}
