"use client";

import { DndContext, DragEndEvent, PointerSensor, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FormEvent, useMemo, useReducer, useState } from "react";
import { boardReducer, Card, createInitialBoardState } from "@/lib/kanban";

function KanbanCard({
  card,
  onDelete,
}: {
  card: Card;
  onDelete: (cardId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: "card", cardId: card.id, columnId: card.columnId },
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${
        isDragging ? "opacity-70" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="cursor-grab" {...attributes} {...listeners}>
          <h3 className="text-sm font-semibold text-[#032147]">{card.title}</h3>
          <p className="mt-1 text-sm text-[#888888]">{card.details || "No details"}</p>
        </div>
        <button
          type="button"
          aria-label={`Delete ${card.title}`}
          onClick={() => onDelete(card.id)}
          className="rounded-md border border-[#ecad0a] px-2 py-1 text-xs font-medium text-[#032147] hover:bg-[#ecad0a]/15"
        >
          Delete
        </button>
      </div>
    </article>
  );
}

export function KanbanBoard() {
  const [state, dispatch] = useReducer(boardReducer, undefined, createInitialBoardState);
  const [drafts, setDrafts] = useState<Record<string, { title: string; details: string }>>({});
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const cardsByColumn = useMemo(() => {
    const grouped = new Map<string, Card[]>();
    for (const column of state.columns) {
      grouped.set(column.id, []);
    }
    for (const card of state.cards) {
      const cards = grouped.get(card.columnId);
      if (cards) cards.push(card);
    }
    return grouped;
  }, [state.cards, state.columns]);

  const onDragEnd = (event: DragEndEvent) => {
    const activeCardId = String(event.active.id);
    const over = event.over;
    if (!over) return;
    const overData = over.data.current as { columnId?: string } | undefined;
    const targetColumnId = overData?.columnId ?? String(over.id);
    const movedCard = state.cards.find((card) => card.id === activeCardId);
    if (!movedCard || movedCard.columnId === targetColumnId) return;
    dispatch({ type: "moveCard", cardId: activeCardId, toColumnId: targetColumnId });
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>, columnId: string) => {
    event.preventDefault();
    const draft = drafts[columnId] ?? { title: "", details: "" };
    dispatch({ type: "addCard", payload: { columnId, title: draft.title, details: draft.details } });
    setDrafts((current) => ({ ...current, [columnId]: { title: "", details: "" } }));
  };

  return (
    <section className="mx-auto w-full max-w-[1400px] px-4 py-10">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-[#209dd7]">Project board</p>
        <h1 className="mt-2 text-4xl font-bold text-[#032147]">Kanban MVP Board</h1>
      </header>
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {state.columns.map((column) => {
            const cards = cardsByColumn.get(column.id) ?? [];
            return (
              <div
                key={column.id}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                data-testid={`column-${column.id}`}
              >
                <label className="text-xs font-semibold uppercase tracking-wide text-[#888888]">
                  Column Name
                </label>
                <input
                  aria-label={`${column.id}-name`}
                  value={column.name}
                  onChange={(event) =>
                    dispatch({ type: "renameColumn", columnId: column.id, name: event.target.value })
                  }
                  className="mt-1 w-full rounded-md border border-[#ecad0a]/70 bg-white px-2 py-1 font-semibold text-[#032147] outline-none focus:ring-2 focus:ring-[#209dd7]/40"
                />

                <SortableContext items={cards.map((card) => card.id)} strategy={verticalListSortingStrategy}>
                  <ColumnDropZone columnId={column.id}>
                    {cards.map((card) => (
                      <KanbanCard
                        key={card.id}
                        card={card}
                        onDelete={(cardId) => dispatch({ type: "deleteCard", cardId })}
                      />
                    ))}
                  </ColumnDropZone>
                </SortableContext>

                <form className="mt-4 space-y-2" onSubmit={(event) => onSubmit(event, column.id)}>
                  <input
                    value={drafts[column.id]?.title ?? ""}
                    placeholder="Card title"
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [column.id]: { ...(current[column.id] ?? { title: "", details: "" }), title: event.target.value },
                      }))
                    }
                    className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-[#209dd7]/40"
                  />
                  <textarea
                    value={drafts[column.id]?.details ?? ""}
                    placeholder="Card details"
                    rows={2}
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [column.id]: { ...(current[column.id] ?? { title: "", details: "" }), details: event.target.value },
                      }))
                    }
                    className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-[#209dd7]/40"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-md bg-[#753991] px-3 py-2 text-sm font-semibold text-white hover:bg-[#5f2c75]"
                  >
                    Add card
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      </DndContext>
    </section>
  );
}

function ColumnDropZone({
  columnId,
  children,
}: {
  columnId: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `drop-${columnId}`,
    data: { columnId },
  });

  return (
    <div
      ref={setNodeRef}
      className={`mt-3 min-h-12 space-y-3 rounded-md p-1 ${isOver ? "bg-[#209dd7]/10" : ""}`}
      data-column-dropzone={columnId}
    >
      {children}
    </div>
  );
}
