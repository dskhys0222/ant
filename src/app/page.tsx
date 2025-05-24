"use client";

import useRegistration from "@/app/page.hooks";
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
          {validationErrors.host && (
            <div className={styles.error}>{validationErrors.host}</div>
          )}
          <TextBox
            type="email"
            placeholder="メールアドレス"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          {validationErrors.username && (
            <div className={styles.error}>{validationErrors.username}</div>
          )}
          <TextBox
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {validationErrors.password && (
            <div className={styles.error}>{validationErrors.password}</div>
          )}
          <button type="submit" disabled={isLoading} className={styles.button}>
            {isLoading ? "処理中..." : "登録"}
          </button>
          {message && <div className={styles.message}>{message}</div>}
        </form>
      </main>
    </div>
  );
}
