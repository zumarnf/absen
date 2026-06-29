import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ShiftPosBadge } from "./shift-pos-badge";

describe("ShiftPosBadge", () => {
  it("renders the shift and position labels", () => {
    render(<ShiftPosBadge shift={3} pos={2} />);
    expect(screen.getByText("S3")).toBeInTheDocument();
    expect(screen.getByText("P2")).toBeInTheDocument();
  });

  it("reflects different shift/pos values", () => {
    render(<ShiftPosBadge shift={1} pos={1} />);
    expect(screen.getByText("S1")).toBeInTheDocument();
    expect(screen.getByText("P1")).toBeInTheDocument();
  });
});
