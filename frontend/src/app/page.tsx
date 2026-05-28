"use client";

import { KanbanBoard } from "@/components/kanban-board";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-[#f5f9ff] to-[#f3f2fb]">
      <KanbanBoard />
    </main>
  );
}
