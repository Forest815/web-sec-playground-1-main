import bcrypt from "bcryptjs";

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const getPasswordStrength = (password: string) => {
  let score = 0;
  const feedback: string[] = [];

  // 長さのチェック
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push("8文字以上にしてください");
  }

  // 大文字のチェック
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("大文字を含めてください");
  }

  // 小文字のチェック
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("小文字を含めてください");
  }

  // 数字のチェック
  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push("数字を含めてください");
  }

  // 特殊文字のチェック
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push("特殊文字を含めてください");
  }

  const levels = ["非常に弱い", "弱い", "普通", "強い", "非常に強い"];
  const level = levels[score] || "非常に弱い";

  return {
    score,
    level,
    feedback,
    isStrong: score >= 4,
  };
};
