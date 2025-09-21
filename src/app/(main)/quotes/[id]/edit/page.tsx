
"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { LOCAL_STORAGE_KEYS } from "@/lib/constants";
import type { Quote } from "@/lib/types";
import { QuoteForm } from "@/components/quotes/quote-form";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function EditQuotePage() {
    const params = useParams();
    const { id } = params;
    const [quotes, _, isHydrated] = useLocalStorage<Quote[]>(LOCAL_STORAGE_KEYS.QUOTES, []);
    
    const quote = quotes.find(q => q.id === id);

    if (!isHydrated) {
        return (
            <div className="grid gap-6">
                <Card>
                    <CardHeader><Skeleton className="h-8 w-48" /></CardHeader>
                    <CardContent><Skeleton className="h-96 w-full" /></CardContent>
                </Card>
            </div>
        )
    }

    if (!quote) {
        return <div className="text-center py-10">Presupuesto no encontrado.</div>;
    }

    return <QuoteForm quote={quote} />;
}
