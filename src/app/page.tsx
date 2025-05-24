"use client";

import useRegistration from "@/app/page.hooks";
import ErrorMessage from "@/components/ErrorMessage";
import TextBox from "@/components/TextBox";
import styles from "./page.module.css";

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
    validationErrors,
  } = useRegistration();

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <h2 className={styles.formTitle}>ユーザー登録</h2>
          <TextBox
            type="text"
            placeholder="ホスト名"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            required
          />
          <ErrorMessage message={validationErrors.host} />
          <TextBox
            type="email"
            placeholder="メールアドレス"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <ErrorMessage message={validationErrors.username} />
          <TextBox
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <ErrorMessage message={validationErrors.password} />
          <button type="submit" disabled={isLoading} className={styles.button}>
            {isLoading ? "処理中..." : "登録"}
          </button>
          {message && <div className={styles.message}>{message}</div>}
        </form>
      </main>
    </div>
  );
}
