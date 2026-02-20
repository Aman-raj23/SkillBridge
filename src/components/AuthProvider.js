'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext({ user: null, profile: null, loading: true });

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    async function fetchProfile(userId) {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        setProfile(data);
    }

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) fetchProfile(session.user.id);
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setProfile(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    async function signOut() {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
    }

    async function updateProfile(updates) {
        if (!user) return;
        const { data } = await supabase
            .from('profiles')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', user.id)
            .select()
            .single();
        if (data) setProfile(data);
        return data;
    }

    return (
        <AuthContext.Provider value={{ user, profile, loading, signOut, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
}
