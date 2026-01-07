import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { Note } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://dilwkubfjhaydwcoenpl.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_5_CV-9z_P6q50F9pRE09nw_1n-6QIWq';

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

let realtimeChannel: RealtimeChannel | null = null;

export const subscribeToNotes = (callback: (notes: Note[]) => void) => {
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel);
  }

  realtimeChannel = supabase
    .channel('notes_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'notes' },
      async (payload) => {
        const { data } = await supabase.from('notes').select('*').order('created_at', { ascending: false });
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

export const getNotes = async (): Promise<Note[]> => {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
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

export const createNote = async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note | null> => {
  const { data, error } = await supabase
    .from('notes')
    .insert({
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

export const updateNote = async (note: Note): Promise<boolean> => {
  const { error } = await supabase
    .from('notes')
    .update({
      title: note.title,
      content: note.content,
      tags: note.tags,
      updated_at: new Date().toISOString()
    })
    .eq('id', note.id);

  if (error) {
    console.error('Error updating note:', error);
    return false;
  }

  return true;
};

export const deleteNote = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting note:', error);
    return false;
  }

  return true;
};

export const initDatabase = async (): Promise<boolean> => {
  const { error } = await supabase
    .from('notes')
    .select('id')
    .limit(1);

  if (error) {
    console.log('Notes table might not exist or is not accessible:', error.message);
    return false;
  }

  return true;
};
