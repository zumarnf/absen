import { describe, it, expect } from "vitest";
import { formatDatePDF, getShiftTimeRanges, getUserInfo } from "./helpers";

describe("formatDatePDF", () => {
  it("formats an ISO date as dd/mm/yyyy", () => {
    expect(formatDatePDF("2026-06-29")).toBe("29/06/2026");
  });

  it("zero-pads day and month", () => {
    expect(formatDatePDF("2026-01-05")).toBe("05/01/2026");
  });
});

describe("getShiftTimeRanges", () => {
  it("returns an empty string for no shifts", () => {
    expect(getShiftTimeRanges([])).toBe("");
  });

  it("sorts shifts and maps them to their time ranges", () => {
    const result = getShiftTimeRanges([
      { shift: 2, pos: 1 },
      { shift: 1, pos: 2 },
    ]);
    expect(result).toBe("06.00-11.00, 11.00-16.00");
  });
});

describe("getUserInfo", () => {
  it("returns the object when given a populated user", () => {
    const user = { _id: "1", username: "alice", nama: "Alice", role: "user" };
    expect(getUserInfo(user)).toEqual(user);
  });

  it("returns null when given a bare id string", () => {
    expect(getUserInfo("64b2f0c1e1")).toBeNull();
  });
});
