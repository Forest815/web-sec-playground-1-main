"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupRequestSchema, SignupRequest } from "@/app/_types/SignupRequest";
import { TextInputField } from "@/app/_components/TextInputField";
import { ErrorMsgField } from "@/app/_components/ErrorMsgField";
import { Button } from "@/app/_components/Button";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { faSpinner, faPenNib, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { signupServerAction } from "@/app/_actions/signup";
import { getPasswordStrength } from "@/app/_utils/password";
import axios from "axios";

const Page: React.FC = () => {
  const c_Name = "name";
  const c_Email = "email";
  const c_Password = "password";
  const c_ConfirmPassword = "confirmPassword";
  const c_SecretQuestion = "secretQuestion";
  const c_SecretAnswer = "secretAnswer";

  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [isSignUpCompleted, setIsSignUpCompleted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{ score: number; level: string; feedback: string[]; isStrong: boolean; }>({ score: 0, level: "", feedback: [], isStrong: false });
  const [emailExists, setEmailExists] = useState(false);
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);

  // フォーム処理関連の準備と設定
  const formMethods = useForm<SignupRequest>({
    mode: "onChange",
    resolver: zodResolver(signupRequestSchema),
  });
  const fieldErrors = formMethods.formState.errors;

  // パスワード強度チェック
  const watchPassword = formMethods.watch(c_Password);
  useEffect(() => {
    if (watchPassword) {
      const strength = getPasswordStrength(watchPassword);
      setPasswordStrength(strength);
    }
  }, [watchPassword]);

  // メールアドレス重複チェック
  const watchEmail = formMethods.watch(c_Email);
  useEffect(() => {
    const checkEmail = async () => {
      if (watchEmail && watchEmail.includes("@")) {
        setEmailCheckLoading(true);
        try {
          const response = await axios.post("/api/check-email", { email: watchEmail });
          if (response.data.success) {
            setEmailExists(response.data.payload.exists);
          }
        } catch (error) {
          console.error("Email check failed:", error);
        } finally {
          setEmailCheckLoading(false);
        }
      }
    };

    const timer = setTimeout(checkEmail, 500);
    return () => clearTimeout(timer);
  }, [watchEmail]);

  // ルートエラー（サーバサイドで発生した認証エラー）の表示設定の関数
  const setRootError = (errorMsg: string) => {
    formMethods.setError("root", {
      type: "manual",
      message: errorMsg,
    });
  };

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
    if (isSignUpCompleted) {
      router.replace(`/login?${c_Email}=${formMethods.getValues(c_Email)}`);
      router.refresh();
      console.log("サインアップ完了");
    }
  }, [formMethods, isSignUpCompleted, router]);

  // フォームの送信処理
  const onSubmit = async (signupRequest: SignupRequest) => {
    try {
      startTransition(async () => {
        // ServerAction (Custom Invocation) の利用
        const res = await signupServerAction(signupRequest);
        if (!res.success) {
          setRootError(res.message);
          return;
        }
        setIsSignUpCompleted(true);
      });
    } catch (e) {
      const errorMsg =
        e instanceof Error ? e.message : "予期せぬエラーが発生しました。";
      setRootError(errorMsg);
    }
  };

  return (
    <main>
      <div className="text-2xl font-bold">
        <FontAwesomeIcon icon={faPenNib} className="mr-1.5" />
        Signup
      </div>
      <form
        noValidate
        onSubmit={formMethods.handleSubmit(onSubmit)}
        className="mt-4 flex flex-col gap-y-4"
      >
        <div>
          <label htmlFor={c_Name} className="mb-2 block font-bold">
            表示名
          </label>
          <TextInputField
            {...formMethods.register(c_Name)}
            id={c_Name}
            placeholder="寝屋川 タヌキ"
            type="text"
            disabled={isPending || isSignUpCompleted}
            error={!!fieldErrors.name}
            autoComplete="name"
          />
          <ErrorMsgField msg={fieldErrors.name?.message} />
        </div>

        <div>
          <label htmlFor={c_Email} className="mb-2 block font-bold">
            メールアドレス（ログインID）
          </label>
          <div className="relative">
            <TextInputField
              {...formMethods.register(c_Email)}
              id={c_Email}
              placeholder="name@example.com"
              type="email"
              disabled={isPending || isSignUpCompleted}
              error={!!fieldErrors.email || emailExists}
              autoComplete="email"
            />
            {emailCheckLoading && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <FontAwesomeIcon icon={faSpinner} className="animate-spin text-gray-500" />
              </div>
            )}
          </div>
          <ErrorMsgField msg={fieldErrors.email?.message} />
          {emailExists && (
            <div className="text-red-500 text-sm mt-1">
              このメールアドレスは既に使用されています
            </div>
          )}
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
              disabled={isPending || isSignUpCompleted}
              error={!!fieldErrors.password}
              autoComplete="new-password"
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
          {watchPassword && (
            <div className="mt-2">
              <div className="text-sm font-medium mb-1">パスワード強度: {passwordStrength.level}</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    passwordStrength.score === 0 ? 'bg-red-500 w-1/5' :
                    passwordStrength.score === 1 ? 'bg-red-400 w-2/5' :
                    passwordStrength.score === 2 ? 'bg-yellow-500 w-3/5' :
                    passwordStrength.score === 3 ? 'bg-yellow-400 w-4/5' :
                    'bg-green-500 w-full'
                  }`}
                />
              </div>
              {passwordStrength.feedback.length > 0 && (
                <div className="text-xs text-gray-600 mt-1">
                  推奨: {passwordStrength.feedback.join(", ")}
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <label htmlFor={c_ConfirmPassword} className="mb-2 block font-bold">
            パスワード確認
          </label>
          <div className="relative">
            <TextInputField
              {...formMethods.register(c_ConfirmPassword)}
              id={c_ConfirmPassword}
              placeholder="*****"
              type={showConfirmPassword ? "text" : "password"}
              disabled={isPending || isSignUpCompleted}
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
        </div>

        <div>
          <label htmlFor={c_SecretQuestion} className="mb-2 block font-bold">
            秘密の質問
          </label>
          <TextInputField
            {...formMethods.register(c_SecretQuestion)}
            id={c_SecretQuestion}
            placeholder="あなたの出身地は？"
            type="text"
            disabled={isPending || isSignUpCompleted}
            error={!!fieldErrors.secretQuestion}
            autoComplete="off"
          />
          <ErrorMsgField msg={fieldErrors.secretQuestion?.message} />
        </div>

        <div>
          <label htmlFor={c_SecretAnswer} className="mb-2 block font-bold">
            秘密の質問の答え
          </label>
          <TextInputField
            {...formMethods.register(c_SecretAnswer)}
            id={c_SecretAnswer}
            placeholder="答えを入力してください"
            type="text"
            disabled={isPending || isSignUpCompleted}
            error={!!fieldErrors.secretAnswer}
            autoComplete="off"
          />
          <ErrorMsgField msg={fieldErrors.secretAnswer?.message} />
        </div>
        <ErrorMsgField msg={fieldErrors.root?.message} />

        <Button
          variant="indigo"
          width="stretch"
          className="tracking-widest"
          disabled={
            !formMethods.formState.isValid ||
            formMethods.formState.isSubmitting ||
            isSignUpCompleted ||
            emailExists ||
            !passwordStrength.isStrong
          }
        >
          {isPending ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
              登録中...
            </>
          ) : (
            "登録"
          )}
        </Button>
      </form>

      {isSignUpCompleted && (
        <div>
          <div className="mt-4 flex items-center gap-x-2">
            <FontAwesomeIcon icon={faSpinner} spin />
            <div>サインアップが完了しました。ログインページに移動します。</div>
          </div>
          <NextLink
            href={`/login?${c_Email}=${formMethods.getValues(c_Email)}`}
            className="text-blue-500 hover:underline"
          >
            自動的に画面が切り替わらないときはこちらをクリックしてください。
          </NextLink>
        </div>
      )}

      <div className="mt-6 text-center">
        <NextLink href="/login" className="text-blue-500 hover:underline">
          アカウントをお持ちの方はこちら
        </NextLink>
      </div>
    </main>
  );
};

export default Page;
