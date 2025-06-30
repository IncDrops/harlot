
"use client";

import { useState, useEffect } from 'react';
import type { User } from '@/lib/types';
import { getUserById } from '@/lib/firebase';

const userCache = new Map<string, User>();

export function useUser(userId: string | undefined) {
    const [user, setUser] = useState<User | null>(userCache.get(userId || '') || null);
    const [loading, setLoading] = useState(!user && !!userId);

    useEffect(() => {
        if (!userId) {
            setUser(null);
            setLoading(false);
            return;
        }

        if (userCache.has(userId)) {
            setUser(userCache.get(userId)!);
            setLoading(false);
            return;
        }

        let isMounted = true;
        setLoading(true);

        getUserById(userId)
            .then(fetchedUser => {
                if (isMounted) {
                    if (fetchedUser) {
                        userCache.set(userId, fetchedUser);
                        setUser(fetchedUser);
                    }
                    setLoading(false);
                }
            })
            .catch(() => {
                if(isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [userId]);

    return { user, loading };
}
