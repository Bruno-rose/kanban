"use client";

import { SocketProvider } from "@/contexts/SocketContext";
import Board from "@/pages/board";

export default function BoardPage() {
  return (
    <SocketProvider>
      <Board />
    </SocketProvider>
  );
}
