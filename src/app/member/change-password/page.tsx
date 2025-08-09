"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { passwordChangeRequestSchema, PasswordChangeRequest } from "@/app/_types/PasswordRequest";
import { TextInputField } from "@/app/_components/TextInputField";
import { ErrorMsgField } from "@/app/_components/ErrorMsgField";
import { Button } from "@/app/_components/Button";
import { faSpinner, faLock, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ApiResponse } from "../../_types/ApiResponse";

const Page: React.FC = () => {
  const c_CurrentPassword = "currentPassword";
  const c_NewPassword = "newPassword";
  const c_ConfirmPassword = "confirmPassword";

  const [isPending, setIsPending] = useState(false);
  const [changeCompleted, setChangeCompleted] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // フォーム処理関連の準備と設定
  const formMethods = useForm<PasswordChangeRequest>({
    mode: "onChange",
    resolver: zodResolver(passwordChangeRequestSchema),
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
  const onSubmit = async (formValues: PasswordChangeRequest) => {
    const ep = "/api/change-password";

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

      const body = (await res.json()) as ApiResponse<null>;
      if (!body.success) {
        setRootError(body.message);
        return;
      }

      setChangeCompleted(true);
      formMethods.reset();
    } catch (e) {
      setIsPending(false);
      const errorMsg = e instanceof Error ? e.message : "予期せぬエラーが発生しました。";
      setRootError(errorMsg);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-2xl font-bold mb-4">
        <FontAwesomeIcon icon={faLock} className="mr-1.5" />
        パスワード変更
      </div>

      {changeCompleted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <p className="text-green-800">パスワードが正常に変更されました。</p>
        </div>
      )}

      <form
        noValidate
        onSubmit={formMethods.handleSubmit(onSubmit)}
        className="flex flex-col gap-y-4"
      >
        <div>
          <label htmlFor={c_CurrentPassword} className="mb-2 block font-bold">
            現在のパスワード
          </label>
          <div className="relative">
            <TextInputField
              {...formMethods.register(c_CurrentPassword)}
              id={c_CurrentPassword}
              placeholder="*****"
              type={showCurrentPassword ? "text" : "password"}
              disabled={isPending}
              error={!!fieldErrors.currentPassword}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              <FontAwesomeIcon 
                icon={showCurrentPassword ? faEyeSlash : faEye} 
                className="text-gray-500 hover:text-gray-700"
              />
            </button>
          </div>
          <ErrorMsgField msg={fieldErrors.currentPassword?.message} />
        </div>

        <div>
          <label htmlFor={c_NewPassword} className="mb-2 block font-bold">
            新しいパスワード
          </label>
          <div className="relative">
            <TextInputField
              {...formMethods.register(c_NewPassword)}
              id={c_NewPassword}
              placeholder="*****"
              type={showNewPassword ? "text" : "password"}
              disabled={isPending}
              error={!!fieldErrors.newPassword}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              <FontAwesomeIcon 
                icon={showNewPassword ? faEyeSlash : faEye} 
                className="text-gray-500 hover:text-gray-700"
              />
            </button>
          </div>
          <ErrorMsgField msg={fieldErrors.newPassword?.message} />
        </div>

        <div>
          <label htmlFor={c_ConfirmPassword} className="mb-2 block font-bold">
            新しいパスワード確認
          </label>
          <div className="relative">
            <TextInputField
              {...formMethods.register(c_ConfirmPassword)}
              id={c_ConfirmPassword}
              placeholder="*****"
              type={showConfirmPassword ? "text" : "password"}
              disabled={isPending}
              error={!!fieldErrors.confirmPassword}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <FontAwesomeIcon 
                icon={showConfirmPassword ? faEyeSlash : faEye} 
                className="text-gray-500 hover:text-gray-700"
              />
            </button>
          </div>
          <ErrorMsgField msg={fieldErrors.confirmPassword?.message} />
          <ErrorMsgField msg={fieldErrors.root?.message} />
        </div>

        <Button
          variant="indigo"
          width="stretch"
          className="tracking-widest"
          isBusy={isPending}
          disabled={!formMethods.formState.isValid || isPending}
        >
          パスワードを変更
        </Button>
      </form>
    </div>
  );
};

export default Page;
