import { z } from "zod";

export const passwordResetRequestSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  secretAnswer: z.string().min(1, "秘密の質問の答えを入力してください"),
});

export type PasswordResetRequest = z.infer<typeof passwordResetRequestSchema>;

export const passwordChangeRequestSchema = z.object({
  currentPassword: z.string().min(1, "現在のパスワードを入力してください"),
  newPassword: z.string().min(8, "新しいパスワードは8文字以上で入力してください"),
  confirmPassword: z.string().min(1, "確認用パスワードを入力してください"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "パスワードが一致しません",
  path: ["confirmPassword"],
});

export type PasswordChangeRequest = z.infer<typeof passwordChangeRequestSchema>;
