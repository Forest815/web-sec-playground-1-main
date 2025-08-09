import { z } from "zod";
import {
  userNameSchema,
  emailSchema,
  passwordSchema,
} from "@/app/_types/CommonSchemas";

export const signupRequestSchema = z.object({
  name: userNameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, "確認用パスワードを入力してください"),
  secretQuestion: z.string().min(1, "秘密の質問を入力してください"),
  secretAnswer: z.string().min(1, "秘密の質問の答えを入力してください"),
}).refine(data => data.password === data.confirmPassword, {
  message: "パスワードが一致しません",
  path: ["confirmPassword"],
});

export type SignupRequest = z.infer<typeof signupRequestSchema>;
