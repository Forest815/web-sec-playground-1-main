// シンプルなインメモリ制限（実際のプロダクトではRedisを使用することを推奨）
const loginAttempts = new Map<string, { count: number; lastAttempt: Date }>();
const ipBlockList = new Map<string, Date>();

export const checkLoginRateLimit = (ipAddress: string): boolean => {
  const now = new Date();
  const attempt = loginAttempts.get(ipAddress);

  if (!attempt) {
    loginAttempts.set(ipAddress, { count: 1, lastAttempt: now });
    return true;
  }

  // 5分以内に5回以上の試行があった場合は制限
  const timeDiff = now.getTime() - attempt.lastAttempt.getTime();
  const fiveMinutes = 5 * 60 * 1000;

  if (timeDiff < fiveMinutes) {
    if (attempt.count >= 5) {
      // IPアドレスを30分間ブロック
      ipBlockList.set(ipAddress, new Date(now.getTime() + 30 * 60 * 1000));
      return false;
    }
    attempt.count++;
  } else {
    // 5分経過したらカウントリセット
    attempt.count = 1;
  }

  attempt.lastAttempt = now;
  return true;
};

export const isIpBlocked = (ipAddress: string): boolean => {
  const blockTime = ipBlockList.get(ipAddress);
  if (!blockTime) return false;

  const now = new Date();
  if (now > blockTime) {
    ipBlockList.delete(ipAddress);
    return false;
  }

  return true;
};

export const resetLoginAttempts = (ipAddress: string): void => {
  loginAttempts.delete(ipAddress);
  ipBlockList.delete(ipAddress);
};
