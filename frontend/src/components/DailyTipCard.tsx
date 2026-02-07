import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { 
  Lightbulb, 
  Clock, 
  PieChart, 
  Scissors, 
  GraduationCap, 
  Utensils, 
  Umbrella, 
  ShoppingBag, 
  Ban, 
  CreditCard, 
  PiggyBank 
} from "lucide-react";

// Define the shape of a Tip
interface FinancialTip {
  id: string;
  title: string;
  body: string;
  category: string;
  lucideIcon: string;
}

// Icon mapping: String from DB -> React Component
const iconMap: { [key: string]: any } = {
  "Clock": Clock,
  "PieChart": PieChart,
  "Scissors": Scissors,
  "GraduationCap": GraduationCap,
  "Utensils": Utensils,
  "Umbrella": Umbrella,
  "ShoppingBag": ShoppingBag,
  "Ban": Ban,
  "CreditCard": CreditCard,
  "PiggyBank": PiggyBank,
  // Default fallback
  "default": Lightbulb
};

export function DailyTipCard() {
  const [tip, setTip] = useState<FinancialTip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTips = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "financialTips"));
        const tipsList: FinancialTip[] = [];
        
        querySnapshot.forEach((doc) => {
          tipsList.push({ id: doc.id, ...doc.data() } as FinancialTip);
        });

        if (tipsList.length > 0) {
          // RANDOM SELECTION: Picks a new tip every time you refresh.
          // To make it sticky (same tip all day), we would use the date as a seed.
          const randomIndex = Math.floor(Math.random() * tipsList.length);
          setTip(tipsList[randomIndex]);
        }
      } catch (error) {
        console.error("Error fetching tips:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTips();
  }, []);

  if (loading) {
    return (
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 animate-pulse h-40">
        <CardContent className="flex items-center justify-center h-full text-blue-300">
          Loading Insight...
        </CardContent>
      </Card>
    );
  }

  if (!tip) return null;

  // Resolve the icon component
  const IconComponent = iconMap[tip.lucideIcon] || iconMap["default"];

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-blue-900 uppercase tracking-wider">
          Daily Insight
        </CardTitle>
        <IconComponent className="h-5 w-5 text-blue-600" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <h3 className="font-bold text-lg text-blue-950">{tip.title}</h3>
          <p className="text-sm text-blue-800 leading-relaxed">
            {tip.body}
          </p>
          <span className="inline-block px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-200 rounded-full mt-2">
            #{tip.category}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}