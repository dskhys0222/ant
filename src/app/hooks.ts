import { registerUser } from "@/services/registrationService";
import { useState } from "react";

export default function useRegistration() {
  const [host, setHost] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const result = await registerUser({
        host,
        username,
        password,
      });

      if (result.success) {
        setMessage(result.message);
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
    setHost,
    username,
    setUsername,
    password,
    setPassword,
    message,
    isLoading,
    handleSubmit,
  };
}
