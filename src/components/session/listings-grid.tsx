'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WithId, useFirebase } from "@/firebase";
import { Skeleton } from "../ui/skeleton";
import { ListingComments } from "./listing-comments";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { doc } from "firebase/firestore";
import { ListingVotes } from "./listing-votes";
import { EditListingDialog } from './edit-listing-dialog';

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
    const [editingListing, setEditingListing] = useState<WithId<Listing> | null>(null);
    
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-96" />
                <Skeleton className="h-96" />
                <Skeleton className="h-96" />
                <Skeleton className="h-96" />
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {listings.map((listing) => (
                <Card key={listing.id} className="flex flex-col overflow-hidden">
                    <div className="aspect-video bg-secondary flex items-center justify-center">
                        <p className="text-muted-foreground text-sm">Sin imagen</p>
                    </div>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-lg flex-1 pr-2">
                                <a href={listing.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1.5">
                                    {new URL(listing.url).hostname.replace('www.','')} <ExternalLink className="h-4 w-4" />
                                </a>
                            </CardTitle>
                            <div className='flex'>
                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary -mt-2 -mr-2" onClick={() => setEditingListing(listing)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive -mt-2 -mr-2" onClick={() => handleDelete(listing)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <CardDescription>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2 flex-wrap">
                               {listing.adjustmentFrequency && <span>Ajuste: <Badge variant="outline">{listing.adjustmentFrequency}</Badge></span>}
                               {listing.adjustmentIndex && <span>Índice: <Badge variant="outline">{listing.adjustmentIndex}</Badge></span>}
                               {listing.deposit && <span>Depósito: <Badge variant="outline">{listing.deposit}</Badge></span>}
                               {listing.agencyFee > 0 && <span>Inmobiliaria: <Badge variant="outline">${listing.agencyFee.toLocaleString('es-AR')}</Badge></span>}
                            </div>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-2xl font-bold">${(listing.rent + (listing.expenses || 0)).toLocaleString('es-AR')}</p>
                                <p className="text-sm text-muted-foreground">
                                    Alquiler: ${listing.rent.toLocaleString('es-AR')}
                                    {listing.expenses > 0 ? ` + Expensas: $${listing.expenses.toLocaleString('es-AR')}`: ''}
                                </p>
                            </div>
                            <Badge variant="secondary">Total Mensual</Badge>
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col items-start gap-4">
                        <ListingVotes listing={listing} />
                        <ListingComments listing={listing} />
                    </CardFooter>
                </Card>
            ))}
            </div>
             {editingListing && (
                <EditListingDialog 
                    listing={editingListing} 
                    isOpen={!!editingListing} 
                    onOpenChange={(isOpen) => {
                        if (!isOpen) {
                            setEditingListing(null);
                        }
                    }}
                />
            )}
        </div>
    );
}
