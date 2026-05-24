import { cookies } from "next/headers";
import { verifyJWT } from "./jwt";
import { prisma } from "./prisma";

export async function getAuthUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;
    
    const decoded = await verifyJWT(token);
    if (!decoded || !decoded.userId) return null;

    // Verify user exists in the database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId as string },
      select: { id: true, email: true, name: true }
    });

    if (!user) return null;
    
    return {
      id: user.id,
      email: user.email,
      name: user.name || null,
    };
  } catch (error) {
    console.error("Error retrieving authenticated user:", error);
    return null;
  }
}
