"use client";

import { useFieldArray } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Plus, Trash2, Calendar, Clock } from "lucide-react";
import { DAYS } from "@/lib/constants";
import { ButtonLoader } from "@/components/shared/loader";
import { CardListSkeleton } from "@/components/shared/card-list-skeleton";
import { useUserMyCoursePage } from "@/hooks/pages/use-user-my-course-page";

export default function MyCourseSchedulePage() {
  const {
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
  } = useUserMyCoursePage();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-500" />
                Jadwal Kuliah Saya
              </CardTitle>
              <CardDescription>
                Kelola jadwal kuliah Anda (support multiple jadwal per mata
                kuliah)
              </CardDescription>
            </div>
            {myCourse && !isEditing && (
              <Button
                onClick={handleEdit}
                className="rounded-xl transition-all duration-200"
              >
                Edit Jadwal
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <CardListSkeleton count={2} innerRows={1} />
          ) : !myCourse && !isEditing ? (
            <div className="text-center py-12 animate-fade-in-up">
              <p className="text-muted-foreground mb-4">
                Belum ada jadwal kuliah
              </p>
              <Button onClick={handleStartEditing} className="rounded-xl">
                <Plus className="h-4 w-4 mr-2" />
                Buat Jadwal
              </Button>
            </div>
          ) : isEditing ? (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="semester"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Semester</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ganjil/Genap"
                            className="rounded-xl"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tahunAjaran"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tahun Ajaran</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="2024/2025"
                            className="rounded-xl"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-foreground">Mata Kuliah</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-lg"
                      onClick={() =>
                        appendCourse({
                          namaMataKuliah: "",
                          ruangan: "",
                          schedules: [
                            { hari: 1, jamMulai: "", jamSelesai: "" },
                          ],
                        })
                      }
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Tambah Mata Kuliah
                    </Button>
                  </div>

                  {courseFields.map((courseField, courseIndex) => (
                    <div
                      key={courseField.id}
                      className="p-4 border border-border/60 rounded-xl space-y-4 bg-slate-50/50"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-foreground">
                          Mata Kuliah {courseIndex + 1}
                        </h4>
                        {courseFields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                            onClick={() => removeCourse(courseIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name={`courses.${courseIndex}.namaMataKuliah`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nama Mata Kuliah</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Pemrograman Web"
                                  className="rounded-xl"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`courses.${courseIndex}.ruangan`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ruangan (Optional)</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Lab Komputer 1"
                                  className="rounded-xl"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <ScheduleFieldArray
                        control={form.control}
                        courseIndex={courseIndex}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="rounded-xl bg-solid-primary hover:bg-solid-dark text-white transition-all duration-200 hover:shadow-lg hover:shadow-solid-primary/25"
                  >
                    {isPending ? (
                      <ButtonLoader message="Saving..." />
                    ) : (
                      "Simpan Jadwal"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Semester:</strong>{" "}
                  {myCourse?.semester}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Tahun Ajaran:</strong>{" "}
                  {myCourse?.tahunAjaran}
                </p>
              </div>

              {groupedCourses.map((course, index) => (
                <div
                  key={index}
                  className={`p-4 border border-border/60 rounded-xl card-hover animate-fade-in-up delay-${index + 1}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium text-foreground">
                      {course.namaMataKuliah}
                    </h4>
                    {course.ruangan && (
                      <Badge variant="outline" className="rounded-lg">
                        {course.ruangan}
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    {course.schedules.map((schedule, scheduleIndex) => (
                      <div
                        key={scheduleIndex}
                        className="flex items-center gap-4 text-sm text-muted-foreground bg-slate-50/70 p-2.5 rounded-xl"
                      >
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-indigo-500" />
                          <span className="font-medium text-foreground">
                            {DAYS.find((d) => d.value === schedule.hari)?.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-emerald-500" />
                          <span>
                            {schedule.jamMulai} - {schedule.jamSelesai}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ScheduleFieldArray({
  control,
  courseIndex,
}: {
  control: any;
  courseIndex: number;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `courses.${courseIndex}.schedules`,
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium flex items-center gap-2">
          <Calendar className="h-4 w-4 text-indigo-500" />
          Jadwal Pertemuan
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-lg"
          onClick={() => append({ hari: 1, jamMulai: "", jamSelesai: "" })}
        >
          <Plus className="h-3 w-3 mr-1" />
          Tambah Jadwal
        </Button>
      </div>

      {fields.map((scheduleField, scheduleIndex) => (
        <div
          key={scheduleField.id}
          className="grid gap-3 md:grid-cols-4 items-end p-3 bg-white border border-border/60 rounded-xl"
        >
          <FormField
            control={control}
            name={`courses.${courseIndex}.schedules.${scheduleIndex}.hari`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Hari</FormLabel>
                <Select
                  value={field.value.toString()}
                  onValueChange={(value) => field.onChange(parseInt(value))}
                >
                  <FormControl>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DAYS.map((day) => (
                      <SelectItem key={day.value} value={day.value.toString()}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`courses.${courseIndex}.schedules.${scheduleIndex}.jamMulai`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Jam Mulai</FormLabel>
                <FormControl>
                  <Input type="time" className="rounded-xl" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`courses.${courseIndex}.schedules.${scheduleIndex}.jamSelesai`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Jam Selesai</FormLabel>
                <FormControl>
                  <Input type="time" className="rounded-xl" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            {fields.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 w-full transition-colors"
                onClick={() => remove(scheduleIndex)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
