import { useState } from "react";
import { FaTrash } from "react-icons/fa";

interface DeleteNoteButtonProps {
    onDelete: () => Promise<void>;
    deleting: boolean;
}

const DeleteNoteButton = ({
    onDelete,
    deleting,
}: DeleteNoteButtonProps) => {
    const [confirming, setConfirming] = useState(false);

    const handleDelete = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this note?"
        );

        if (!confirmed) return;

        setConfirming(true);

        try {
            await onDelete();
        } finally {
            setConfirming(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleDelete}
            disabled={deleting || confirming}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
            <FaTrash />

            {deleting || confirming ? "Deleting..." : "Delete"}
        </button>
    );
};

export default DeleteNoteButton;