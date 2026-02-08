// AdminBadge.tsx
// Shows admin status badge in the header
import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { Badge } from "../ui/badge";
import { Shield } from "lucide-react";

export function AdminBadge() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const idTokenResult = await user.getIdTokenResult();
          setIsAdmin(!!idTokenResult.claims.admin);
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        }
      }
      setLoading(false);
    };

    checkAdminStatus();
  }, []);

  if (loading || !isAdmin) return null;

  return (
    <Badge className="bg-red-600 text-white border-red-700 shadow-sm">
      <Shield className="h-3 w-3 mr-1" />
      Admin
    </Badge>
  );
}

// Hook to use admin status in other components
export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const idTokenResult = await user.getIdTokenResult();
          setIsAdmin(!!idTokenResult.claims.admin);
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        }
      }
      setLoading(false);
    };

    checkAdminStatus();
  }, []);

  return { isAdmin, loading };
}