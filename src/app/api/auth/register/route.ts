import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "El correo y la contraseña son obligatorios." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Este correo electrónico ya está registrado." },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user and a default board with standard columns
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name || null,
        boards: {
          create: [
            {
              name: "Mi Tablero",
              columns: {
                create: [
                  { name: "Por Hacer", position: 0 },
                  { name: "En Progreso", position: 1 },
                  { name: "Terminado", position: 2 },
                ],
              },
            },
            {
              name: "Ejercicios de Programación",
              columns: {
                create: [
                  { name: "Por Hacer", position: 0 },
                  { name: "En Progreso", position: 1 },
                  { name: "Terminado", position: 2 },
                ],
              },
            },
          ],
        },
      },
    });

    return NextResponse.json(
      { message: "Usuario creado correctamente.", userId: user.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration API Error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al registrar el usuario." },
      { status: 500 }
    );
  }
}
