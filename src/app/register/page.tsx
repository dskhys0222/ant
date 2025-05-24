"use client";

import TextField from "@/components/TextField";
import useRegister from "./page.hooks";
import styles from "./page.module.css";

export default function Register() {
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
  } = useRegister();

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <h2 className={styles.formTitle}>ユーザー登録</h2>
          <TextField
            type="text"
            label="ホスト名"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            required
            errorMessage={validationErrors.host}
          />
          <TextField
            type="email"
            label="メールアドレス"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            errorMessage={validationErrors.username}
          />
          <TextField
            type="password"
            label="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            errorMessage={validationErrors.password}
          />
          <button type="submit" disabled={isLoading} className={styles.button}>
            {isLoading ? "処理中..." : "登録"}
          </button>
          {message && <div className={styles.message}>{message}</div>}
        </form>
      </main>
    </div>
  );
}
