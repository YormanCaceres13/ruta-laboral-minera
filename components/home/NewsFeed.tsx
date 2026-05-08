import { NEWS } from "./news.data";
import { NewsCard } from "./NewsCard";

export function NewsFeed() {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {NEWS.map((p) => (
        <NewsCard key={p.id} post={p} />
      ))}
    </section>
  );
}