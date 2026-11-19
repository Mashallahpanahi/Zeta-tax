import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { FaTimes } from "react-icons/fa";

import type { Note, NotePayload } from "../../api/notesApi";

interface EditNoteModalProps {
    note: Note | null;
    onClose: () => void;
    onSave: (payload: NotePayload) => Promise<void>;
    updating: boolean;
    error: string;
    onClearError: () => void;
}

const EditNoteModal = ({
    note,
    onClose,
    onSave,
    updating,
    error,
    onClearError,
}: EditNoteModalProps) => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [validationError, setValidationError] = useState("");

    // Populate the form when a note is selected.
    useEffect(() => {
        if (note) {
            setTitle(note.title);
            setContent(note.content);
            setValidationError("");
        }
    }, [note]);

    if (!note) return null;

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!title.trim() || !content.trim()) {
            setValidationError("Title and content cannot be empty.");
            return;
        }

        setValidationError("");
        onClearError();

        await onSave({
            title: title.trim(),
            content: content.trim(),
        });
    };

    const handleClose = () => {
        if (updating) return;

        setValidationError("");
        onClearError();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

            <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl">

                {/* Header */}
                <div className="mb-5 flex items-center justify-between">

                    <h2 className="text-xl font-semibold text-gray-800">
                        Update note
                    </h2>

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={updating}
                        aria-label="Close edit modal"
                        className="text-gray-400 transition hover:text-gray-700 disabled:opacity-50"
                    >
                        <FaTimes size={20} />
                    </button>

                </div>

                {/* Validation and API errors */}
                {(validationError || error) && (
                    <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">

                        <span>{validationError || error}</span>

                        <button
                            type="button"
                            onClick={() => {
                                setValidationError("");
                                onClearError();
                            }}
                            aria-label="Dismiss error"
                        >
                            <FaTimes />
                        </button>

                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit}>

                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Title
                    </label>

                    <input
                        type="text"
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value);
                            setValidationError("");
                        }}
                        disabled={updating}
                        className="mb-4 w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 disabled:bg-gray-100"
                    />

                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Content
                    </label>

                    <textarea
                        rows={8}
                        value={content}
                        onChange={(e) => {
                            setContent(e.target.value);
                            setValidationError("");
                        }}
                        disabled={updating}
                        className="w-full resize-y rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-blue-500 disabled:bg-gray-100"
                    />

                    {/* Actions */}
                    <div className="mt-6 flex justify-end gap-3">

                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={updating}
                            className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={updating}
                            className="rounded-lg bg-blue-firstRate px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {updating ? "Updating..." : "Save changes"}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
};

export default EditNoteModal;