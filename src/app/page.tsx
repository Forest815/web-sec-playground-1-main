import NextLink from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShieldAlt, faLock, faUserPlus, faKey, faUser, faHistory } from "@fortawesome/free-solid-svg-icons";

const features = [
  {
    icon: faLock,
    title: "セッションベース認証",
    description: "安全なセッション管理による認証システム"
  },
  {
    icon: faShieldAlt,
    title: "アカウントロック機能",
    description: "連続ログイン失敗でアカウントを自動ロック"
  },
  {
    icon: faKey,
    title: "パスワード強度チェック",
    description: "リアルタイムでパスワード強度を評価"
  },
  {
    icon: faHistory,
    title: "ログイン履歴",
    description: "過去のログイン履歴を詳細に記録・表示"
  }
];

const links = [
  {
    href: "/login",
    label: "ログイン",
    info: "セッションベース認証でログイン",
    icon: faLock,
  },
  {
    href: "/signup",
    label: "新規登録",
    info: "パスワード強度チェック、確認用パスワード入力",
    icon: faUserPlus,
  },
  {
    href: "/member/about",
    label: "マイページ",
    info: "ログインが必要なコンテンツ",
    icon: faUser,
  },
  {
    href: "/reset-password",
    label: "パスワードリセット",
    info: "秘密の質問によるパスワードリセット",
    icon: faKey,
  },
];

const Page: React.FC = () => {
  return (
    <main>
      <div className="text-3xl font-bold mb-2">
        <FontAwesomeIcon icon={faShieldAlt} className="mr-2 text-blue-600" />
        Secure Authentication App
      </div>
      <p className="text-gray-600 mb-8">
        セキュアな認証・認可機能を実装したNext.jsアプリケーション
      </p>

      {/* 機能一覧 */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">実装済み機能</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center mb-2">
                <FontAwesomeIcon icon={feature.icon} className="mr-2 text-blue-600" />
                <h3 className="font-bold">{feature.title}</h3>
              </div>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ナビゲーション */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">ページ一覧</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {links.map(({ href, label, info, icon }) => (
            <NextLink key={href} href={href} className="block">
              <div className="border rounded-lg p-4 hover:bg-blue-50 hover:border-blue-300 transition-colors">
                <div className="flex items-center mb-2">
                  <FontAwesomeIcon icon={icon} className="mr-2 text-blue-600" />
                  <h3 className="font-bold">{label}</h3>
                </div>
                <p className="text-sm text-gray-600">{info}</p>
              </div>
            </NextLink>
          ))}
        </div>
      </div>

      {/* セキュリティ機能詳細 */}
      <div>
        <h2 className="text-2xl font-bold mb-4">追加されたセキュリティ機能</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-bold">連続ログイン失敗によるアカウントロック</h3>
            <p className="text-sm text-gray-600">5回連続でログインに失敗すると、30分間アカウントがロックされます。</p>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-bold">確認用パスワード入力</h3>
            <p className="text-sm text-gray-600">サインアップ時に確認用パスワードの入力を必須としています。</p>
          </div>
          <div className="border-l-4 border-yellow-500 pl-4">
            <h3 className="font-bold">パスワード強度表示</h3>
            <p className="text-sm text-gray-600">リアルタイムでパスワードの強度を評価し、視覚的に表示します。</p>
          </div>
          <div className="border-l-4 border-purple-500 pl-4">
            <h3 className="font-bold">メールアドレス重複チェック</h3>
            <p className="text-sm text-gray-600">サインアップ時にメールアドレスの重複をリアルタイムでチェックします。</p>
          </div>
          <div className="border-l-4 border-red-500 pl-4">
            <h3 className="font-bold">ログイン試行間隔制限</h3>
            <p className="text-sm text-gray-600">短時間での大量ログイン試行を制限し、ブルートフォース攻撃を防ぎます。</p>
          </div>
          <div className="border-l-4 border-indigo-500 pl-4">
            <h3 className="font-bold">ログイン履歴表示</h3>
            <p className="text-sm text-gray-600">ユーザーのログイン履歴（成功・失敗）をIPアドレスと共に記録・表示します。</p>
          </div>
          <div className="border-l-4 border-pink-500 pl-4">
            <h3 className="font-bold">ログインID自動入力機能</h3>
            <p className="text-sm text-gray-600">「次回からログインIDを自動入力する」チェックボックスによる利便性向上。</p>
          </div>
          <div className="border-l-4 border-gray-500 pl-4">
            <h3 className="font-bold">秘密の質問によるパスワードリセット</h3>
            <p className="text-sm text-gray-600">秘密の質問と答えを使用したパスワードリセット機能。</p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Page;
