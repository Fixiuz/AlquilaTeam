'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ThumbsUp, ThumbsDown, MessageCircle, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WithId } from "@/firebase";
import { Skeleton } from "../ui/skeleton";

interface Listing {
    url: string;
    rent: number;
    expenses?: number;
}

interface ListingsGridProps {
    listings: WithId<Listing>[];
    isLoading: boolean;
}

export function ListingsGrid({ listings, isLoading }: ListingsGridProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-48" />
                <Skeleton className="h-48" />
                <Skeleton className="h-48" />
                <Skeleton className="h-48" />
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
  
    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">Propiedades</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {listings.map((listing) => (
                <Card key={listing.id}>
                <CardHeader>
                    <CardTitle className="text-lg truncate">{listing.url}</CardTitle>
                    <CardDescription>
                        <a href={listing.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                            Ver publicación <ExternalLink className="h-4 w-4" />
                        </a>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-xl font-bold">${(listing.rent + (listing.expenses || 0)).toLocaleString('es-AR')}</p>
                            <p className="text-sm text-muted-foreground">
                                Alquiler: ${listing.rent.toLocaleString('es-AR')}
                                {listing.expenses ? ` + Expensas: $${listing.expenses.toLocaleString('es-AR')}`: ''}
                            </p>
                        </div>
                        <Badge variant="secondary">Total</Badge>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm"><ThumbsUp className="h-4 w-4 mr-1" /> 0</Button>
                        <Button variant="outline" size="sm"><ThumbsDown className="h-4 w-4 mr-1" /> 0</Button>
                        <Button variant="outline" size="sm"><MessageCircle className="h-4 w-4 mr-1" /> 0</Button>
                    </div>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </CardFooter>
                </Card>
            ))}
            </div>
        </div>
    );
}
