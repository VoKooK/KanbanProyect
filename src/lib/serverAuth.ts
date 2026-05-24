import { cookies } from "next/headers";
import { verifyJWT } from "./jwt";

export async function getAuthUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;
    
    const decoded = await verifyJWT(token);
    if (!decoded || !decoded.userId) return null;
    
    return {
      id: decoded.userId as string,
      email: decoded.email as string,
      name: (decoded.name as string | undefined) || null,
    };
  } catch (error) {
    console.error("Error retrieving authenticated user:", error);
    return null;
  }
}
