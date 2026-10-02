"use client";

// COMPONENTS
import { Input } from "@/components/ui/input";
import { FillButton as Button } from "@/components/common";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginFormSchema, LoginFormType } from "@/types/schemas";

import { isAxiosError } from "axios";
import { useRouter } from "@/i18n/navigation";
import { postLogin } from "@/services/api/auth/client";
import { useTranslations } from "next-intl";
import { PATHNAME } from "@/constants/routes/pathnameRoutes";
import { toast } from "react-toastify";

const LoginForm = () => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, touchedFields, isSubmitting },
  } = useForm<LoginFormType>({
    resolver: zodResolver(loginFormSchema),
    mode: "onBlur",
  });

  const t = useTranslations("login");

  // 유효하면 Server Action Trigger
  const onSubmit = async (formData: LoginFormType) => {
    try {
      await postLogin(formData);

      // 전체 새로고침 — 서버가 로그인 상태로 다시 그려 내려준다.
      window.location.href = PATHNAME.HOME; // full reload
    } catch (error) {
      console.error(error);

      let message = t("error.general");

      if (isAxiosError(error)) {
        const status = error.response?.status ?? error.status;

        if (status === 401) {
          message = t("error.noUser");
        } else if (typeof error.response?.data?.message === "string") {
          message = error.response.data.message;
        } else if (Array.isArray(error.response?.data?.message)) {
          message = error.response.data.message.join("\n");
        } else if (error.code === "ERR_NETWORK") {
          message = t("error.network");
        }
      }

      toast.error(message);
      setError("root", { type: "manual", message });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* ID */}
      <label htmlFor="username" className="text-sm text-gray-300">
        {t("idLabel")}
      </label>
      <Input
        id="username"
        type="email"
        containerClassName="mb-5 mt-1.5"
        autoComplete="username"
        placeholder="Email"
        // RHF
        {...register("username")}
        errorHint={errors.username?.message}
        isTouchedField={touchedFields.username}
      />

      {/* PASSWORD */}
      <label htmlFor="password" className="text-sm text-gray-300">
        {t("passwordLabel")}
      </label>
      <Input
        id="password"
        type="password"
        containerClassName="mb-10 mt-1.5"
        autoComplete="current-password"
        placeholder="Password"
        // RHF
        {...register("password")}
        errorHint={errors.password?.message}
        isTouchedField={touchedFields.password}
      />

      {/* SUBMIT BUTTON */}
      <Button
        type="submit"
        isLoading={isSubmitting}
        disabled={isSubmitting}
        className="mb-6 h-12 w-full"
      >
        Login
      </Button>
    </form>
  );
};

export default LoginForm;
