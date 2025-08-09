"use client";

import React from "react";
import { useAuth } from "@/app/_hooks/useAuth";
import { faTriangleExclamation, faUser, faLock, faHistory } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import NextLink from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  children: React.ReactNode;
}

const Layout: React.FC<Props> = (props) => {
  const { children } = props;
  const { userProfile } = useAuth();
  const pathname = usePathname();

  if (!userProfile)
    return (
      <main>
        <div className="text-2xl font-bold">
          <FontAwesomeIcon icon={faTriangleExclamation} className="mr-1.5" />
          ログインが必要なコンテンツ
        </div>
        <div className="mt-4">
          このコンテンツを利用するためには
          <NextLink
            href={`/login`}
            className="px-1 text-blue-500 hover:underline"
          >
            ログイン
          </NextLink>
          してください。
        </div>
      </main>
    );

  const navigationItems = [
    { href: "/member/about", label: "プロフィール", icon: faUser },
    { href: "/member/change-password", label: "パスワード変更", icon: faLock },
    { href: "/member/login-history", label: "ログイン履歴", icon: faHistory },
  ];

  return (
    <div className="flex gap-6">
      {/* サイドナビゲーション */}
      <nav className="w-64 bg-gray-50 rounded-lg p-4">
        <h2 className="text-lg font-bold mb-4">メンバーメニュー</h2>
        <ul className="space-y-2">
          {navigationItems.map((item) => (
            <li key={item.href}>
              <NextLink
                href={item.href}
                className={`flex items-center p-2 rounded hover:bg-gray-200 transition-colors ${
                  pathname === item.href ? "bg-blue-100 text-blue-700" : "text-gray-700"
                }`}
              >
                <FontAwesomeIcon icon={item.icon} className="mr-2 w-4" />
                {item.label}
              </NextLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* メインコンテンツ */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default Layout;
