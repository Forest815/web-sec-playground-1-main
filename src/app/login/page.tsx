"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginRequest, loginRequestSchema } from "@/app/_types/LoginRequest";
import { UserProfile, userProfileSchema } from "../_types/UserProfile";
import { TextInputField } from "@/app/_components/TextInputField";
import { ErrorMsgField } from "@/app/_components/ErrorMsgField";
import { Button } from "@/app/_components/Button";
import { faSpinner, faRightToBracket, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { twMerge } from "tailwind-merge";
import NextLink from "next/link";
import { ApiResponse } from "../_types/ApiResponse";
import { mutate } from "swr";
import { useRouter } from "next/navigation";
import { AUTH } from "@/config/auth";

const Page: React.FC = () => {
  const c_Email = "email";
  const c_Password = "password";
  const c_RememberEmail = "rememberEmail";

  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoginCompleted, setIsLoginCompleted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(false);

  // フォーム処理関連の準備と設定
  const formMethods = useForm<LoginRequest>({
    mode: "onChange",
    resolver: zodResolver(loginRequestSchema),
  });
  const fieldErrors = formMethods.formState.errors;

  // ルートエラー（サーバサイドで発生した認証エラー）の表示設定の関数
  const setRootError = (errorMsg: string) => {
    formMethods.setError("root", {
      type: "manual",
      message: errorMsg,
    });
  };

  // 初期設定
  useEffect(() => {
    // クエリパラメータからメールアドレスの初期値をセット
    const searchParams = new URLSearchParams(window.location.search);
    const email = searchParams.get(c_Email);
    
    // ローカルストレージから保存されたメールアドレスを取得
    const savedEmail = localStorage.getItem("rememberedEmail");
    
    if (email) {
      formMethods.setValue(c_Email, email);
    } else if (savedEmail) {
      formMethods.setValue(c_Email, savedEmail);
      setRememberEmail(true);
    }
  }, [formMethods]);

  // ルートエラーメッセージのクリアに関する設定
  useEffect(() => {
    const subscription = formMethods.watch((value, { name }) => {
      if (name === c_Email || name === c_Password) {
        formMethods.clearErrors("root");
      }
    });
    return () => subscription.unsubscribe();
  }, [formMethods]);

  // ログイン完了後のリダイレクト処理
  useEffect(() => {
    if (isLoginCompleted) {
      // window.location.href = "/";
      router.replace("/");
      router.refresh();
    }
  }, [isLoginCompleted, router]);

  // フォームの送信処理
  const onSubmit = async (formValues: LoginRequest) => {
    const ep = "/api/login";

    console.log(JSON.stringify(formValues));
    try {
      setIsPending(true);
      setRootError("");

      // メールアドレスの保存処理
      if (rememberEmail) {
        localStorage.setItem("rememberedEmail", formValues.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      const res = await fetch(ep, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
        credentials: "same-origin",
        cache: "no-store",
      });
      setIsPending(false);

      if (!res.ok) return;

      const body = (await res.json()) as ApiResponse<unknown>;
      if (!body.success) {
        setRootError(body.message);
        return;
      }

      // セッションベース認証の処理のみ
      setUserProfile(userProfileSchema.parse(body.payload));
      mutate("/api/auth", body);
      setIsLoginCompleted(true);
    } catch (e) {
      const errorMsg =
        e instanceof Error ? e.message : "予期せぬエラーが発生しました。";
      setRootError(errorMsg);
    }
  };

  return (
    <main>
      <div className="text-2xl font-bold">
        <FontAwesomeIcon icon={faRightToBracket} className="mr-1.5" />
        Login
      </div>
      <form
        noValidate
        onSubmit={formMethods.handleSubmit(onSubmit)}
        className={twMerge(
          "mt-4 flex flex-col gap-y-4",
          isLoginCompleted && "cursor-not-allowed opacity-50",
        )}
      >
        <div>
          <label htmlFor={c_Email} className="mb-2 block font-bold">
            メールアドレス（ログインID）
          </label>
          <TextInputField
            {...formMethods.register(c_Email)}
            id={c_Email}
            placeholder="name@example.com"
            type="email"
            disabled={isPending || isLoginCompleted}
            error={!!fieldErrors.email}
            autoComplete="email"
          />
          <ErrorMsgField msg={fieldErrors.email?.message} />
        </div>

        <div>
          <label htmlFor={c_Password} className="mb-2 block font-bold">
            パスワード
          </label>
          <div className="relative">
            <TextInputField
              {...formMethods.register(c_Password)}
              id={c_Password}
              placeholder="*****"
              type={showPassword ? "text" : "password"}
              disabled={isPending || isLoginCompleted}
              error={!!fieldErrors.password}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setShowPassword(!showPassword)}
            >
              <FontAwesomeIcon 
                icon={showPassword ? faEyeSlash : faEye} 
                className="text-gray-500 hover:text-gray-700"
              />
            </button>
          </div>
          <ErrorMsgField msg={fieldErrors.password?.message} />
          <ErrorMsgField msg={fieldErrors.root?.message} />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id={c_RememberEmail}
            checked={rememberEmail}
            onChange={(e) => setRememberEmail(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor={c_RememberEmail} className="text-sm">
            次回からログインIDを自動入力する
          </label>
        </div>

        <Button
          variant="indigo"
          width="stretch"
          className={twMerge("tracking-widest")}
          isBusy={isPending}
          disabled={
            !formMethods.formState.isValid || isPending || isLoginCompleted
          }
        >
          ログイン
        </Button>
      </form>

      {isLoginCompleted && (
        <div>
          <div className="mt-4 flex items-center gap-x-2">
            <FontAwesomeIcon icon={faSpinner} spin />
            <div>ようこそ、{userProfile?.name} さん。</div>
          </div>
          <NextLink href="/" className="text-blue-500 hover:underline">
            自動的に画面が切り替わらないときはこちらをクリックしてください。
          </NextLink>
        </div>
      )}

      <div className="mt-6 space-y-2 text-center">
        <div>
          <NextLink href="/signup" className="text-blue-500 hover:underline">
            アカウントをお持ちでない方はこちら
          </NextLink>
        </div>
        <div>
          <NextLink href="/reset-password" className="text-blue-500 hover:underline">
            パスワードを忘れた方はこちら
          </NextLink>
        </div>
      </div>
    </main>
  );
};

export default Page;
