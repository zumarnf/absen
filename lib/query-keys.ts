export const queryKeys = {
  users: {
    all: ["admin-all-users"] as const,
    forFilter: ["admin-users-for-filter"] as const,
    forSchedule: ["admin-users-for-schedule"] as const,
    forCoverage: ["users-for-coverage"] as const,
  },
  attendance: {
    all: (page: number, limit: number) =>
      ["admin-all-attendance", page, limit] as const,
    stats: ["all-attendance-stats"] as const,
    user: (userId: string, page: number, limit: number) =>
      ["admin-user-attendance", userId, page, limit] as const,
    export: (userId: string) => ["admin-export-attendance", userId] as const,
    myHistory: (page?: number, limit?: number) =>
      page !== undefined
        ? (["my-attendance-history", page, limit] as const)
        : (["my-attendance-history"] as const),
    mySummary: ["my-monthly-summary"] as const,
  },
  schedules: {
    all: ["admin-all-schedules"] as const,
    stats: ["all-schedules-stats"] as const,
    grouped: ["grouped-schedules"] as const,
    my: ["my-schedule"] as const,
  },
  courses: {
    all: (page: number, limit: number) =>
      ["admin-all-courses", page, limit] as const,
    stats: ["all-courses-stats"] as const,
    my: ["my-course-schedule"] as const,
    byUser: (userId: string) => ["admin-user-course", userId] as const,
  },
  shiftCoverages: {
    incoming: ["shift-coverages-incoming"] as const,
    outgoing: ["shift-coverages-outgoing"] as const,
  },
} as const;
