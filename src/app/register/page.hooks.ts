import { setHost } from "@/services/host";
import { register } from "@/services/user";
import { registerSchema } from "@/services/user/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function useRegister() {
  const [host, setHostName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setValidationErrors({});

    setHost(host);

    const parseResult = registerSchema.safeParse({
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

    try {
      const result = await register({ username, password });
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
    } catch (error) {
      setMessage(
        `予期せぬエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      setIsLoading(false);
    }
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
    handleSubmit,
    validationErrors,
  };
}
