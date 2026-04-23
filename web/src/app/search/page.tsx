import Navbar from "@/components/Navbar/navbar";
import SearchResults from "./search-results";
import styles from "./search.module.css";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    tags?: string;
    start_after?: string;
    start_before?: string;
  }>;
}) {
  const {
    q = "",
    category = "keyword",
    tags = "",
    start_after = "",
    start_before = "",
  } = await searchParams;

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.wrap}>
        {/*
          key forces a full remount when query/category changes so local
          filter state (sort, date window) resets to defaults on each new search.
        */}
        <SearchResults
          key={`${q}-${category}-${tags}-${start_after}`}
          query={q}
          category={category}
          tags={tags}
          startAfter={start_after}
          startBefore={start_before}
        />
      </main>
    </div>
  );
}
