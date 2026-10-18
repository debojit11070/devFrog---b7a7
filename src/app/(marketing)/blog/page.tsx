import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { POSTS } from "@/lib/blog";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog",
  description: "Practical notes on designing, running and taking developer assessments.",
};

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
      <div className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Blog</h1>
        <p className="mt-2 text-muted-foreground">Practical notes on designing, running and taking developer assessments.</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {POSTS.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
            <Card className="flex h-full min-h-64 flex-col p-6 transition group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-raised">
              <p className="text-xs font-medium uppercase tracking-wide text-primary">{post.category}</p>
              <h2 className="mt-2 font-semibold leading-snug">{post.title}</h2>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
              <p className="mt-auto pt-4 text-xs text-muted-foreground">
                {formatDate(post.date)} · {post.readMinutes} min read
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
