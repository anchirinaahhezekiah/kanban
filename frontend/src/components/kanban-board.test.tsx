import { fireEvent, render, screen } from "@testing-library/react";
import { KanbanBoard } from "@/components/kanban-board";

describe("KanbanBoard", () => {
  it("renders five columns", () => {
    render(<KanbanBoard />);
    expect(screen.getAllByText("Column Name")).toHaveLength(5);
  });

  it("renames a column", () => {
    render(<KanbanBoard />);
    const input = screen.getByLabelText("todo-name");
    fireEvent.change(input, { target: { value: "Ready next" } });
    expect(screen.getByDisplayValue("Ready next")).toBeInTheDocument();
  });

  it("adds and deletes a card", () => {
    render(<KanbanBoard />);
    const addButtons = screen.getAllByRole("button", { name: "Add card" });
    const titleInputs = screen.getAllByPlaceholderText("Card title");
    const detailInputs = screen.getAllByPlaceholderText("Card details");

    fireEvent.change(titleInputs[0], { target: { value: "Write tests" } });
    fireEvent.change(detailInputs[0], { target: { value: "cover key flows" } });
    fireEvent.click(addButtons[0]);

    const created = screen.getByText("Write tests");
    expect(created).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Delete Write tests" }));
    expect(screen.queryByText("Write tests")).not.toBeInTheDocument();
  });
});
