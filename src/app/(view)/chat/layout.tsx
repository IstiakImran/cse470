// app/(dashboard)/chat/layout.tsx
import { getServerSession } from "next-auth/next";

import { redirect } from "next/navigation";

import { authOptions } from "../../(controller)/api/auth/[...nextauth]/option";

import ChatSidebar from "@/components/chat/ChatSidebar";
import { SocketProvider } from "@/contexts/SocketContext";
export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  return (
    <SocketProvider userId={session.user.id}>
      <div className="flex h-screen">
        <ChatSidebar userId={session.user.id} />
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </SocketProvider>
  );
}
