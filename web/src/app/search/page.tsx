import Navbar from "@/components/Navbar/navbar";
import SearchResults from "./search-results";
import styles from "./search.module.css";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q = "", category = "keyword" } = await searchParams;

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.wrap}>
        {/*
          key forces a full remount when query/category changes so local
          filter state (sort, date window) resets to defaults on each new search.
        */}
        <SearchResults key={`${q}-${category}`} query={q} category={category} />
      </main>
    </div>
  );
}
