import useForm from "./hooks";
import styles from "./styles.module.css";
import type { FormProps } from "./types";

export default function Form(props: FormProps) {
  const { children, onSubmit } = props;

  const { handleSubmit } = useForm(onSubmit);

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {children}
    </form>
  );
}
