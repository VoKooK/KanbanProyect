import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/serverAuth";
import { prisma } from "@/lib/prisma";
import BoardClient from "@/components/BoardClient";

export const dynamic = "force-dynamic";

export default async function KanbanPage() {
  // Retrieve authenticated user from session cookie
  const user = await getAuthUser();
  if (!user) {
    redirect("/login");
  }

  // Fetch initial boards for the user
  const boards = await prisma.board.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return <BoardClient initialBoards={boards} user={user} />;
}
