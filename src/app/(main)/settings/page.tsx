
"use client"
import { useLocalStorage } from "@/hooks/use-local-storage";
import { LOCAL_STORAGE_KEYS } from "@/lib/constants";
import { DEFAULT_SETTINGS } from "@/lib/defaults";
import { SettingsForm, SettingsSchema } from "@/components/settings/settings-form";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { Settings } from "@/lib/types";
import { BackupRestore } from "@/components/settings/backup-restore";

export default function SettingsPage() {
    const [settings, setSettings, isHydrated] = useLocalStorage<Settings>(LOCAL_STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    const { toast } = useToast();

    const handleSaveChanges = (data: Settings) => {
        setSettings(data);
        toast({
            title: "Guardado",
            description: "La configuración ha sido guardada.",
        });
    };

    const renderForm = () => (
         <Card>
            <CardHeader>
                <CardTitle>Configuración General</CardTitle>
                <CardDescription>
                    Ajusta los parámetros globales de la aplicación. Estos valores se usarán para todos los cálculos de presupuestos.
                </CardDescription>
            </CardHeader>
            <CardContent>
               {isHydrated && settings ? (
                    <SettingsForm
                        defaultValues={settings}
                        onSave={handleSaveChanges}
                    />
                ) : <p>Cargando configuración...</p>}
            </CardContent>
        </Card>
    );

    const renderSkeleton = () => (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            {isHydrated ? renderForm() : renderSkeleton()}
            
            <Card>
                <CardHeader>
                    <CardTitle>Copia de Seguridad y Restauración</CardTitle>
                    <CardDescription>
                        Exporta todos tus datos a un archivo JSON o importa un respaldo para restaurar tu información.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <BackupRestore />
                </CardContent>
            </Card>
        </div>
    );
}
