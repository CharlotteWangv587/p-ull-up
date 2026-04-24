"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar/navbar";
import { useAuth } from "@/context/auth";
import NotificationButton from "@/components/NotificationButton/notification-button";
import ProfileDropdown from "@/components/ProfileDropdown/profile-dropdown";
import AnimatedPageBackground from "@/components/AnimatedPageBackground/animated-page-background";
import EventsSearchBar from "@/components/EventsSearchBar/events-search-bar";
import SearchResults from "./search-results";
import styles from "./search.module.css";

type Props = {
  query: string;
  category: string;
  tags: string;
  initialDateFilter: string;
};

export default function SearchPageClient({
  query,
  category,
  tags,
  initialDateFilter,
}: Props) {
  const { signOut } = useAuth();

  const initialTags = tags ? tags.split(",").filter(Boolean) : [];
  const displayQuery = query || initialTags.map((t) => `#${t}`).join(" ");

  return (
    <AnimatedPageBackground>
      <div className={styles.page}>
        <Navbar
          showAuth={false}
          hideSearch={true}
          logoHref="/personalized-dashboard"
          rightContent={
            <>
              <NotificationButton />
              <ProfileDropdown onSignOut={signOut} />
            </>
          }
        />

        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            {displayQuery ? (
              <>
                Results for{" "}
                <span className={styles.queryHighlight}>&ldquo;{displayQuery}&rdquo;</span>
              </>
            ) : (
              "Browse all events."
            )}
          </h1>
          <Link className={styles.createLink} href="/eventposting">
            + Post your own event
          </Link>
        </div>

        <div className={styles.searchSection}>
          <EventsSearchBar
            initialCategory={category as "keyword" | "event" | "campus"}
            initialTags={initialTags}
            initialQuery={query}
          />
        </div>

        <main className={styles.wrap}>
          <SearchResults
            key={`${query}-${category}-${tags}-${initialDateFilter}`}
            query={query}
            category={category}
            tags={tags}
            initialDateFilter={initialDateFilter}
          />
        </main>
      </div>
    </AnimatedPageBackground>
  );
}
