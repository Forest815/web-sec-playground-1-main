// セッションベース認証を使用
const AUTH_MODE = "session" as const;

// 認証モードの設定
export const AUTH = {
  mode: AUTH_MODE,
  isSession: true,
  isJWT: false,
} as const;

// 認証関連の設定
export const AUTH_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5, // 最大ログイン失敗回数
  LOCK_DURATION_MINUTES: 30, // アカウントロック時間（分）
  SESSION_DURATION_HOURS: 3, // セッション有効期間（時間）
  PASSWORD_MIN_LENGTH: 8, // パスワード最小長
} as const;
