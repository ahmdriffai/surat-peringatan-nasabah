"use client";

import LoginForm from "@/features/auth/component/login-form";
import { useLogin } from "@/features/auth/hook";
import { LoginInput } from "@/features/auth/schema";
import { FileWarning, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const { mutate, isPending } = useLogin();

  function handleSubmit(data: LoginInput) {
    mutate(data);
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,color-mix(in_oklch,var(--primary-foreground),transparent_85%)_1px,transparent_0)] bg-size-[24px_24px]"
        />
        <div
          aria-hidden
          className="absolute -top-24 -right-24 size-96 rounded-full bg-primary-foreground/10 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-32 -left-16 size-80 rounded-full bg-primary-foreground/10 blur-3xl"
        />

        <div className="relative flex items-center gap-2 text-lg font-medium">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary-foreground/15">
            <FileWarning className="size-5" />
          </span>
          Surat Peringatan Nasabah Bank Wonosobo
        </div>

        <div className="relative space-y-4">
          <ShieldCheck className="size-10 opacity-90" />
          <blockquote className="space-y-2">
            <p className="text-2xl leading-snug font-medium text-balance">
              Kelola dan pantau surat peringatan nasabah secara terpusat, cepat,
              dan akurat.
            </p>
            <footer className="text-sm text-primary-foreground/70">
              Sistem administrasi surat peringatan internal
            </footer>
          </blockquote>
        </div>

        <div className="relative text-sm text-primary-foreground/60">
          &copy; {new Date().getFullYear()} Surat Peringatan Nasabah. Seluruh
          hak cipta dilindungi.
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center gap-2 text-center lg:items-start lg:text-left">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary lg:hidden">
              <FileWarning className="size-5" />
            </span>
            <h1 className="text-2xl font-semibold tracking-tight">
              Selamat datang kembali
            </h1>
            <p className="text-sm text-muted-foreground">
              Masuk untuk mengakses sistem surat peringatan nasabah.
            </p>
          </div>

          <LoginForm isPending={isPending} onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}
