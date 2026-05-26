import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { renderAsync } from "docx-preview";
import { X, Printer, Download, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@shared/components/ui";
import { downloadBlob } from "@shared/hooks/useApi";

interface DocumentPreviewModalProps {
  blob: Blob | null;
  filename: string;
  onClose: () => void;
}

export function DocumentPreviewModal({ blob, filename, onClose }: DocumentPreviewModalProps) {
  // Callback ref — fires the moment the div is mounted in the Portal DOM
  const [containerNode, setContainerNode] = React.useState<HTMLDivElement | null>(null);
  const containerCallback = React.useCallback((node: HTMLDivElement | null) => {
    setContainerNode(node);
  }, []);

  const [rendering, setRendering] = React.useState(false);
  const [renderError, setRenderError] = React.useState<string | null>(null);

  const downloadFilename = filename.replace(/\.docx$/i, "_generated.docx");

  // Runs when BOTH the blob and the mounted container node are available
  React.useEffect(() => {
    if (!blob || !containerNode) return;

    setRendering(true);
    setRenderError(null);
    containerNode.innerHTML = "";

    renderAsync(blob, containerNode, undefined, {
      className: "docx-preview-body",
      inWrapper: true,
      ignoreWidth: true,
      breakPages: true,
    })
      .then(() => setRendering(false))
      .catch((err) => {
        console.error("docx-preview error:", err);
        setRenderError("Could not render preview. Use Download to open the file.");
        setRendering(false);
      });
  }, [blob, containerNode]);

  const handlePrint = () => {
    if (!containerNode) return;

    const styles = Array.from(document.styleSheets)
      .flatMap((ss) => {
        try { return Array.from(ss.cssRules).map((r) => r.cssText); }
        catch { return []; }
      })
      .join("\n");

    const iframe = document.createElement("iframe");
    iframe.style.cssText =
      "position:fixed;top:-9999px;left:-9999px;width:210mm;height:297mm;border:0";
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument!;
    doc.open();
    doc.write(
      `<!DOCTYPE html><html><head><meta charset="utf-8"/>` +
      `<style>${styles} body{margin:0;background:#fff;}</style>` +
      `</head><body>${containerNode.innerHTML}</body></html>`
    );
    doc.close();

    iframe.contentWindow!.focus();
    setTimeout(() => {
      iframe.contentWindow!.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 400);
  };

  const handleDownload = () => {
    if (blob) downloadBlob(blob, downloadFilename);
  };

  return (
    <Dialog.Root open={!!blob} onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed inset-4 z-50 flex flex-col rounded-xl bg-white shadow-2xl focus:outline-none md:inset-8"
          aria-describedby={undefined}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b px-5 py-3 shrink-0">
            <Dialog.Title className="text-base font-semibold truncate pr-4">
              {downloadFilename}
            </Dialog.Title>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                leftIcon={<Download className="h-4 w-4" />}
              >
                Download
              </Button>
              <Button
                size="sm"
                onClick={handlePrint}
                disabled={rendering || !!renderError}
                leftIcon={<Printer className="h-4 w-4" />}
              >
                Print
              </Button>
              <Dialog.Close asChild>
                <button
                  className="ml-2 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>
          </div>

          {/* Preview area */}
          <div className="relative flex-1 overflow-auto bg-gray-100 p-6">
            {rendering && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-100">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {renderError ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <p className="text-sm text-center max-w-xs">{renderError}</p>
              </div>
            ) : (
              <div ref={containerCallback} />
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
