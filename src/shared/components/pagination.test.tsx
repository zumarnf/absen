import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Pagination } from "./pagination";
import type { PaginationMeta } from "@/shared/types";

const meta = (over: Partial<PaginationMeta> = {}): PaginationMeta => ({
  currentPage: 1,
  totalPages: 3,
  totalItems: 25,
  itemsPerPage: 10,
  ...over,
});

describe("Pagination", () => {
  it("renders nothing when there is only one page", () => {
    const { container } = render(
      <Pagination meta={meta({ totalPages: 1 })} currentPage={1} onPageChange={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("disables Previous on the first page", () => {
    render(<Pagination meta={meta()} currentPage={1} onPageChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /next/i })).toBeEnabled();
  });

  it("disables Next on the last page", () => {
    render(<Pagination meta={meta({ currentPage: 3 })} currentPage={3} onPageChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
  });

  it("calls onPageChange with the next page when Next is clicked", async () => {
    const onPageChange = vi.fn();
    render(<Pagination meta={meta()} currentPage={1} onPageChange={onPageChange} />);

    await userEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
