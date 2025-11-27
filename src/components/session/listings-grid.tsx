'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ThumbsUp, ThumbsDown, ExternalLink, Trash2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WithId, useFirebase } from "@/firebase";
import { Skeleton } from "../ui/skeleton";
import { ListingComments } from "./listing-comments";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { doc } from "firebase/firestore";

interface Listing {
    sessionId: string;
    url: string;
    rent: number;
    expenses?: number;
    agencyFee?: number;
    deposit?: string;
    adjustmentFrequency?: 'trimestral' | 'cuatrimestral' | 'semestral';
    adjustmentIndex?: 'IPC' | 'ICL';
}

interface ListingsGridProps {
    listings: WithId<Listing>[];
    isLoading: boolean;
}

export function ListingsGrid({ listings, isLoading }: ListingsGridProps) {
    const { firestore } = useFirebase();
    
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-64" />
                <Skeleton className="h-64" />
                <Skeleton className="h-64" />
                <Skeleton className="h-64" />
            </div>
        )
    }

    if (listings.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-12">
                <p>Todavía no hay propiedades en esta sesión.</p>
                <p>¡Agregá la primera!</p>
            </div>
        )
    }

    const handleDelete = (listing: WithId<Listing>) => {
        if (!firestore) return;
        const listingRef = doc(firestore, `sessions/${listing.sessionId}/listings`, listing.id);
        deleteDocumentNonBlocking(listingRef);
    }
  
    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">Propiedades</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {listings.map((listing) => (
                <Card key={listing.id} className="flex flex-col">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-lg truncate flex-1 pr-2">
                                <a href={listing.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                                    {listing.url} <ExternalLink className="h-4 w-4" />
                                </a>
                            </CardTitle>
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive -mt-2 -mr-2" onClick={() => handleDelete(listing)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        <CardDescription>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2 flex-wrap">
                               {listing.adjustmentFrequency && <span>Ajuste: <Badge variant="outline">{listing.adjustmentFrequency}</Badge></span>}
                               {listing.adjustmentIndex && <span>Índice: <Badge variant="outline">{listing.adjustmentIndex}</Badge></span>}
                               {listing.deposit && <span>Depósito: <Badge variant="outline">{listing.deposit}</Badge></span>}
                               {listing.agencyFee && <span>Inmobiliaria: <Badge variant="outline">${listing.agencyFee.toLocaleString('es-AR')}</Badge></span>}
                            </div>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-2xl font-bold">${(listing.rent + (listing.expenses || 0)).toLocaleString('es-AR')}</p>
                                <p className="text-sm text-muted-foreground">
                                    Alquiler: ${listing.rent.toLocaleString('es-AR')}
                                    {listing.expenses ? ` + Expensas: $${listing.expenses.toLocaleString('es-AR')}`: ''}
                                </p>
                            </div>
                            <Badge variant="secondary">Total Mensual</Badge>
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col items-start gap-4">
                        <div className="flex justify-between w-full">
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm"><ThumbsUp className="h-4 w-4 mr-1" /> 0</Button>
                                <Button variant="outline" size="sm"><ThumbsDown className="h-4 w-4 mr-1" /> 0</Button>
                            </div>
                        </div>
                        <ListingComments listing={listing} />
                    </CardFooter>
                </Card>
            ))}
            </div>
        </div>
    );
}
    