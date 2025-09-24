
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
            
            if (foundQuote) {
                const updatedQuote: Quote = { ...foundQuote };
                
                // Backwards compatibility for old quotes without 'parts'
                if (!updatedQuote.parts) {
                    updatedQuote.parts = [];
                }
                
                // Handle legacy quotes with direct material/grams
                const legacyQuote = updatedQuote as any;
                if (legacyQuote.materialId && legacyQuote.materialGrams) {
                     if (updatedQuote.parts.length === 0) {
                        updatedQuote.parts.push({
                            id: 'default-part',
                            materialId: legacyQuote.materialId,
                            materialGrams: legacyQuote.materialGrams,
                        });
                     }
                    delete legacyQuote.materialId;
                    delete legacyQuote.materialGrams;
                }
                
                // Handle legacy dimension fields being on the parts
                if (updatedQuote.parts[0] && (updatedQuote.parts[0] as any).width) {
                    const firstPart = (updatedQuote.parts[0] as any);
                    if (!updatedQuote.width) updatedQuote.width = firstPart.width;
                    if (!updatedQuote.height) updatedQuote.height = firstPart.height;
                    if (!updatedQuote.depth) updatedQuote.depth = firstPart.depth;

                    updatedQuote.parts.forEach(p => {
                        delete (p as any).width;
                        delete (p as any).height;
                        delete (p as any).depth;
                    })
                }


                // Handle other legacy fields
                if (updatedQuote.laborHours === undefined) {
                    updatedQuote.laborHours = updatedQuote.printHours;
                }
                if (updatedQuote.tariffType === undefined) {
                    updatedQuote.tariffType = 'off-peak';
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
