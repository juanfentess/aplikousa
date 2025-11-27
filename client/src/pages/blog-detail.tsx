import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function BlogDetail() {
  const [match, params] = useRoute("/blog/:slug");
  const [post, setPost] = useState<any>(null);
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.slug) return;

    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/blog/posts/${params.slug}`);
        if (!res.ok) throw new Error("Post not found");
        const postData = await res.json();
        setPost(postData);

        // Fetch category info
        const catRes = await fetch(`/api/blog/categories`);
        const categories = await catRes.json();
        const cat = categories.find((c: any) => c.id === postData.categoryId);
        setCategory(cat);
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params?.slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600">Po ngarkohet...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Postimi nuk u gjet</h1>
          <Link href="/blog">
            <Button data-testid="button-back">Kthehu në Blog</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/blog">
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kthehu në Blog
          </Button>
        </Link>

        <article>
          {post.imageUrl && (
            <div className="w-full h-96 bg-slate-200 rounded-lg overflow-hidden mb-8">
              <img
                src={post.imageUrl}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="mb-6">
            {category && (
              <Link href={`/blog/category/${category.slug}`}>
                <Button variant="outline" size="sm" className="mb-4">
                  {category.name}
                </Button>
              </Link>
            )}
            <h1 className="text-4xl font-bold mb-4 text-slate-900">{post.title}</h1>
            <div className="flex items-center text-slate-600">
              <time dateTime={post.publishedAt || post.createdAt}>
                {new Date(post.publishedAt || post.createdAt).toLocaleDateString("sq-AL", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </div>
          </div>

          <Card className="mb-8">
            <CardContent className="pt-6">
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: post.content }}
                data-testid="post-content"
              />
            </CardContent>
          </Card>

          {post.seoKeywords && (
            <div className="mb-8">
              <h3 className="font-semibold mb-2">Fjalë kyçe:</h3>
              <div className="flex flex-wrap gap-2">
                {post.seoKeywords.split(",").map((keyword: string, i: number) => (
                  <span key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {keyword.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
