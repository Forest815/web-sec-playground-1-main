"use client";

import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHistory, faCheckCircle, faTimesCircle, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { ApiResponse } from "../../_types/ApiResponse";

interface LoginHistoryItem {
  id: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  createdAt: string;
}

const Page: React.FC = () => {
  const [loginHistory, setLoginHistory] = useState<LoginHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLoginHistory = async () => {
      try {
        const res = await fetch("/api/login-history", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("ログイン履歴の取得に失敗しました");
        }

        const body = (await res.json()) as ApiResponse<LoginHistoryItem[]>;
        if (!body.success) {
          setError(body.message);
          return;
        }

        setLoginHistory(body.payload || []);
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : "予期せぬエラーが発生しました。";
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchLoginHistory();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getBrowserName = (userAgent: string) => {
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Edge")) return "Edge";
    return "Unknown";
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <FontAwesomeIcon icon={faSpinner} spin className="text-2xl text-gray-500" />
        <p className="mt-2 text-gray-600">ログイン履歴を読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="text-2xl font-bold mb-4">
        <FontAwesomeIcon icon={faHistory} className="mr-1.5" />
        ログイン履歴
      </div>

      {loginHistory.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          ログイン履歴がありません。
        </div>
      ) : (
        <div className="space-y-3">
          {loginHistory.map((item) => (
            <div
              key={item.id}
              className={`border rounded-lg p-4 ${
                item.success 
                  ? "border-green-200 bg-green-50" 
                  : "border-red-200 bg-red-50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <FontAwesomeIcon
                    icon={item.success ? faCheckCircle : faTimesCircle}
                    className={`mr-2 ${
                      item.success ? "text-green-600" : "text-red-600"
                    }`}
                  />
                  <span className={`font-bold ${
                    item.success ? "text-green-800" : "text-red-800"
                  }`}>
                    {item.success ? "ログイン成功" : "ログイン失敗"}
                  </span>
                </div>
                <span className="text-sm text-gray-600">
                  {formatDate(item.createdAt)}
                </span>
              </div>
              <div className="text-sm space-y-1">
                <div>
                  <span className="font-medium">IPアドレス:</span> {item.ipAddress}
                </div>
                <div>
                  <span className="font-medium">ブラウザ:</span> {getBrowserName(item.userAgent)}
                </div>
                <div className="text-xs text-gray-500">
                  <span className="font-medium">User Agent:</span> {item.userAgent}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Page;
