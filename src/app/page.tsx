"use client";

import useHome from "./page.hooks";
import styles from "./page.module.css";

export default function Home() {
  useHome();

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.formTitle}>Ant App</h1>
      </main>
    </div>
  );
}
