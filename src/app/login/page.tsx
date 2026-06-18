"use client";

import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "@/shared/lib/axios";
import { useAuthStore } from "@/features/auth/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { loginSchema, type LoginFormData } from "@/features/auth/schema";
import type { AuthResponse } from "@/shared/types";

export default function LoginPage() {
  const { setAuth } = useAuthStore();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await axios.post<AuthResponse>("/auth/login", data);
      return response.data;
    },
    onSuccess: (data) => {
      setAuth(data.data.user);
      toast.success("Login berhasil");
      setTimeout(() => {
        window.location.href =
          data.data.user.role === "admin"
            ? "/admin/dashboard"
            : "/user/dashboard";
      }, 400);
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error("Login gagal", {
        description: error.response?.data?.message || error.message,
      });
    },
  });

  const onSubmit = (data: LoginFormData) => loginMutation.mutate(data);

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Editorial ink panel */}
      <div className="relative hidden flex-col justify-between bg-sidebar p-12 text-sidebar-foreground lg:flex">
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-sidebar-foreground/50">
          Absensi Logistik
        </span>
        <div className="max-w-md">
          <h1 className="font-display text-4xl leading-[1.1] text-sidebar-primary">
            Kelola kehadiran tim logistik dengan presisi.
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-sidebar-foreground/60">
            Satu tempat untuk absensi shift, jadwal, dan pergantian — rapi,
            terukur, dan selalu terkini.
          </p>
        </div>
        <p className="text-xs text-sidebar-foreground/40">
          &copy; {new Date().getFullYear()} Absensi Logistik
        </p>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm animate-fade-in-up">
          <div className="mb-8">
            <h2 className="font-display text-3xl text-foreground">Masuk</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Masukkan kredensial akun Anda untuk melanjutkan.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Masukkan username"
                        className="h-11"
                        autoComplete="username"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Masukkan password"
                        className="h-11"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="h-11 w-full"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Memproses..." : "Masuk"}
              </Button>
            </form>
          </Form>

          <div className="mt-8 rounded-lg border border-dashed bg-muted/50 p-4">
            <p className="text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              Akun demo
            </p>
            <dl className="mt-2 space-y-1 text-sm text-foreground">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Admin</dt>
                <dd className="nums font-medium">admin / admin123</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">User</dt>
                <dd className="nums font-medium">budi / budi123</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
