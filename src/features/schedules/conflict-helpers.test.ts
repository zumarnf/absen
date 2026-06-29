import { describe, it, expect } from "vitest";
import { findCourseConflicts } from "./conflict-helpers";
import type { Course } from "@/shared/types";

const course = (over: Partial<Course>): Course =>
  ({
    namaMataKuliah: "Test",
    hari: 1,
    jamMulai: "10:00",
    jamSelesai: "12:00",
    ...over,
  }) as Course;

describe("findCourseConflicts", () => {
  it("returns empty when there are no courses", () => {
    expect(findCourseConflicts(1, 1, undefined)).toEqual([]);
    expect(findCourseConflicts(1, 1, [])).toEqual([]);
  });

  it("detects a course overlapping shift 1 (06.00-11.00) on the same day", () => {
    // 10:00-12:00 overlaps 06:00-11:00.
    const conflicts = findCourseConflicts(1, 1, [course({ jamMulai: "10:00", jamSelesai: "12:00" })]);
    expect(conflicts).toHaveLength(1);
  });

  it("ignores a course on a different day", () => {
    const conflicts = findCourseConflicts(1, 1, [course({ hari: 2 })]);
    expect(conflicts).toEqual([]);
  });

  it("ignores a course that does not overlap the shift window", () => {
    // 12:00-14:00 does not overlap 06:00-11:00.
    const conflicts = findCourseConflicts(1, 1, [course({ jamMulai: "12:00", jamSelesai: "14:00" })]);
    expect(conflicts).toEqual([]);
  });

  it("handles shift 4 (21.00-02.00) wrapping past midnight", () => {
    // 22:00-23:00 overlaps the 21:00-02:00 window.
    const conflicts = findCourseConflicts(3, 4, [
      course({ hari: 3, jamMulai: "22:00", jamSelesai: "23:00" }),
    ]);
    expect(conflicts).toHaveLength(1);
  });
});
