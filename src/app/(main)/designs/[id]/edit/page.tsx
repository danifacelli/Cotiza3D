
"use client";

import { useLocalStorage } from "@/hooks/use-local-storage";
import { LOCAL_STORAGE_KEYS } from "@/lib/constants";
import type { Design } from "@/lib/types";
import { DesignForm } from "@/components/designs/design-form";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useMemo } from "react";

export default function EditDesignPage() {
    const params = useParams();
    const { id } = params;
    const [designs, _, isHydrated] = useLocalStorage<Design[]>(LOCAL_STORAGE_KEYS.DESIGNS, []);

    const initialDesign = useMemo(() => {
        if (!isHydrated) return null; // Wait for hydration

        const foundDesign = designs.find(d => d.id === id);
        if (!foundDesign) return undefined; // Use undefined to signify not found after hydration
        
        return foundDesign;

    }, [id, designs, isHydrated]);


    if (!isHydrated || initialDesign === null) {
        return (
            <div className="grid gap-6">
                <Card>
                    <CardHeader><Skeleton className="h-8 w-48" /></CardHeader>
                    <CardContent><Skeleton className="h-96 w-full" /></CardContent>
                </Card>
            </div>
        )
    }

    if (initialDesign === undefined) {
        return <div className="text-center py-10">Diseño no encontrado.</div>;
    }

    return <DesignForm design={initialDesign} />;
}
