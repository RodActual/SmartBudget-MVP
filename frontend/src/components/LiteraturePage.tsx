import { useState, useEffect } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ExternalLink, Search, BookOpen, Video, Calculator, PenTool, FileText, Database } from "lucide-react";

interface Resource {
  id?: string;
  title: string;
  description: string;
  category: "Article" | "Video" | "Tool" | "Guide";
  url: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  readTime: string;
}

const SAMPLE_RESOURCES: Omit<Resource, "id">[] = [
  { title: "The 50/30/20 Rule Explained",         description: "A simple framework to divide your income into Needs, Wants, and Savings.",                    category: "Article", url: "https://www.investopedia.com/financial-edge/0712/the-50-30-20-rule-of-thumb-for-budgets.aspx", difficulty: "Beginner",     readTime: "3 min read" },
  { title: "Debt Snowball vs. Avalanche",          description: "Two powerful strategies to eliminate debt. Which one fits your psychology?",                    category: "Guide",   url: "https://www.ramseysolutions.com/debt/debt-snowball-vs-debt-avalanche",                          difficulty: "Intermediate", readTime: "5 min read" },
  { title: "Compound Interest Calculator",         description: "Visualize how your money can grow over time with the power of compound interest.",             category: "Tool",    url: "https://www.calculator.net/compound-interest-calculator.html",                                 difficulty: "Beginner",     readTime: "Tool"       },
  { title: "Emergency Fund Basics",                description: "Why you need a financial safety net and how much you should save.",                             category: "Article", url: "https://www.nerdwallet.com/article/banking/emergency-fund-why-it-matters",                      difficulty: "Beginner",     readTime: "6 min read" },
  { title: "How to Create a Budget",               description: "Step-by-step guide to building your first budget and sticking to it.",                         category: "Guide",   url: "https://www.consumerfinance.gov/an-essential-guide-to-building-an-emergency-fund/",              difficulty: "Beginner",     readTime: "4 min read" },
  { title: "Understanding Credit Scores",          description: "Learn what affects your credit score and how to improve it over time.",                        category: "Article", url: "https://www.myfico.com/credit-education/whats-in-your-credit-score",                             difficulty: "Intermediate", readTime: "5 min read" },
  { title: "Retirement Planning Calculator",       description: "Calculate how much you need to save for retirement based on your goals.",                      category: "Tool",    url: "https://www.nerdwallet.com/investing/retirement-calculator",                                    difficulty: "Intermediate", readTime: "Tool"       },
  { title: "Investing for Beginners",              description: "A comprehensive introduction to stocks, bonds, and index funds.",                              category: "Guide",   url: "https://www.investopedia.com/articles/basics/11/3-s-simple-investing.asp",                       difficulty: "Intermediate", readTime: "8 min read" },
  { title: "Building Wealth on Any Income",        description: "Proven strategies to grow your net worth regardless of salary size.",                         category: "Article", url: "https://www.investopedia.com/personal-finance/wealth-building-strategies/",                      difficulty: "Intermediate", readTime: "7 min read" },
  { title: "Student Loan Repayment Strategies",    description: "Smart ways to tackle student debt and save thousands in interest.",                            category: "Guide",   url: "https://studentaid.gov/manage-loans/repayment",                                                 difficulty: "Intermediate", readTime: "6 min read" },
];

const CATEGORIES = ["All Types", "Article", "Video", "Tool", "Guide"] as const;

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Video":  return <Video      className="h-5 w-5" style={{ color: "var(--castle-red)"    }} />;
    case "Tool":   return <Calculator className="h-5 w-5" style={{ color: "var(--safety-amber)"  }} />;
    case "Guide":  return <PenTool    className="h-5 w-5" style={{ color: "var(--engine-navy)"   }} />;
    default:       return <BookOpen   className="h-5 w-5" style={{ color: "var(--fortress-steel)" }} />;
  }
};

const difficultyStyle = (d: string): React.CSSProperties => {
  switch (d) {
    case "Beginner":     return { backgroundColor: "#F0FDF4", color: "var(--field-green)", border: "1px solid #BBF7D0" };
    case "Intermediate": return { backgroundColor: "#FFFBEB", color: "var(--safety-amber)", border: "1px solid #FDE68A" };
    case "Advanced":     return { backgroundColor: "#FEF2F2", color: "var(--castle-red)",  border: "1px solid #FECACA" };
    default:             return { backgroundColor: "var(--surface-raised)", color: "var(--fortress-steel)" };
  }
};

