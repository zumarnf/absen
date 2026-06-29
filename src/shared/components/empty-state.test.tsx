import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("renders the message", () => {
    render(<EmptyState message="No records found" />);
    expect(screen.getByText("No records found")).toBeInTheDocument();
  });

  it("renders children (e.g. an action button)", () => {
    render(
      <EmptyState message="Empty">
        <button>Add new</button>
      </EmptyState>,
    );
    expect(screen.getByRole("button", { name: "Add new" })).toBeInTheDocument();
  });
});
