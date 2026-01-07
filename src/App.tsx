import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  BookOpen, 
  PenTool, 
  Menu, 
  Plus, 
  Trash2, 
  ChevronLeft,
  Search,
  X,
  PanelRight,
  Image as ImageIcon,
  Calendar,
  Type,
  Clock,
  Cloud,
  CloudOff,
  CloudFog,
  User,
  LogOut
} from 'lucide-react';
import { Note, AppState } from './types';
import Editor, { EditorHandle } from './components/Editor';
import Preview from './components/Preview';
import { 
  getNotes, 
  createNote as supabaseCreateNote, 
  updateNote as supabaseUpdateNote, 
  deleteNote as supabaseDeleteNote,
  subscribeToNotes,
  initDatabase,
  SyncStatus
} from './supabase';
import { useAuth } from './auth/AuthContext';

const STORAGE_KEY = 'lumen_notes_v2';

const loadNotes = (): Note[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

const saveNotes = (notes: Note[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
};

const DEFAULT_NOTE: Note = {
  id: 'init-001',
  title: 'On the Nature of Thought',
  content: `# On the Nature of Thought

Writing is not merely a method of recording; it is a method of thinking. When we structure our ideas on a page, we give them form and permanence.

## Structural Analysis
Complex systems often require visualization to be fully understood. 

\`\`\`mermaid
graph LR
    A[Chaos] -->|Ordering| B(Structure)
    B -->|Refinement| C{Clarity}
    C -->|Yes| D[Insight]
    C -->|No| E[Revision]
\`\`\`

## Mathematical Beauty
The relationship between energy and matter is elegant in its simplicity, yet profound in its implication:

$$
E = mc^2
$$

But consider the wave equation:

$$
\\frac{\\partial^2 u}{\\partial t^2} = c^2 \\nabla^2 u
$$

This surface is designed for this kind of work. Quiet. Powerful.
`,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  tags: ['philosophy']
};

export default function App() {
  const { user, signOut, profile } = useAuth();
  const [appState, setAppState] = useState<AppState>(AppState.BOOTING);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('syncing');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const [history, setHistory] = useState<string[]>([]);
  const [mode, setMode] = useState<'write' | 'read'>('read');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<EditorHandle>(null);

  const stateRef = useRef({ notes, activeNoteId, sidebarOpen, mode, history, syncStatus });
  useEffect(() => {
    stateRef.current = { notes, activeNoteId, sidebarOpen, mode, history, syncStatus };
  }, [notes, activeNoteId, sidebarOpen, mode, history, syncStatus]);

  const SyncIcon = () => {
    switch (syncStatus) {
      case 'synced':
        return <Cloud size={14} className="text-emerald-600" />;
      case 'syncing':
        return <CloudFog size={14} className="text-amber-600 animate-pulse" />;
      case 'offline':
        return <CloudOff size={14} className="text-gray-400" />;
      case 'error':
        return <CloudOff size={14} className="text-red-500" />;
      default:
        return <Cloud size={14} />;
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      if (!user) {
        setAppState(AppState.READY);
        return;
      }
      
      setSyncStatus('syncing');
      
      const dbReady = await initDatabase(user.id);
      
      if (!dbReady) {
        console.log('Supabase not available, using local storage fallback');
      }

      try {
        const dbNotes = await getNotes(user.id);
        
        if (dbNotes.length === 0) {
          const localNotes = await loadNotes();
          if (localNotes.length === 0) {
            const newNote: Note = {
              id: 'init-001',
              title: 'On the Nature of Thought',
              content: DEFAULT_NOTE.content,
              createdAt: Date.now(),
              updatedAt: Date.now(),
              tags: ['philosophy']
            };
            
            if (dbReady) {
              const created = await supabaseCreateNote(user.id, { title: newNote.title, content: newNote.content, tags: newNote.tags });
              if (created) {
                setNotes([created]);
                setActiveNoteId(created.id);
                setHistory([created.id]);
              } else {
                setNotes([newNote]);
                setActiveNoteId(newNote.id);
                setHistory([newNote.id]);
                saveNotes([newNote]);
              }
            } else {
              setNotes([newNote]);
              setActiveNoteId(newNote.id);
              setHistory([newNote.id]);
              saveNotes([newNote]);
            }
          } else {
            setNotes(localNotes);
            setActiveNoteId(localNotes[0].id);
            setHistory([localNotes[0].id]);
            saveNotes(localNotes);
          }
        } else {
          setNotes(dbNotes);
          setActiveNoteId(dbNotes[0].id);
          setHistory([dbNotes[0].id]);
          saveNotes(dbNotes);
        }
        
        setSyncStatus('synced');
      } catch (error) {
        console.error('Failed to load notes:', error);
        setSyncStatus('error');
        
        const localNotes = await loadNotes();
        if (localNotes.length > 0) {
          setNotes(localNotes);
          setActiveNoteId(localNotes[0].id);
          setHistory([localNotes[0].id]);
        }
      }
      
      setAppState(AppState.READY);
    };

    initializeApp();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = subscribeToNotes(user.id, (updatedNotes) => {
      if (updatedNotes.length > 0) {
        setNotes(updatedNotes);
        saveNotes(updatedNotes);
        setSyncStatus('synced');
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    if (appState === AppState.READY) {
      saveNotes(notes);
    }
  }, [notes, appState]);

  useEffect(() => {
    if (activeNoteId && sidebarOpen) {
      const timer = setTimeout(() => {
        const el = document.getElementById(`note-item-${activeNoteId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [activeNoteId, sidebarOpen, searchQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { notes, activeNoteId, sidebarOpen } = stateRef.current;
      const meta = e.metaKey || e.ctrlKey;

      if (meta && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        const newNote: Note = {
          id: `note-${Date.now()}`,
          title: 'Untitled Entry',
          content: '',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          tags: []
        };
        setNotes([newNote, ...notes]);
        setActiveNoteId(newNote.id);
        setHistory(h => [...h, newNote.id]);
        setMode('write');
      }

      if (meta && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setMode('write');
      }

      if (meta && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setMode('read');
      }

      if (meta && e.key === '\\') {
        e.preventDefault();
        setSidebarOpen(!sidebarOpen);
      }
      
      if (meta && e.key === '.') {
        e.preventDefault();
        setRightSidebarOpen(prev => !prev);
      }

      if (meta && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (!sidebarOpen) setSidebarOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }

      if (e.key === 'Escape') {
        setNoteToDelete(null);
        setShowProfileMenu(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeNote = useMemo(() => 
    notes.find(n => n.id === activeNoteId) || null
  , [notes, activeNoteId]);

  const stats = useMemo(() => {
    if (!activeNote) return { words: 0, chars: 0 };
    const text = activeNote.content.trim();
    return {
      chars: text.length,
      words: text ? text.split(/\s+/).length : 0
    };
  }, [activeNote]);

  const handleNavigate = (id: string) => {
    if (id === activeNoteId) return;
    setHistory(prev => [...prev, id]);
    setActiveNoteId(id);
  };

  const handleBack = () => {
    if (history.length <= 1) return;
    const newHistory = history.slice(0, -1);
    const prevId = newHistory[newHistory.length - 1];
    setHistory(newHistory);
    setActiveNoteId(prevId);
  };

  const handleUpdateNote = useCallback(async (content: string) => {
    if (!activeNoteId || !user) return;
    
    setSyncStatus('syncing');
    
    const updatedNotes = notes.map(n => 
      n.id === activeNoteId 
        ? { ...n, content, updatedAt: Date.now() } 
        : n
    );
    
    setNotes(updatedNotes);
    
    const activeNote = updatedNotes.find(n => n.id === activeNoteId);
    if (activeNote) {
      const success = await supabaseUpdateNote(activeNote, user.id);
      if (success) {
        setSyncStatus('synced');
      } else {
        setSyncStatus('error');
      }
    }
  }, [notes, activeNoteId, user]);

  const handleUpdateTitle = useCallback(async (title: string) => {
    if (!activeNoteId || !user) return;
    
    setSyncStatus('syncing');
    
    const updatedNotes = notes.map(n => 
      n.id === activeNoteId 
        ? { ...n, title, updatedAt: Date.now() } 
        : n
    );
    
    setNotes(updatedNotes);
    
    const activeNote = updatedNotes.find(n => n.id === activeNoteId);
    if (activeNote) {
      const success = await supabaseUpdateNote(activeNote, user.id);
      if (success) {
        setSyncStatus('synced');
      } else {
        setSyncStatus('error');
      }
    }
  }, [notes, activeNoteId, user]);

  const handleCreateNote = async () => {
    if (!user) return;
    
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: 'Untitled Entry',
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: []
    };
    
    setSyncStatus('syncing');
    
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
    setHistory(h => [...h, newNote.id]);
    setMode('write');
    
    const created = await supabaseCreateNote(user.id, { title: newNote.title, content: newNote.content, tags: newNote.tags });
    if (created) {
      setNotes(prev => prev.map(n => n.id === newNote.id ? created : n));
      setSyncStatus('synced');
    } else {
      setSyncStatus('error');
    }
  };

  const handleInsertImage = () => {
    const url = window.prompt("Enter Image URL:");
    if (url && activeNote) {
      const imageMarkdown = `\n![Image Description](${url})\n`;
      
      if (mode !== 'write') {
        handleUpdateNote(activeNote.content + imageMarkdown);
        setMode('write');
      } else {
        if (editorRef.current) {
          editorRef.current.insertAtCursor(imageMarkdown);
        } else {
          handleUpdateNote(activeNote.content + imageMarkdown);
        }
      }
    }
  };

  const requestDeleteNote = (id: string) => {
    setNoteToDelete(id);
  };

  const executeDelete = async () => {
    if (!noteToDelete || !user) return;
    
    setSyncStatus('syncing');
    
    const success = await supabaseDeleteNote(noteToDelete, user.id);
    
    const newNotes = notes.filter(n => n.id !== noteToDelete);
    setNotes(newNotes);
    
    if (activeNoteId === noteToDelete) {
      setActiveNoteId(newNotes.length > 0 ? newNotes[0].id : null);
    }
    setNoteToDelete(null);
    setRightSidebarOpen(false);
    
    if (success) {
      setSyncStatus('synced');
    } else {
      setSyncStatus('error');
    }
  };

  const filteredNotes = useMemo(() => {
    return notes.filter(n => 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [notes, searchQuery]);

  const handleSignOut = async () => {
    await signOut();
    setNotes([]);
    setActiveNoteId(null);
    setHistory([]);
  };

  if (appState === AppState.BOOTING) {
    return (
      <div className="h-screen w-screen bg-[#FAFAF9] flex items-center justify-center">
        <div className="opacity-0 animate-[fade-in_1s_ease-out_forwards]">
          <div className="w-8 h-8 border-2 border-[#292524] rounded-full opacity-20 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-[var(--bg-paper)] text-[var(--text-body)] transition-colors duration-500 relative overflow-hidden">
      
      <aside 
        className={`
          flex-shrink-0 bg-[var(--bg-sidebar)] border-r border-[var(--border-subtle)] 
          flex flex-col transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] z-30
          ${sidebarOpen ? 'w-80 translate-x-0 opacity-100' : 'w-0 -translate-x-10 opacity-0 overflow-hidden'}
        `}
      >
        <div className="p-6 pb-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
               {history.length > 1 && (
                <button 
                  onClick={handleBack} 
                  className="text-[var(--text-muted)] hover:text-[var(--text-body)] transition-colors"
                  title="Go Back"
                >
                  <ChevronLeft size={16} />
                </button>
               )}
               <h1 className="font-ui text-xs font-semibold tracking-[0.2em] text-[var(--text-muted)] uppercase">
                 Lumen // Index
               </h1>
            </div>
            <span className="opacity-50 text-[10px] font-ui tracking-[0.2em] text-[var(--text-muted)] uppercase">CMD+K</span>
          </div>
          
          <div className="relative mb-6">
            <Search className="absolute left-0 top-1.5 w-4 h-4 text-[var(--text-muted)]" />
            <input 
              ref={searchInputRef}
              type="text"
              placeholder="Search thoughts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-b border-[var(--border-subtle)] py-1 pl-6 text-sm font-ui focus:outline-none focus:border-[var(--accent)] transition-colors placeholder:text-[var(--text-muted)] placeholder:opacity-50"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 space-y-4">
          {filteredNotes.map(note => (
            <div 
              key={note.id}
              id={`note-item-${note.id}`}
              onClick={() => handleNavigate(note.id)}
              className={`
                group cursor-pointer py-1 transition-all duration-300
                ${activeNoteId === note.id ? 'opacity-100' : 'opacity-60 hover:opacity-90'}
              `}
            >
              <h3 className={`font-body text-lg leading-tight mb-1 ${activeNoteId === note.id ? 'font-medium' : 'font-normal'}`}>
                {note.title || 'Untitled'}
              </h3>
              <div className="flex items-center gap-2 font-ui text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                <span>{new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                {activeNoteId === note.id && <div className="w-1 h-1 rounded-full bg-[var(--accent)]" />}
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 pt-4 border-t border-[var(--border-subtle)]">
          <button 
            onClick={handleCreateNote}
            title="Cmd + N"
            className="flex items-center gap-3 text-sm font-ui text-[var(--text-muted)] hover:text-[var(--text-body)] transition-colors group"
          >
            <span className="w-6 h-6 rounded-full border border-[var(--border-subtle)] flex items-center justify-center group-hover:border-[var(--accent)] transition-colors">
              <Plus size={14} />
            </span>
            <span>New Thought</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative min-w-0 transition-all duration-500">
        
        <header className="h-16 flex items-center justify-between px-6 md:px-12 flex-shrink-0 z-20 bg-[var(--bg-paper)]/80 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="Toggle Sidebar (Cmd + \)"
              className="text-[var(--text-muted)] hover:text-[var(--text-body)] transition-colors"
            >
              <Menu size={20} strokeWidth={1.5} />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 md:gap-2 bg-[var(--bg-sidebar)] rounded-full p-1 border border-[var(--border-subtle)]">
              <button
                onClick={() => setMode('read')}
                title="Read Mode (Cmd + P)"
                className={`
                  px-4 py-1.5 rounded-full text-xs font-ui font-medium tracking-wide transition-all duration-300 flex items-center gap-2
                  ${mode === 'read' ? 'bg-white shadow-sm text-[var(--text-body)]' : 'text-[var(--text-muted)] hover:text-[var(--text-body)]'}
                `}
              >
                <BookOpen size={14} />
                <span className="hidden md:inline">Read</span>
              </button>
              <button
                onClick={() => setMode('write')}
                title="Write Mode (Cmd + E)"
                className={`
                  px-4 py-1.5 rounded-full text-xs font-ui font-medium tracking-wide transition-all duration-300 flex items-center gap-2
                  ${mode === 'write' ? 'bg-white shadow-sm text-[var(--text-body)]' : 'text-[var(--text-muted)] hover:text-[var(--text-body)]'}
                `}
              >
                <PenTool size={14} />
                <span className="hidden md:inline">Write</span>
              </button>
            </div>
            
            <div 
              className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-[var(--bg-sidebar)] border border-[var(--border-subtle)]"
              title={`Sync Status: ${syncStatus}`}
            >
              <SyncIcon />
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--bg-sidebar)] border border-[var(--border-subtle)] hover:border-[var(--accent)] transition-colors"
              >
                <User size={16} className="text-[var(--text-muted)]" />
                <span className="hidden md:inline font-ui text-xs text-[var(--text-body)]">
                  {profile?.display_name || user?.email?.split('@')[0] || 'User'}
                </span>
              </button>
              
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-[var(--border-subtle)] rounded-sm shadow-lg py-1 z-50">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm font-ui text-[var(--text-body)] hover:bg-[var(--bg-sidebar)] transition-colors"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
            
            {activeNote && (
               <button 
                onClick={handleInsertImage}
                title="Insert Image"
                className="ml-2 w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-sidebar)] hover:text-[var(--text-body)] transition-colors"
              >
                <ImageIcon size={18} strokeWidth={1.5} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
               onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
               title="Note Info & Actions"
               className={`transition-colors ${rightSidebarOpen ? 'text-[var(--text-body)]' : 'text-[var(--text-muted)] hover:text-[var(--text-body)]'}`}
            >
              <PanelRight size={20} strokeWidth={1.5} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto relative scroll-smooth">
          <div className="max-w-3xl mx-auto px-6 md:px-12 py-12 md:py-16 min-h-full flex flex-col">
            {activeNote ? (
              <>
                <input
                  type="text"
                  value={activeNote.title}
                  onChange={(e) => handleUpdateTitle(e.target.value)}
                  placeholder="Untitled"
                  className="w-full bg-transparent border-none p-0 text-3xl md:text-4xl font-body font-bold text-[var(--text-body)] placeholder:text-[var(--border-subtle)] focus:outline-none focus:ring-0 mb-8 leading-tight tracking-tight"
                />

                <div className="flex-1 relative">
                  {mode === 'write' ? (
                     <div className="animate-[fade-in_0.3s_ease-out]">
                       <Editor 
                         ref={editorRef}
                         content={activeNote.content} 
                         onChange={handleUpdateNote} 
                       />
                     </div>
                  ) : (
                    <div className="animate-[fade-in_0.3s_ease-out]">
                      <Preview content={activeNote.content} />
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-muted)] opacity-50">
                <BookOpen size={48} strokeWidth={1} />
                <p className="mt-4 font-body italic text-lg">Select a thought to begin.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <aside 
        className={`
          flex-shrink-0 bg-[var(--bg-paper)] border-l border-[var(--border-subtle)] 
          flex flex-col transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] z-30
          ${rightSidebarOpen ? 'w-72 translate-x-0 opacity-100' : 'w-0 translate-x-10 opacity-0 overflow-hidden'}
        `}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-ui text-xs font-semibold tracking-[0.2em] text-[var(--text-muted)] uppercase">
              Metadata
            </h2>
            <button onClick={() => setRightSidebarOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-body)]">
               <X size={16} />
            </button>
          </div>

          {activeNote ? (
            <div className="space-y-8 flex-1">
              <div className="space-y-4">
                 <div className="flex items-start gap-3 text-[var(--text-muted)]">
                   <Calendar size={16} className="mt-0.5" />
                   <div>
                     <p className="text-[10px] font-ui uppercase tracking-wider mb-1">Created</p>
                     <p className="font-body text-sm">{new Date(activeNote.createdAt).toLocaleString()}</p>
                   </div>
                 </div>
                 
                 <div className="flex items-start gap-3 text-[var(--text-muted)]">
                   <Clock size={16} className="mt-0.5" />
                   <div>
                     <p className="text-[10px] font-ui uppercase tracking-wider mb-1">Last Edited</p>
                     <p className="font-body text-sm">{new Date(activeNote.updatedAt).toLocaleString()}</p>
                   </div>
                 </div>

                 <div className="flex items-start gap-3 text-[var(--text-muted)]">
                   <Type size={16} className="mt-0.5" />
                   <div>
                     <p className="text-[10px] font-ui uppercase tracking-wider mb-1">Statistics</p>
                     <p className="font-body text-sm">{stats.words} words</p>
                     <p className="font-body text-sm">{stats.chars} characters</p>
                   </div>
                 </div>
              </div>

              <div>
                 <h3 className="font-ui text-[10px] font-semibold tracking-[0.2em] text-[var(--text-muted)] uppercase mb-4">Actions</h3>
                 <button 
                   onClick={handleInsertImage}
                   className="w-full flex items-center gap-3 group text-left"
                 >
                   <span className="w-8 h-8 rounded-full border border-[var(--border-subtle)] flex items-center justify-center group-hover:border-[var(--accent)] group-hover:text-[var(--accent)] transition-colors bg-white">
                     <ImageIcon size={14} />
                   </span>
                   <span className="font-body text-sm text-[var(--text-body)] group-hover:text-[var(--accent)] transition-colors">Insert Image</span>
                 </button>
              </div>

              <div className="pt-8 border-t border-[var(--border-subtle)]">
                <button 
                  onClick={() => requestDeleteNote(activeNote.id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-800 hover:bg-red-100 transition-colors rounded-sm font-ui text-xs uppercase tracking-wider font-medium"
                >
                  <Trash2 size={14} />
                  Delete Note
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm font-body italic text-[var(--text-muted)]">No active note selected.</p>
          )}
        </div>
      </aside>
      
      {noteToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#292524]/10 backdrop-blur-[2px] animate-[fade-in_0.2s_ease-out]">
          <div className="bg-[var(--bg-paper)] border border-[var(--border-subtle)] p-8 max-w-sm w-full shadow-2xl shadow-[#292524]/10 transform scale-100 animate-[fade-in_0.3s_ease-out] relative">
            <button 
              onClick={() => setNoteToDelete(null)}
              className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-body)]"
            >
              <X size={16} />
            </button>
            
            <h3 className="font-body text-xl font-medium mb-3">Discard this thought?</h3>
            <p className="font-ui text-sm text-[var(--text-muted)] mb-8 leading-relaxed">
              This action cannot be undone. The note will be permanently removed from your collection.
            </p>
            
            <div className="flex justify-end gap-4 font-ui text-xs font-medium uppercase tracking-widest">
              <button 
                onClick={() => setNoteToDelete(null)}
                className="px-6 py-2 text-[var(--text-body)] hover:bg-[var(--bg-sidebar)] transition-colors"
              >
                Keep
              </button>
              <button 
                onClick={executeDelete}
                className="px-6 py-2 bg-[var(--text-body)] text-[var(--bg-paper)] hover:bg-red-900 transition-colors"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
