export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  tags: string[];
}

export type ViewMode = 'editor' | 'preview' | 'split';

export interface Command {
  id: string;
  label: string;
  action: () => void;
  shortcut?: string;
}

export enum AppState {
  BOOTING,
  READY,
  ERROR
}