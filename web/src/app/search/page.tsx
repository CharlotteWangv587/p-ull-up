import SearchPageClient from "./search-page-client";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    tags?: string;
    date_filter?: string;
  }>;
}) {
  const {
    q = "",
    category = "keyword",
    tags = "",
    date_filter = "all",
  } = await searchParams;

  return (
    <SearchPageClient
      query={q}
      category={category}
      tags={tags}
      initialDateFilter={date_filter}
    />
  );
}
