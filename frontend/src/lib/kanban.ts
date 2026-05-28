export type Column = {
  id: string;
  name: string;
};

export type Card = {
  id: string;
  title: string;
  details: string;
  columnId: string;
};

export type BoardState = {
  columns: Column[];
  cards: Card[];
};

export type AddCardPayload = {
  columnId: string;
  title: string;
  details: string;
};

export type BoardAction =
  | { type: "renameColumn"; columnId: string; name: string }
  | { type: "addCard"; payload: AddCardPayload }
  | { type: "deleteCard"; cardId: string }
  | { type: "moveCard"; cardId: string; toColumnId: string };

const DEFAULT_COLUMNS: Column[] = [
  { id: "backlog", name: "Backlog" },
  { id: "todo", name: "To Do" },
  { id: "inprogress", name: "In Progress" },
  { id: "review", name: "Review" },
  { id: "done", name: "Done" },
];

const DEFAULT_CARDS: Card[] = [
  {
    id: "card-1",
    title: "Create onboarding flow",
    details: "Draft first-time user path for task creation and board tour.",
    columnId: "backlog",
  },
  {
    id: "card-2",
    title: "Finalize icon set",
    details: "Pick final icon family and align sizing across controls.",
    columnId: "todo",
  },
  {
    id: "card-3",
    title: "Tune drag interactions",
    details: "Refine movement transitions and drop target feedback.",
    columnId: "inprogress",
  },
  {
    id: "card-4",
    title: "Sign off release notes",
    details: "Confirm MVP scope and publish release notes draft.",
    columnId: "review",
  },
  {
    id: "card-5",
    title: "Ship Kanban MVP",
    details: "Deploy MVP board and run smoke checks with the team.",
    columnId: "done",
  },
];

export function createInitialBoardState(): BoardState {
  return {
    columns: [...DEFAULT_COLUMNS],
    cards: [...DEFAULT_CARDS],
  };
}

function createCardId(cards: Card[]): string {
  return `card-${cards.length + 1}-${Date.now()}`;
}

export function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case "renameColumn": {
      const nextColumns = state.columns.map((column) =>
        column.id === action.columnId ? { ...column, name: action.name.trim() || column.name } : column,
      );
      return { ...state, columns: nextColumns };
    }
    case "addCard": {
      const trimmedTitle = action.payload.title.trim();
      if (!trimmedTitle) {
        return state;
      }
      const nextCard: Card = {
        id: createCardId(state.cards),
        title: trimmedTitle,
        details: action.payload.details.trim(),
        columnId: action.payload.columnId,
      };
      return { ...state, cards: [...state.cards, nextCard] };
    }
    case "deleteCard":
      return { ...state, cards: state.cards.filter((card) => card.id !== action.cardId) };
    case "moveCard": {
      const nextCards = state.cards.map((card) =>
        card.id === action.cardId ? { ...card, columnId: action.toColumnId } : card,
      );
      return { ...state, cards: nextCards };
    }
    default:
      return state;
  }
}
