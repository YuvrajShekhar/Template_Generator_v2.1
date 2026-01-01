import { useState } from "react";

export default function DocxDropZone({
    onFile,
    label = "DOCX hierher ziehen",
}: {
    onFile: (file: File) => void;
    label?: string;
}) {
    const [drag, setDrag] = useState(false);

    const prevent = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const onDragOver = (e: React.DragEvent) => {
        prevent(e);
        setDrag(true);
    };

    const onDragLeave = (e: React.DragEvent) => {
        prevent(e);
        setDrag(false);
    };

    const onDrop = (e: React.DragEvent) => {
        prevent(e);
        setDrag(false);
        const f = e.dataTransfer.files?.[0];
        if (!f) return;

        if (!f.name.toLocaleLowerCase().endsWith('.docx')) {
            console.warn("nur .docx erlaubt");
            return;
        }

        onFile(f);
    };

    return (
        <div
            style={{
                border: "2px dashed",
                padding: "40px",
                textAlign: "center",
                borderColor: drag ? "blue" : "gray",
            }}
            onDragOver={onDragOver}
            onDragEnter={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            <div className="text-sm opacity-70 mb-2">nur .docx</div>
            <div className="text-base font-medium select-none">{label}</div>
        </div>
    )
}