export function LiteraturePage() {
  const [resources, setResources]               = useState<Resource[]>([]);
  const [loading, setLoading]                   = useState(true);
  const [searchTerm, setSearchTerm]             = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All Types");
  const [seeding, setSeeding]                   = useState(false);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "literatureResources"));
      setResources(snap.docs.map(d => ({ id: d.id, ...d.data() } as Resource)));
    } catch (err) {
      console.error("Error fetching resources:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResources(); }, []);

  const handleSeedDatabase = async () => {
    setSeeding(true);
    try {
      for (const r of SAMPLE_RESOURCES) await addDoc(collection(db, "literatureResources"), r);
      await fetchResources();
    } catch (err) {
      console.error("Error seeding database:", err);
      alert("Failed to seed database.");
    } finally {
      setSeeding(false);
    }
  };

  const filteredResources = resources.filter(r => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
    const matchesCat    = selectedCategory === "All Types" || r.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Knowledge Hub
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--fortress-steel)" }}>
            Master your money with curated guides and tools.
          </p>
        </div>

        {/* Search */}
        <div
          className="flex items-center w-full md:w-72 rounded-md border overflow-hidden"
          style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-subtle)" }}
        >
          <div
            className="flex items-center justify-center w-9 h-9 flex-shrink-0 border-r"
            style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-subtle)" }}
          >
            <Search className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
          </div>
          <input
            type="text"
            placeholder="Search topics…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="flex-1 h-9 px-3 bg-transparent text-sm outline-none"
            style={{ color: "var(--text-primary)" }}
          />
        </div>
      </div>

      {/* ── Category tabs ────────────────────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map(cat => {
          const active = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap transition-all border"
              style={active
                ? { backgroundColor: "var(--engine-navy)", color: "#FFFFFF",              borderColor: "var(--engine-navy)" }
                : { backgroundColor: "var(--surface)",     color: "var(--fortress-steel)", borderColor: "var(--border-subtle)" }
              }
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* ── Loading skeletons ────────────────────────────────────────────────── */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="h-64 rounded-xl animate-pulse"
              style={{ backgroundColor: "var(--surface-raised)" }}
            />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────────── */}
      {!loading && (
        filteredResources.length === 0 ? (
          <div
            className="text-center py-16 rounded-xl border-2 border-dashed"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-raised)" }}
          >
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-20" style={{ color: "var(--fortress-steel)" }} />
            <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>No resources found</h3>
            <p className="text-sm mt-1 mb-6" style={{ color: "var(--text-muted)" }}>
              Your search did not match any articles.
            </p>
            {resources.length === 0 && (
              <Button
                variant="outline"
                onClick={handleSeedDatabase}
                disabled={seeding}
                className="font-bold gap-2"
                style={{ borderColor: "var(--border-subtle)", color: "var(--fortress-steel)" }}
              >
                <Database className="h-4 w-4" />
                {seeding ? "Seeding…" : "Seed Database with Updated Links"}
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map(resource => (
              <Card
                key={resource.id}
                className="flex flex-col group border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                style={{ backgroundColor: "var(--surface)", borderColor: "var(--border-subtle)" }}
              >
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    {/* Category icon */}
                    <div
                      className="p-2.5 rounded-lg border transition-all"
                      style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-subtle)" }}
                    >
                      {getCategoryIcon(resource.category)}
                    </div>

                    {/* Difficulty badge */}
                    <span
                      className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                      style={difficultyStyle(resource.difficulty)}
                    >
                      {resource.difficulty}
                    </span>
                  </div>

                  <CardTitle
                    className="mt-3 text-base font-bold leading-tight transition-colors"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {resource.title}
                  </CardTitle>
                  <CardDescription
                    className="line-clamp-2 mt-1 text-sm"
                    style={{ color: "var(--fortress-steel)" }}
                  >
                    {resource.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-grow" />

                <CardFooter
                  className="flex justify-between items-center border-t pt-3"
                  style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--surface-raised)" }}
                >
                  <span
                    className="text-xs font-medium flex items-center gap-1.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    {resource.readTime}
                  </span>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 font-bold gap-1.5 text-xs"
                    style={{ color: "var(--castle-red)" }}
                    asChild
                  >
                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
                      Open <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )
      )}
    </div>
  );
}