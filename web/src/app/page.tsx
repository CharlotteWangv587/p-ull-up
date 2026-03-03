import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className={styles.intro}>
          <h1>Welcome</h1>
          <p>Sign in or create an account to continue.</p>
        </div>
        <div className={styles.ctas}>
          <Link href="/login" className={styles.primary}>
            Sign in / Create account
          </Link>
        </div>
      </main>
    </div>
  );
}
