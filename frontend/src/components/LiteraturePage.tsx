import { useState, useEffect } from "react";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { ExternalLink, Search, BookOpen, Video, PenTool, Calculator, FileText, Database } from "lucide-react";

// Define the shape of a Resource
interface Resource {
  id?: string;
  title: string;
  description: string;
  category: "Article" | "Video" | "Tool" | "Guide";
  url: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  readTime: string;
}

// Icon mapping: String from DB -> React Component
const iconMap: { [key: string]: any } = {
  "Clock": BookOpen,
  "PieChart": BookOpen,
  "Scissors": BookOpen,
  "GraduationCap": BookOpen,
  "Utensils": BookOpen,
  "Umbrella": BookOpen,
  "ShoppingBag": BookOpen,
  "Ban": BookOpen,
  "CreditCard": BookOpen,
  "PiggyBank": BookOpen,
  // Default fallback
  "default": BookOpen
};

// --- UPDATED SAMPLE DATA WITH WORKING LINKS ---
const SAMPLE_RESOURCES: Omit<Resource, "id">[] = [
  {
    title: "The 50/30/20 Rule Explained",
    description: "A simple framework to divide your income into Needs, Wants, and Savings.",
    category: "Article",
    url: "https://www.investopedia.com/financial-edge/0712/the-50-30-20-rule-of-thumb-for-budgets.aspx",
    difficulty: "Beginner",
    readTime: "3 min read"
  },
  {
    title: "Debt Snowball vs. Avalanche",
    description: "Two powerful strategies to eliminate debt. Which one fits your psychology?",
    category: "Guide",
    url: "https://www.ramseysolutions.com/debt/debt-snowball-vs-debt-avalanche",
    difficulty: "Intermediate",
    readTime: "5 min read"
  },
  {
    title: "Compound Interest Calculator",
    description: "Visualize how your money can grow over time with the power of compound interest.",
    category: "Tool",
    url: "https://www.calculator.net/compound-interest-calculator.html",
    difficulty: "Beginner",
    readTime: "Tool"
  },
  {
    title: "Emergency Fund Basics",
    description: "Why you need a financial safety net and how much you should save.",
    category: "Article",
    url: "https://www.nerdwallet.com/article/banking/emergency-fund-why-it-matters",
    difficulty: "Beginner",
    readTime: "6 min read"
  },
  {
    title: "How to Create a Budget",
    description: "Step-by-step guide to building your first budget and sticking to it.",
    category: "Guide",
    url: "https://www.consumerfinance.gov/an-essential-guide-to-building-an-emergency-fund/",
    difficulty: "Beginner",
    readTime: "4 min read"
  },
  {
    title: "Understanding Credit Scores",
    description: "Learn what affects your credit score and how to improve it over time.",
    category: "Article",
    url: "https://www.myfico.com/credit-education/whats-in-your-credit-score",
    difficulty: "Intermediate",
    readTime: "5 min read"
  },
  {
    title: "Retirement Planning Calculator",
    description: "Calculate how much you need to save for retirement based on your goals.",
    category: "Tool",
    url: "https://www.nerdwallet.com/investing/retirement-calculator",
    difficulty: "Intermediate",
    readTime: "Tool"
  },
  {
    title: "Investing for Beginners",
    description: "A comprehensive introduction to stocks, bonds, and index funds.",
    category: "Guide",
    url: "https://www.investopedia.com/articles/basics/11/3-s-simple-investing.asp",
    difficulty: "Intermediate",
    readTime: "8 min read"
  },
  {
    title: "Building Wealth on Any Income",
    description: "Proven strategies to grow your net worth regardless of salary size.",
    category: "Article",
    url: "https://www.investopedia.com/personal-finance/wealth-building-strategies/",
    difficulty: "Intermediate",
    readTime: "7 min read"
  },
  {
    title: "Student Loan Repayment Strategies",
    description: "Smart ways to tackle student debt and save thousands in interest.",
    category: "Guide",
    url: "https://studentaid.gov/manage-loans/repayment",
    difficulty: "Intermediate",
    readTime: "6 min read"
  }
];

export function LiteraturePage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [seeding, setSeeding] = useState(false);

  // Fetch Resources from Firestore
  const fetchResources = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "literatureResources"));
      const resourceList: Resource[] = [];
      
      querySnapshot.forEach((doc) => {
        resourceList.push({ id: doc.id, ...doc.data() } as Resource);
      });

      setResources(resourceList);
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  // Seed Database Function (Temporary Utility)
  const handleSeedDatabase = async () => {
    setSeeding(true);
    try {
      for (const resource of SAMPLE_RESOURCES) {
        await addDoc(collection(db, "literatureResources"), resource);
      }
      await fetchResources(); // Refresh list
      alert("Database seeded successfully with updated working links!");
    } catch (error) {
      console.error("Error seeding database:", error);
      alert("Failed to seed database.");
    } finally {
      setSeeding(false);
    }
  };

  // Filter Logic
  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || resource.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Helper to get icon based on category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Video": return <Video className="h-5 w-5 text-red-500" />;
      case "Tool": return <Calculator className="h-5 w-5 text-orange-500" />;
      case "Guide": return <PenTool className="h-5 w-5 text-purple-500" />;
      default: return <BookOpen className="h-5 w-5 text-blue-500" />;
    }
  };

  // Helper for Difficulty Color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-100 text-green-800 border-green-200";
      case "Intermediate": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Advanced": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Knowledge Hub</h1>
          <p className="text-gray-500 mt-1">Master your money with curated guides and tools.</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Search topics..." 
            className="pl-9 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {["All Types", "Article", "Video", "Tool", "Guide"].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 rounded-full text-lg font-medium transition-all  border ${
              selectedCategory === cat 
                ? "bg-slate-900 text-white border-slate-900 shadow-sm" 
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-64 animate-pulse bg-gray-50 border-0" />
          ))}
        </div>
      )}

      {/* Results Grid */}
      {!loading && (
        <>
          {filteredResources.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No resources found</h3>
              <p className="text-gray-500 mt-1 mb-6">Your search did not match any articles.</p>
              
              {/* Seed Button - Only shows if database is completely empty */}
              {resources.length === 0 && (
                 <Button onClick={handleSeedDatabase} disabled={seeding} variant="outline">
                   {seeding ? "Seeding..." : (
                     <>
                       <Database className="mr-2 h-4 w-4" />
                       Seed Database with Updated Links
                     </>
                   )}
                 </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <Card key={resource.id} className="flex flex-col hover:shadow-lg transition-all duration-300 border-gray-200 group">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <div className={`p-2.5 rounded-lg bg-gray-50 group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-gray-100`}>
                        {getCategoryIcon(resource.category)}
                      </div>
                      <Badge variant="outline" className={`${getDifficultyColor(resource.difficulty)}`}>
                        {resource.difficulty}
                      </Badge>
                    </div>
                    <CardTitle className="mt-3 text-lg font-bold leading-tight group-hover:text-blue-600 transition-colors">
                        {resource.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 mt-2 text-sm">
                      {resource.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="flex-grow">
                    {/* Spacer to push footer down */}
                  </CardContent>

                  <CardFooter className="flex justify-between items-center border-t pt-4 bg-gray-50/50">
                    <span className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" />
                      {resource.readTime}
                    </span>
                    <Button variant="ghost" size="sm" className="h-8 hover:bg-white hover:shadow-sm" asChild>
                      <a href={resource.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                        Open <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}