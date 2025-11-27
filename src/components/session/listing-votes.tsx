'use client';

import { useMemo } from 'react';
import { collection, query, where, doc } from 'firebase/firestore';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import {
  WithId,
  useCollection,
  useFirebase,
  useMemoFirebase,
  addDocumentNonBlocking,
  deleteDocumentNonBlocking,
  updateDocumentNonBlocking,
} from '@/firebase';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Vote {
  userId: string;
  value: 1 | -1;
  creationDate: string;
  listingId: string;
}

interface ListingVotesProps {
  listing: WithId<{ sessionId: string }>;
}

export function ListingVotes({ listing }: ListingVotesProps) {
  const { firestore, user } = useFirebase();

  const votesQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, `sessions/${listing.sessionId}/listings/${listing.id}/votes`))
        : null,
    [firestore, listing.sessionId, listing.id]
  );

  const { data: votes, isLoading: areVotesLoading } = useCollection<Vote>(votesQuery);

  const { upvotes, downvotes, userVote } = useMemo(() => {
    if (!votes) return { upvotes: 0, downvotes: 0, userVote: null };
    
    const upvotes = votes.filter((v) => v.value === 1).length;
    const downvotes = votes.filter((v) => v.value === -1).length;
    const userVote = user ? votes.find((v) => v.userId === user.uid) : null;

    return { upvotes, downvotes, userVote };
  }, [votes, user]);


  const handleVote = (value: 1 | -1) => {
    if (!firestore || !user || areVotesLoading) return;

    const votesCollection = collection(firestore, `sessions/${listing.sessionId}/listings/${listing.id}/votes`);

    if (userVote) {
      const voteRef = doc(firestore, `sessions/${listing.sessionId}/listings/${listing.id}/votes`, userVote.id);
      // If the user clicks the same button, remove their vote
      if (userVote.value === value) {
        deleteDocumentNonBlocking(voteRef);
      } else {
        // If they change their vote, update it
        updateDocumentNonBlocking(voteRef, { value });
      }
    } else {
      // If it's a new vote, add it
      addDocumentNonBlocking(votesCollection, {
        userId: user.uid,
        value,
        creationDate: new Date().toISOString(),
        listingId: listing.id,
      });
    }
  };
  
  return (
    <div className="flex justify-between w-full">
        <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleVote(1)} 
              disabled={!user || areVotesLoading}
              className={cn(userVote?.value === 1 && 'bg-primary/20 border-primary')}
            >
                <ThumbsUp className="h-4 w-4 mr-1" /> {upvotes}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleVote(-1)}
              disabled={!user || areVotesLoading}
              className={cn(userVote?.value === -1 && 'bg-destructive/20 border-destructive')}
            >
                <ThumbsDown className="h-4 w-4 mr-1" /> {downvotes}
            </Button>
        </div>
    </div>
  );
}
    