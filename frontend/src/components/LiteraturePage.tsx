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

// --- SAMPLE DATA FOR SEEDING ---
const SAMPLE_RESOURCES: Omit<Resource, "id">[] = [
  {
    title: "The 50/30/20 Rule Explained",
    description: "A simple framework to divide your income into Needs, Wants, and Savings.",
    category: "Article",
    url: "https://www.investopedia.com/ask/answers/022916/what-503020-rule.asp",
    difficulty: "Beginner",
    readTime: "3 min read"
  },
  {
    title: "Debt Snowball vs. Avalanche",
    description: "Two powerful strategies to eliminate debt. Which one fits your psychology?",
    category: "Guide",
    url: "https://www.nerdwallet.com/article/finance/debt-snowball-vs-debt-avalanche",
    difficulty: "Intermediate",
    readTime: "5 min read"
  },
  {
    title: "Compound Interest Calculator",
    description: "Visualize how your money can grow over time with the power of compound interest.",
    category: "Tool",
    url: "https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator",
    difficulty: "Beginner",
    readTime: "Tool"
  },
  {
    title: "Emergency Fund Basics",
    description: "Why you need a financial safety net and how much you should save.",
    category: "Video",
    url: "https://www.youtube.com/watch?v=qfAQT184o9g", // Placeholder
    difficulty: "Beginner",
    readTime: "10 min watch"
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
      alert("Database seeded successfully!");
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
        {["All", "Article", "Video", "Tool", "Guide"].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border ${
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
                       Seed Database with Sample Data
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