"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useMyCourse,
  useCreateCourse,
  useUpdateCourse,
} from "@/features/courses/hooks/use-courses";
import { courseFormSchema, type CourseFormData } from "@/features/courses/schema";
import {
  convertToGroupedFormat,
  convertToFlatFormat,
} from "@/features/courses/helpers";

export function useUserMyCoursePage() {
  const [isEditing, setIsEditing] = useState(false);

  const { data: courseData, isLoading } = useMyCourse();
  const createMutation = useCreateCourse();
  const updateMutation = useUpdateCourse();

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      semester: "",
      tahunAjaran: "",
      courses: [
        {
          namaMataKuliah: "",
          ruangan: "",
          schedules: [{ hari: 1, jamMulai: "", jamSelesai: "" }],
        },
      ],
    },
  });

  const {
    fields: courseFields,
    append: appendCourse,
    remove: removeCourse,
  } = useFieldArray({
    control: form.control,
    name: "courses",
  });

  const onSubmit = (data: CourseFormData) => {
    const backendData = {
      semester: data.semester,
      tahunAjaran: data.tahunAjaran,
      courses: convertToFlatFormat(data.courses),
    };

    if (courseData?.data) {
      updateMutation.mutate(
        { id: courseData.data._id, data: backendData },
        { onSuccess: () => setIsEditing(false) },
      );
    } else {
      createMutation.mutate(backendData, {
        onSuccess: () => setIsEditing(false),
      });
    }
  };

  const handleEdit = () => {
    if (courseData?.data) {
      const groupedCourses = convertToGroupedFormat(courseData.data.courses);
      form.reset({
        semester: courseData.data.semester,
        tahunAjaran: courseData.data.tahunAjaran,
        courses:
          groupedCourses.length > 0
            ? groupedCourses
            : [
                {
                  namaMataKuliah: "",
                  ruangan: "",
                  schedules: [{ hari: 1, jamMulai: "", jamSelesai: "" }],
                },
              ],
      });
    }
    setIsEditing(true);
  };

  const myCourse = courseData?.data;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const groupedCourses = myCourse
    ? convertToGroupedFormat(myCourse.courses)
    : [];

  const handleCancel = () => {
    setIsEditing(false);
    form.reset();
  };

  const handleStartEditing = () => {
    setIsEditing(true);
  };

  return {
    isEditing,
    isLoading,
    form,
    courseFields,
    appendCourse,
    removeCourse,
    onSubmit,
    handleEdit,
    handleCancel,
    handleStartEditing,
    myCourse,
    isPending,
    groupedCourses,
  };
}
