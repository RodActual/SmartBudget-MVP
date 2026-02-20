import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Lightbulb, Clock, PieChart, Scissors, GraduationCap,
  Utensils, Umbrella, ShoppingBag, Ban, CreditCard, PiggyBank,
} from "lucide-react";

interface FinancialTip {
  id: string;
  title: string;
  body: string;
  category: string;
  lucideIcon: string;
}

const iconMap: { [key: string]: any } = {
  Clock, PieChart, Scissors, GraduationCap, Utensils,
  Umbrella, ShoppingBag, Ban, CreditCard, PiggyBank,
  default: Lightbulb,
};

export function DailyTipCard() {
  const [tip, setTip]       = useState<FinancialTip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTips = async () => {
      try {
        const snap = await getDocs(collection(db, "financialTips"));
        const list: FinancialTip[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as FinancialTip));
        if (list.length > 0) {
          setTip(list[Math.floor(Math.random() * list.length)]);
        }
      } catch (err) {
        console.error("Error fetching tips:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTips();
  }, []);

  if (loading) {
    return (
      <Card
        className="animate-pulse h-40 border"
        style={{ backgroundColor: "var(--surface-raised)", borderColor: "var(--border-subtle)" }}
      >
        <CardContent className="flex items-center justify-center h-full">
          <span className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
            Loading insight…
          </span>
        </CardContent>
      </Card>
    );
  }

  if (!tip) return null;

  const IconComponent = iconMap[tip.lucideIcon] || iconMap["default"];

  return (
    <Card
      className="border shadow-sm hover:shadow-md transition-shadow"
      style={{
        background: "linear-gradient(135deg, #EFF6FF 0%, #EEF2FF 100%)",
        borderColor: "#BFDBFE",
      }}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: "var(--engine-navy)" }}
        >
          Daily Insight
        </CardTitle>
        <div
          className="p-1.5 rounded-md"
          style={{ backgroundColor: "rgba(255,255,255,0.7)" }}
        >
          <IconComponent className="h-4 w-4" style={{ color: "var(--engine-navy)" }} />
        </div>
      </CardHeader>
      <CardContent>
        <h3 className="font-bold text-base mb-1" style={{ color: "var(--engine-navy)" }}>
          {tip.title}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: "#1E3A5F" }}>
          {tip.body}
        </p>
        <span
          className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-full mt-3"
          style={{
            backgroundColor: "rgba(255,255,255,0.6)",
            color: "var(--engine-navy)",
            border: "1px solid #BFDBFE",
          }}
        >
          #{tip.category}
        </span>
      </CardContent>
    </Card>
  );
}