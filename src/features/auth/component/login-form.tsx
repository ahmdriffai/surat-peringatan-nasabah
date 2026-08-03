import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useZodForm } from "@/hook/use-form";
import { Loader2 } from "lucide-react";
import { Controller } from "react-hook-form";
import { LoginInput, LoginInputSchema } from "../schema";

interface Props {
  onSubmit: (data: LoginInput) => void;
  isPending: boolean;
}

export default function LoginForm({ isPending, onSubmit }: Props) {
  const form = useZodForm(LoginInputSchema, {
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <FieldGroup>
      <Controller
        control={form.control}
        name="email"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="text"
              placeholder="example@company.com"
              {...field}
            />
            {fieldState.error?.message && (
              <FieldError errors={[fieldState.error]}>
                {fieldState.error.message}
              </FieldError>
            )}
          </Field>
        )}
      />
      <Controller
        control={form.control}
        name="password"
        render={({ field, fieldState }) => (
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              placeholder="example@company.com"
              {...field}
            />
            {fieldState.error?.message && (
              <FieldError errors={[fieldState.error]}>
                {fieldState.error.message}
              </FieldError>
            )}
          </Field>
        )}
      />
      <Field>
        <Button
          type="submit"
          disabled={isPending}
          className="w-full"
          onClick={form.handleSubmit(onSubmit)}
        >
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {isPending ? "Memproses..." : "Masuk"}
        </Button>
        <FieldDescription className="text-center">
          Hubungi administrator jika Anda belum memiliki akun.
        </FieldDescription>
      </Field>
    </FieldGroup>
  );
}
