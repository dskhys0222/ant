import { setHost } from "@/services/host";
import { login } from "@/services/user";
import { loginSchema } from "@/services/user/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function useLogin() {
  const [host, setHostName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setValidationErrors({});

    setHost(host);

    const parseResult = loginSchema.safeParse({
      username,
      password,
    });
    if (!parseResult.success) {
      const errors: { [key: string]: string } = {};
      for (const err of parseResult.error.errors) {
        if (err.path[0]) errors[err.path[0]] = err.message;
      }
      setValidationErrors(errors);
      setIsLoading(false);
      return;
    }

    const result = await login({ username, password });
    if (result.success) {
      setMessage(result.message);
      router.push("/tasks");
    } else {
      setMessage(
        result.status
          ? `${result.status} エラー: ${result.message}`
          : `エラーが発生しました: ${result.message}`,
      );
    }

    setIsLoading(false);
  };

  return {
    host,
    setHost: setHostName,
    username,
    setUsername,
    password,
    setPassword,
    message,
    isLoading,
    handleLogin,
    validationErrors,
  };
}
