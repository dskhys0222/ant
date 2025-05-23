"use client";

import useRegistration from "@/app/hooks";
import TextBox from "@/components/TextBox";

export default function Home() {
  const {
    host,
    setHost,
    username,
    setUsername,
    password,
    setPassword,
    message,
    isLoading,
    handleSubmit,
  } = useRegistration();

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 max-w-sm mx-auto p-6 rounded shadow"
        >
          <h2 className="text-xl font-bold mb-2">ユーザー登録</h2>
          <TextBox
            type="text"
            placeholder="ホスト名"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            required
          />
          <TextBox
            type="email"
            placeholder="メールアドレス"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <TextBox
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className={`rounded px-4 py-2 ${
              isLoading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            } text-white`}
          >
            {isLoading ? "処理中..." : "登録"}
          </button>
          {message && <div className="mt-2 text-center">{message}</div>}
        </form>
      </main>
    </div>
  );
}
