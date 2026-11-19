import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
    FaPlus,
    FaSearch,
    FaStickyNote,
    FaTimes,
} from "react-icons/fa";
import {
    useNotes,
    useSearchNotes,
    useNoteById,
    useCreateNote,
    useUpdateNote,
    useDeleteNote,
} from "../../api/notesApi";
import type { Note, NotePayload } from "../../api/notesApi";
import Loader from "../../components/common/Loader";
import EditNoteModal from "../../components/notes/EditNoteModal";
import DeleteNoteButton from "../../components/notes/DeleteNoteButton";

const cardColors = [
    "bg-amber-50 border-amber-100",
    "bg-white border-gray-200",
    "bg-indigo-50 border-indigo-100",
    "bg-white border-gray-200",
    "bg-sky-50 border-sky-100",
    "bg-white border-gray-200",
];

// Sort notes by latest update.
const sortNotes = (items: Note[]): Note[] => {
    return [...items].sort((a, b) => {
        const dateA = new Date(a.updated_at).getTime();
        const dateB = new Date(b.updated_at).getTime();
        return dateB - dateA;
    });
};

const QuickNotes = () => {
    // Create form state
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    // Search state
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // General error state
    const [pageError, setPageError] = useState("");

    // Edit state
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [editError, setEditError] = useState("");

    // Delete state
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Debounce search input.
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search.trim());
        }, 400);

        return () => clearTimeout(timer);
    }, [search]);

    // GET hooks
    const allNotes = useNotes(!debouncedSearch);

    const searchedNotes = useSearchNotes(
        debouncedSearch,
        Boolean(debouncedSearch),
    );

    const selectedNote = useNoteById(
        editingNoteId ?? "",
        Boolean(editingNoteId),
    );

    // POST, PATCH and DELETE hooks
    const createNote = useCreateNote();
    const updateNote = useUpdateNote();
    const deleteNote = useDeleteNote();

    // Get notes from the currently active query.
    const currentNotes = debouncedSearch
        ? searchedNotes.data
        : allNotes.data;

    const notes = sortNotes(currentNotes ?? []);

    const loading = debouncedSearch
        ? searchedNotes.loading
        : allNotes.loading;

    // Refresh the currently active notes query.
    const refreshNotes = () => {
        if (debouncedSearch) {
            searchedNotes.refetch();
        } else {
            allNotes.refetch();
        }
    };

    // Selected note is only available after its request completes.
    const editingNote =
        selectedNote.data?.note_id === editingNoteId
            ? selectedNote.data
            : null;

    // Display API and page errors.
    const error =
        pageError ||
        (debouncedSearch ? searchedNotes.error : allNotes.error) ||
        createNote.error ||
        deleteNote.error ||
        "";

    // Create note.
    const handleCreateNote = async (
        e: FormEvent<HTMLFormElement>,
    ) => {
        e.preventDefault();

        if (!title.trim() || !content.trim()) {
            setPageError("Please enter both a title and content.");
            return;
        }

        setPageError("");
        const payload: NotePayload = {
            title: title.trim(),
            content: content.trim(),
        };
        const success = await createNote.create(payload);

        if (success) {
            setTitle("");
            setContent("");
            refreshNotes();
        }
    };

    // Open edit modal.
    const handleOpenEdit = (id: string) => {
        setPageError("");
        setEditError("");
        setEditingNoteId(id);
    };

    // Close edit modal.
    const handleCloseEdit = () => {
        if (updateNote.loading) return;

        setEditingNoteId(null);
        setEditError("");
    };

    // Update note.
    const handleUpdateNote = async (payload: NotePayload) => {
        if (!editingNoteId) return;

        setEditError("");

        const success = await updateNote.update(
            editingNoteId,
            payload,
        );

        if (success) {
            setEditingNoteId(null);
            refreshNotes();
        }
    };

    // Delete note.
    const handleDeleteNote = async (id: string) => {
        setDeletingId(id);
        setPageError("");
        const success = await deleteNote.remove(id);
        if (success) {
            refreshNotes();
        }
        setDeletingId(null);
    };

    // Format updated date.
    const formatDate = (note: Note): string => {
        const dateValue = note.updated_at || note.created_at;
        if (!dateValue) return "Recently updated";
        const date = new Date(dateValue);
        if (Number.isNaN(date.getTime())) {
            return "Recently updated";
        }
        const now = new Date();
        const diff = Math.max(0, now.getTime() - date.getTime());
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return "Updated just now";
        if (minutes < 60) {
            return `Updated ${minutes} minute${minutes > 1 ? "s" : ""} ago`;
        }
        if (hours < 24) {
            return `Updated ${hours} hour${hours > 1 ? "s" : ""} ago`;
        }
        if (days === 1) return "Updated yesterday";
        if (days < 7) return `Updated ${days} days ago`;
        return `Updated ${date.toLocaleDateString()}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 px-5 py-8 md:px-8">
            {/* Header */}
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        My notes
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Your thoughts, plans, and everyday reminders.
                        All in one place.
                    </p>
                </div>

                {/* Search */}
                <div className="relative w-full md:w-72">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search notes..."
                        className="w-full rounded-lg border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-5 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    <span>{error}</span>
                    <button
                        type="button"
                        onClick={() => setPageError("")}
                        aria-label="Dismiss error"
                    >
                        <FaTimes />
                    </button>
                </div>
            )}

            {/* Create Note */}
            <form
                onSubmit={handleCreateNote}
                className="mb-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
                <h2 className="mb-4 text-base font-semibold text-gray-800">
                    Create a note
                </h2>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                    <div className="w-full lg:w-64">
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Title
                        </label>

                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Give your note a title"
                            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <div className="flex-1">
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Content
                        </label>

                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write something worth remembering..."
                            rows={1}
                            className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={createNote.loading}
                        className="flex items-center justify-center gap-2 rounded-lg bg-blue-firstRate px-6 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <FaPlus />
                        {createNote.loading ? "Adding..." : "Add note"}
                    </button>
                </div>
            </form>

            {/* Notes Header */}
            <div className="mb-5 flex items-center justify-between">

                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-gray-800">
                        All notes
                    </h2>

                    <span className="rounded-md bg-gray-200 px-2 py-1 text-xs font-semibold text-gray-600">
                        {notes.length}
                    </span>
                </div>
                <span className="text-xs text-gray-500">
                    Sort by: Last updated ↓
                </span>
            </div>
            {/* Loading */}
            {loading ? (
                <Loader message="Loading notes..." />
            ) : notes.length === 0 ? (
                /* Empty State */
                <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white text-center">

                    <FaStickyNote className="mb-4 text-4xl text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-700">
                        {debouncedSearch
                            ? "No matching notes found"
                            : "No notes yet"}
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                        {debouncedSearch
                            ? "Try searching with another title."
                            : "Create your first note to get started."}
                    </p>
                </div>
            ) : (

                /* Notes Grid */
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

                    {notes.map((note, index) => (

                        <div
                            key={note.note_id}
                            className={`flex min-h-56 flex-col justify-between rounded-xl border p-5 transition hover:-translate-y-1 hover:shadow-md ${cardColors[index % cardColors.length]
                                }`}
                        >
                            <div>
                                <h3 className="mb-2 break-words text-lg font-semibold text-gray-800">
                                    {note.title}
                                </h3>

                                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-gray-600">
                                    {note.content}
                                </p>
                            </div>

                            <div className="mt-6">
                                <p className="mb-3 text-xs text-gray-500">
                                    {formatDate(note)}
                                </p>

                                <div className="flex items-center gap-3">

                                    {/* Update */}
                                    <button
                                        type="button"
                                        onClick={() => handleOpenEdit(note.note_id)}
                                        className="flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm text-blue-600 transition hover:bg-blue-50"
                                    >
                                        <span>Update</span>
                                    </button>

                                    {/* Delete */}
                                    <DeleteNoteButton
                                        onDelete={() => handleDeleteNote(note.note_id)}
                                        deleting={deletingId === note.note_id}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Modal */}
            <EditNoteModal
                note={editingNote}
                onClose={handleCloseEdit}
                onSave={handleUpdateNote}
                updating={updateNote.loading}
                error={
                    editError ||
                    selectedNote.error ||
                    updateNote.error ||
                    ""
                }
                onClearError={() => setEditError("")}
            />
        </div>
    );
};
export default QuickNotes;