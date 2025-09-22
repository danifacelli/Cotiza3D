
"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { LOCAL_STORAGE_KEYS } from "@/lib/constants";
import type { Quote } from "@/lib/types";
import { QuoteForm } from "@/components/quotes/quote-form";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useEffect, useState } from "react";

export default function EditQuotePage() {
    const params = useParams();
    const { id } = params;
    const [quotes, _, isHydrated] = useLocalStorage<Quote[]>(LOCAL_STORAGE_KEYS.QUOTES, []);
    const [quote, setQuote] = useState<Quote | undefined>(undefined);

    useEffect(() => {
        if (isHydrated) {
            const foundQuote = quotes.find(q => q.id === id);
            
            // Backwards compatibility for old quotes
            if (foundQuote) {
                const updatedQuote: Quote = { ...foundQuote };

                // Handle legacy quotes without 'parts'
                if (!updatedQuote.parts && (updatedQuote as any).materialId) {
                    const legacyQuote = updatedQuote as any;
                    updatedQuote.parts = [{
                        id: 'default-part',
                        materialId: legacyQuote.materialId,
                        materialGrams: legacyQuote.materialGrams,
                    }];
                    delete (updatedQuote as any).materialId;
                    delete (updatedQuote as any).materialGrams;
                }

                // Handle legacy quotes without 'laborHours'
                if (updatedQuote.laborHours === undefined) {
                    updatedQuote.laborHours = updatedQuote.printHours;
                }

                // Handle legacy quotes without 'printTimeOfDay'
                if (updatedQuote.printTimeOfDay === undefined) {
                    updatedQuote.printTimeOfDay = 'day';
                }
                
                setQuote(updatedQuote);
            }
        }
    }, [id, quotes, isHydrated]);


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
