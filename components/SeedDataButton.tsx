"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Database, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SeedDataButton() {
  const [isSeeding, setIsSeeding] = useState(false);
  const router = useRouter();

  const handleSeed = async () => {
    const confirmed = window.confirm(
      "This will DELETE all your current expenses and goals, then load demo data. Continue?"
    );
    if (!confirmed) return;

    setIsSeeding(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      
      if (data.success) {
        toast.success("Demo data loaded! Refreshing...");
        router.refresh();
      } else {
        toast.error(data.error || "Failed to seed data");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      className="rounded-full shadow-sm text-xs h-8"
      onClick={handleSeed}
      disabled={isSeeding}
      title="Replaces all expenses and goals with sample data"
    >
      {isSeeding ? (
        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
      ) : (
        <Database className="w-3 h-3 mr-2" />
      )}
      Load Demo Data
    </Button>
  );
}
