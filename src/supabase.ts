import { createClient, SupabaseClient, RealtimeChannel, User, Session } from '@supabase/supabase-js';
import { Note } from './types';

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://dilwkubfjhaydwcoenpl.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_5_CV-9z_P6q50F9pRE09nw_1n-6QIWq';

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// AUTH FUNCTIONS
// ============================================

export const signUp = async (email: string, password: string, displayName?: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName || email.split('@')[0]
      }
    }
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  });
  return { error };
};

export const updatePassword = async (newPassword: string) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  });
  return { data, error };
};

export const getSession = async (): Promise<Session | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

export const getUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const onAuthStateChange = (callback: (event: string, session: Session | null) => void) => {
  return supabase.auth.onAuthStateChange(callback);
};

// ============================================
// PROFILE FUNCTIONS
// ============================================

export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  
  return data;
};

export const updateProfile = async (userId: string, updates: Partial<Profile>): Promise<boolean> => {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  
  if (error) {
    console.error('Error updating profile:', error);
    return false;
  }
  
  return true;
};

// ============================================
// NOTES FUNCTIONS (user-specific)
// ============================================

let realtimeChannel: RealtimeChannel | null = null;

export const subscribeToNotes = (userId: string, callback: (notes: Note[]) => void) => {
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel);
  }

  realtimeChannel = supabase
    .channel('notes_changes')
    .on(
      'postgres_changes',
      { 
        event: '*', 
        schema: 'public', 
        table: 'notes',
        filter: `user_id=eq.${userId}`
      },
      async (payload) => {
        const { data } = await supabase
          .from('notes')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        
        if (data) {
          const notes: Note[] = data.map((note: any) => ({
            id: note.id,
            title: note.title,
            content: note.content,
            createdAt: new Date(note.created_at).getTime(),
            updatedAt: new Date(note.updated_at).getTime(),
            tags: note.tags || []
          }));
          callback(notes);
        }
      }
    )
    .subscribe();

  return () => {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
      realtimeChannel = null;
    }
  };
};

export const getNotes = async (userId: string): Promise<Note[]> => {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notes:', error);
    return [];
  }

  return data.map((note: any) => ({
    id: note.id,
    title: note.title,
    content: note.content,
    createdAt: new Date(note.created_at).getTime(),
    updatedAt: new Date(note.updated_at).getTime(),
    tags: note.tags || []
  }));
};

export const createNote = async (userId: string, note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note | null> => {
  const { data, error } = await supabase
    .from('notes')
    .insert({
      user_id: userId,
      title: note.title,
      content: note.content,
      tags: note.tags
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating note:', error);
    return null;
  }

  return {
    id: data.id,
    title: data.title,
    content: data.content,
    createdAt: new Date(data.created_at).getTime(),
    updatedAt: new Date(data.updated_at).getTime(),
    tags: data.tags || []
  };
};

export const updateNote = async (note: Note, userId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('notes')
    .update({
      title: note.title,
      content: note.content,
      tags: note.tags,
      updated_at: new Date().toISOString()
    })
    .eq('id', note.id)
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating note:', error);
    return false;
  }

  return true;
};

export const deleteNote = async (noteId: string, userId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting note:', error);
    return false;
  }

  return true;
};

export const initDatabase = async (userId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('notes')
    .select('id')
    .eq('user_id', userId)
    .limit(1);

  if (error) {
    console.log('Database not accessible or notes table missing:', error.message);
    return false;
  }

  return true;
};
