/* eslint-disable @typescript-eslint/no-explicit-any */
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormProps } from "react-hook-form";
import { z, ZodTypeAny } from "zod/v3";

export function useZodForm<T extends ZodTypeAny>(
  schema: T,
  options?: UseFormProps<z.input<T>>,
) {
  return useForm<z.input<T>, any, z.output<T>>({
    resolver: zodResolver(schema),
    ...options,
  });
}
