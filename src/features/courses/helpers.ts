import type { CourseItem, BackendCourse } from "@/shared/types";

/**
 * Convert flat backend courses to grouped format (one CourseItem per unique course name+room).
 * Groups schedules under the same course.
 */
export const convertToGroupedFormat = (
  backendCourses: BackendCourse[],
): CourseItem[] => {
  const courseMap = new Map<string, CourseItem>();

  backendCourses.forEach((course) => {
    const key = `${course.namaMataKuliah}-${course.ruangan || ""}`;

    if (courseMap.has(key)) {
      courseMap.get(key)!.schedules.push({
        hari: course.hari,
        jamMulai: course.jamMulai,
        jamSelesai: course.jamSelesai,
      });
    } else {
      courseMap.set(key, {
        namaMataKuliah: course.namaMataKuliah,
        ruangan: course.ruangan,
        schedules: [
          {
            hari: course.hari,
            jamMulai: course.jamMulai,
            jamSelesai: course.jamSelesai,
          },
        ],
      });
    }
  });

  return Array.from(courseMap.values());
};

/**
 * Convert grouped CourseItems back to flat backend format.
 * Expands each course's schedules into individual entries.
 */
export const convertToFlatFormat = (courses: CourseItem[]): BackendCourse[] => {
  const flatCourses: BackendCourse[] = [];

  courses.forEach((course) => {
    course.schedules.forEach((schedule) => {
      flatCourses.push({
        namaMataKuliah: course.namaMataKuliah,
        hari: schedule.hari,
        jamMulai: schedule.jamMulai,
        jamSelesai: schedule.jamSelesai,
        ruangan: course.ruangan,
      });
    });
  });

  return flatCourses;
};
