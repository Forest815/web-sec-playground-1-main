"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { passwordResetRequestSchema, PasswordResetRequest } from "@/app/_types/PasswordRequest";
import { TextInputField } from "@/app/_components/TextInputField";
import { ErrorMsgField } from "@/app/_components/ErrorMsgField";
import { Button } from "@/app/_components/Button";
import NextLink from "next/link";
import { faSpinner, faKey } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ApiResponse } from "../_types/ApiResponse";

const Page: React.FC = () => {
  const c_Email = "email";
  const c_SecretAnswer = "secretAnswer";

  const [isPending, setIsPending] = useState(false);
  const [resetCompleted, setResetCompleted] = useState(false);
  const [tempPassword, setTempPassword] = useState("");

  // フォーム処理関連の準備と設定
  const formMethods = useForm<PasswordResetRequest>({
    mode: "onChange",
    resolver: zodResolver(passwordResetRequestSchema),
  });
  const fieldErrors = formMethods.formState.errors;

  // ルートエラーの表示設定の関数
  const setRootError = (errorMsg: string) => {
    formMethods.setError("root", {
      type: "manual",
      message: errorMsg,
    });
  };

  // フォームの送信処理
  const onSubmit = async (formValues: PasswordResetRequest) => {
    const ep = "/api/reset-password";

    try {
      setIsPending(true);
      setRootError("");

      const res = await fetch(ep, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValues),
        credentials: "same-origin",
        cache: "no-store",
      });
      setIsPending(false);

      if (!res.ok) return;

      const body = (await res.json()) as ApiResponse<{ tempPassword: string } | null>;
      if (!body.success) {
        setRootError(body.message);
        return;
      }

      if (body.payload) {
        setTempPassword(body.payload.tempPassword);
        setResetCompleted(true);
      }
    } catch (e) {
      setIsPending(false);
      const errorMsg = e instanceof Error ? e.message : "予期せぬエラーが発生しました。";
      setRootError(errorMsg);
    }
  };

  if (resetCompleted) {
    return (
      <main className="max-w-md mx-auto">
        <div className="text-2xl font-bold text-green-600 mb-4">
          <FontAwesomeIcon icon={faKey} className="mr-1.5" />
          パスワードリセット完了
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <p className="mb-2">パスワードがリセットされました。</p>
          <p className="mb-2">一時的なパスワード:</p>
          <div className="bg-white border rounded px-3 py-2 font-mono text-lg">
            {tempPassword}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            このパスワードでログインし、すぐに新しいパスワードに変更してください。
          </p>
        </div>
        <NextLink
          href="/login"
          className="block w-full bg-blue-500 text-white text-center py-2 rounded hover:bg-blue-600"
        >
          ログインページへ
        </NextLink>
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto">
      <div className="text-2xl font-bold">
        <FontAwesomeIcon icon={faKey} className="mr-1.5" />
        パスワードリセット
      </div>
      <p className="text-gray-600 mt-2 mb-4">
        秘密の質問にお答えいただくと、一時的なパスワードをお伝えします。
      </p>
      <form
        noValidate
        onSubmit={formMethods.handleSubmit(onSubmit)}
        className="mt-4 flex flex-col gap-y-4"
      >
        <div>
          <label htmlFor={c_Email} className="mb-2 block font-bold">
            メールアドレス
          </label>
          <TextInputField
            {...formMethods.register(c_Email)}
            id={c_Email}
            placeholder="name@example.com"
            type="email"
            disabled={isPending}
            error={!!fieldErrors.email}
            autoComplete="email"
          />
          <ErrorMsgField msg={fieldErrors.email?.message} />
        </div>

        <div>
          <label htmlFor={c_SecretAnswer} className="mb-2 block font-bold">
            秘密の質問の答え
          </label>
          <TextInputField
            {...formMethods.register(c_SecretAnswer)}
            id={c_SecretAnswer}
            placeholder="秘密の質問の答えを入力してください"
            type="text"
            disabled={isPending}
            error={!!fieldErrors.secretAnswer}
            autoComplete="off"
          />
          <ErrorMsgField msg={fieldErrors.secretAnswer?.message} />
          <ErrorMsgField msg={fieldErrors.root?.message} />
        </div>

        <Button
          variant="indigo"
          width="stretch"
          className="tracking-widest"
          isBusy={isPending}
          disabled={!formMethods.formState.isValid || isPending}
        >
          パスワードをリセット
        </Button>
      </form>

      <div className="mt-6 text-center">
        <NextLink href="/login" className="text-blue-500 hover:underline">
          ログインページに戻る
        </NextLink>
      </div>
    </main>
  );
};

export default Page;
