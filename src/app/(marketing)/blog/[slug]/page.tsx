import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { POSTS, getPost } from "@/lib/blog";
import { formatDate } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  return post ? { title: post.title, description: post.excerpt } : { title: "Article not found" };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
      <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden /> All articles
      </Link>
      <p className="mt-6 text-xs font-medium uppercase tracking-wide text-primary">{post.category}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{post.title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {formatDate(post.date)} · {post.readMinutes} min read
      </p>
      <div className="mt-8 flex flex-col gap-5 leading-relaxed text-muted-foreground">
        {post.body.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}
