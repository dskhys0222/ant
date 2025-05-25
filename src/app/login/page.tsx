"use client";

import Button from "@/components/Button";
import Form from "@/components/Form";
import Text from "@/components/Text";
import TextField from "@/components/TextField";
import Link from "next/link";
import useLogin from "./page.hooks";
import styles from "./page.styles";

export default function Login() {
  const {
    host,
    setHost,
    username,
    setUsername,
    password,
    setPassword,
    message,
    isLoading,
    handleLogin,
    validationErrors,
  } = useLogin();

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <Form onSubmit={handleLogin}>
          <Text value="ログイン" size="large" />
          <TextField
            type="text"
            label="ホスト名"
            value={host}
            onChange={(value) => setHost(value)}
            errorMessage={validationErrors.host}
          />
          <TextField
            type="email"
            label="メールアドレス"
            value={username}
            onChange={(value) => setUsername(value)}
            errorMessage={validationErrors.username}
          />
          <TextField
            type="password"
            label="パスワード"
            value={password}
            onChange={(value) => setPassword(value)}
            errorMessage={validationErrors.password}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "ログイン中..." : "ログイン"}
          </Button>
          {message && <Text value={message} size="small" />}
          <Link href="/register">新規登録</Link>
        </Form>
      </main>
    </div>
  );
}
