import { boardReducer, createInitialBoardState } from "@/lib/kanban";

describe("boardReducer", () => {
  it("renames a column", () => {
    const state = createInitialBoardState();
    const next = boardReducer(state, { type: "renameColumn", columnId: "todo", name: "Ready" });
    expect(next.columns.find((column) => column.id === "todo")?.name).toBe("Ready");
  });

  it("adds a card to a column", () => {
    const state = createInitialBoardState();
    const next = boardReducer(state, {
      type: "addCard",
      payload: {
        columnId: "todo",
        title: "New task",
        details: "short details",
      },
    });
    expect(next.cards.length).toBe(state.cards.length + 1);
    expect(next.cards.at(-1)?.columnId).toBe("todo");
  });

  it("deletes a card", () => {
    const state = createInitialBoardState();
    const next = boardReducer(state, { type: "deleteCard", cardId: "card-1" });
    expect(next.cards.some((card) => card.id === "card-1")).toBe(false);
  });

  it("moves a card between columns", () => {
    const state = createInitialBoardState();
    const next = boardReducer(state, { type: "moveCard", cardId: "card-1", toColumnId: "done" });
    expect(next.cards.find((card) => card.id === "card-1")?.columnId).toBe("done");
  });
});
