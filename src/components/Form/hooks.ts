export default function useForm(
  onSubmit: ((e: React.FormEvent<HTMLFormElement>) => void) | undefined,
) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit?.(e);
  };

  return { handleSubmit };
}
