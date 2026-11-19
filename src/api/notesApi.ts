import { useFetch } from "../hooks/useFetch";
import { useCreate } from "../hooks/useCreate";
import { useUpdate } from "../hooks/useUpdate";
import { useDelete } from "../hooks/useDelete";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const NOTES_URL = `${BASE_URL}/notes`;

// Note response from the backend
export interface Note {
    note_id: string;
    title: string;
    content: string;
    created_at: string;
    updated_at: string;
}

// Payload for creating and updating notes
export interface NotePayload {
    title: string;
    content: string;
}

// GET: Fetch all notes
export const useNotes = (enabled = true) =>
    useFetch<Note[]>(NOTES_URL, enabled);

// GET: Search notes by title
export const useSearchNotes = (
    query: string,
    enabled = true,
) =>
    useFetch<Note[]>(
        `${NOTES_URL}/search?q=${encodeURIComponent(query.trim())}`,
        enabled && query.trim().length > 0,
    );

// GET: Fetch a single note by ID
export const useNoteById = (
    id: string | number,
    enabled = true,
) =>
    useFetch<Note>(
        `${NOTES_URL}/${id}`,
        enabled && String(id).length > 0,
    );

// POST: Create a new note
export const useCreateNote = () =>
    useCreate<Note>(NOTES_URL);

// PATCH: Update an existing note
export const useUpdateNote = () =>
    useUpdate<Note>(NOTES_URL);

// DELETE: Delete an existing note
export const useDeleteNote = () =>
    useDelete<unknown>(NOTES_URL);