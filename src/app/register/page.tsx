"use client";

import Button from "@/components/Button";
import Form from "@/components/Form";
import Text from "@/components/Text";
import TextField from "@/components/TextField";
import Link from "next/link";
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
        <Form onSubmit={handleSubmit}>
          <Text value="ユーザー登録" size="large" />
          <TextField
            type="text"
            label="ホスト名"
            placeholder="ホスト名"
            value={host}
            onChange={(value) => setHost(value)}
            errorMessage={validationErrors.host}
          />
          <TextField
            type="email"
            label="メールアドレス"
            placeholder="メールアドレス"
            value={username}
            onChange={(value) => setUsername(value)}
            errorMessage={validationErrors.username}
          />
          <TextField
            type="password"
            label="パスワード"
            placeholder="パスワード"
            value={password}
            onChange={(value) => setPassword(value)}
            errorMessage={validationErrors.password}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "処理中..." : "登録"}
          </Button>
          {message && <Text value={message} size="small" />}
          <Link href="/login">ログイン</Link>
        </Form>
      </main>
    </div>
  );
}
