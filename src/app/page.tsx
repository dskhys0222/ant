"use client";

import useHome from "./page.hooks";
import styles from "./page.styles";

export default function Home() {
  useHome();

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Ant App</h1>
      </main>
    </div>
  );
}
