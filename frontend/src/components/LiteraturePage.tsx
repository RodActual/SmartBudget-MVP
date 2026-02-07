import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ExternalLink, Search, BookOpen, Video, PenTool, Calculator, FileText } from "lucide-react";

// Define the shape of a Resource
interface Resource {
  id: string;
  title: string;
  description: string;
  category: "Article" | "Video" | "Tool" | "Guide";
  url: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  readTime: string;
}

export function LiteraturePage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    const fetchResources = async () => {
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

    fetchResources();
  }, []);

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
      case "Beginner": return "bg-green-100 text-green-800";
      case "Intermediate": return "bg-yellow-100 text-yellow-800";
      case "Advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Learning Center</h1>
          <p className="text-gray-500 mt-1">Master your money with curated guides and tools.</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Search topics..." 
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {["All", "Article", "Video", "Tool", "Guide"].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              selectedCategory === cat 
                ? "bg-blue-600 text-white" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
            <Card key={i} className="h-48 animate-pulse bg-gray-50" />
          ))}
        </div>
      )}

      {/* Results Grid */}
      {!loading && filteredResources.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No resources found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <Card key={resource.id} className="flex flex-col hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-gray-50 rounded-lg">
                    {getCategoryIcon(resource.category)}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getDifficultyColor(resource.difficulty)}`}>
                    {resource.difficulty}
                  </span>
                </div>
                <CardTitle className="mt-4 text-xl line-clamp-2">{resource.title}</CardTitle>
                <CardDescription className="line-clamp-2 mt-2">
                  {resource.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-grow">
                {/* Spacer to push footer down */}
              </CardContent>

              <CardFooter className="flex justify-between items-center border-t pt-4">
                <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {resource.readTime}
                </span>
                <Button variant="outline" size="sm" asChild>
                  <a href={resource.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    Open <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}