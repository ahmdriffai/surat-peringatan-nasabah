import { useMutation } from "@tanstack/react-query";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LoginInput } from "./schema";

export const useLogin = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: LoginInput) => {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (!result || result.error) {
        throw new Error("Email atau password salah");
      }

      return result;
    },
    onSuccess: () => {
      toast.success("Login berhasil", {
        position: "top-center",
        richColors: true,
      });
      router.push("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message, { position: "top-center", richColors: true });
    },
  });
};
