"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import {
  X,
  FileText,
  Download,
  Save,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo2,
  Redo2,
  Eye,
  PenLine,
} from "lucide-react";
import { Button } from "./Button";
import { TYPE_DOCUMENT_LABELS } from "@/types";
import type { DocumentMeta } from "@/types";
import { formatFileSize } from "@/lib/utils";

interface DocumentViewerProps {
  document: DocumentMeta;
  isOpen: boolean;
  onClose: () => void;
  onSave: (contenu: string, texteDocument: string) => void;
  onDownload: () => void;
}

// ─── Barre d'outils réutilisable ───
function Toolbar({
  editor,
}: {
  editor: Editor | null;
}) {
  if (!editor) return null;

  const buttons = [
    { action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold"), icon: Bold, title: "Gras" },
    { action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic"), icon: Italic, title: "Italique" },
    { action: () => editor.chain().focus().toggleUnderline().run(), active: editor.isActive("underline"), icon: UnderlineIcon, title: "Souligné" },
    { action: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive("strike"), icon: Strikethrough, title: "Barré" },
    null,
    { action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive("heading", { level: 1 }), icon: Heading1, title: "Titre 1" },
    { action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive("heading", { level: 2 }), icon: Heading2, title: "Titre 2" },
    { action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive("heading", { level: 3 }), icon: Heading3, title: "Titre 3" },
    null,
    { action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive("bulletList"), icon: List, title: "Liste à puces" },
    { action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive("orderedList"), icon: ListOrdered, title: "Liste numérotée" },
    null,
    { action: () => editor.chain().focus().setTextAlign("left").run(), active: editor.isActive({ textAlign: "left" }), icon: AlignLeft, title: "Gauche" },
    { action: () => editor.chain().focus().setTextAlign("center").run(), active: editor.isActive({ textAlign: "center" }), icon: AlignCenter, title: "Centrer" },
    { action: () => editor.chain().focus().setTextAlign("right").run(), active: editor.isActive({ textAlign: "right" }), icon: AlignRight, title: "Droite" },
    null,
    { action: () => editor.chain().focus().undo().run(), active: false, icon: Undo2, title: "Annuler" },
    { action: () => editor.chain().focus().redo().run(), active: false, icon: Redo2, title: "Refaire" },
  ];

  return (
    <div className="flex items-center gap-0.5 flex-wrap">
      {buttons.map((btn, i) =>
        btn === null ? (
          <div
            key={`sep-${i}`}
            className="w-px h-5 bg-uf-border dark:bg-uf-border-dark mx-1"
          />
        ) : (
          <button
            key={btn.title}
            type="button"
            onClick={btn.action}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              btn.active
                ? "bg-uf-button-hover text-white"
                : "text-uf-text-muted dark:text-uf-text-muted-dark hover:text-uf-button-hover hover:bg-blue-50 dark:hover:bg-blue-950/40"
            }`}
            title={btn.title}
          >
            <btn.icon className="w-4 h-4" />
          </button>
        )
      )}
    </div>
  );
}

export function DocumentViewer({
  document: doc,
  isOpen,
  onClose,
  onSave,
  onDownload,
}: DocumentViewerProps) {
  const hasPreview = !!doc.dataUrl;
  const [leftTab, setLeftTab] = useState<"editeur" | "apercu">("editeur");

  // Éditeur principal (zone gauche) — texte du document
  const mainEditor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: doc.texteDocument || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "tiptap p-4 min-h-[300px] text-sm text-uf-text dark:text-uf-text-dark focus:outline-none",
      },
    },
  });

  // Éditeur notes (zone droite)
  const notesEditor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: doc.contenu || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "tiptap p-4 min-h-[200px] text-sm text-uf-text dark:text-uf-text-dark focus:outline-none",
      },
    },
  });

  // Mettre à jour les contenus quand le document change
  useEffect(() => {
    if (mainEditor && doc) {
      mainEditor.commands.setContent(doc.texteDocument || "");
    }
    if (notesEditor && doc) {
      notesEditor.commands.setContent(doc.contenu || "");
    }
  }, [doc.id, mainEditor, notesEditor]);

  // Bloquer le scroll du body
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isImage = doc.mimeType === "image/jpeg" || doc.mimeType === "image/png";
  const isPdf = doc.mimeType === "application/pdf";

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-uf-bg dark:bg-uf-bg-dark">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-uf-border dark:border-uf-border-dark bg-uf-card dark:bg-uf-card-dark shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <FileText className="w-5 h-5 text-uf-button-hover shrink-0" />
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-uf-title dark:text-uf-title-dark truncate">
              {doc.nom}
            </h2>
            <p className="text-xs text-uf-text-muted dark:text-uf-text-muted-dark">
              {TYPE_DOCUMENT_LABELS[doc.typeDocument]} · {formatFileSize(doc.taille)}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Document editor + optional preview */}
        <div className="lg:w-1/2 flex-1 flex flex-col bg-uf-card dark:bg-uf-card-dark">
          {/* Tabs if preview available */}
          {hasPreview && (
            <div className="flex items-center gap-1 px-4 pt-3 shrink-0">
              <button
                type="button"
                onClick={() => setLeftTab("editeur")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  leftTab === "editeur"
                    ? "bg-uf-button-hover text-white"
                    : "text-uf-text-muted dark:text-uf-text-muted-dark hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <PenLine className="w-3.5 h-3.5" />
                Éditeur
              </button>
              <button
                type="button"
                onClick={() => setLeftTab("apercu")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  leftTab === "apercu"
                    ? "bg-uf-button-hover text-white"
                    : "text-uf-text-muted dark:text-uf-text-muted-dark hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Aperçu
              </button>
            </div>
          )}

          {/* Editor view */}
          {(!hasPreview || leftTab === "editeur") && (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="px-4 py-2 border-b border-uf-border dark:border-uf-border-dark shrink-0">
                <h3 className="text-sm font-semibold text-uf-title dark:text-uf-title-dark mb-2">
                  Contenu du document
                </h3>
                <Toolbar editor={mainEditor} />
              </div>
              <div className="flex-1 overflow-auto">
                <EditorContent editor={mainEditor} />
              </div>
            </div>
          )}

          {/* Preview view */}
          {hasPreview && leftTab === "apercu" && (
            <div className="flex-1 p-4 overflow-auto bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
              {isPdf ? (
                <iframe
                  src={doc.dataUrl}
                  className="w-full h-full min-h-[400px] rounded-lg border border-uf-border dark:border-uf-border-dark bg-white"
                  title={doc.nom}
                />
              ) : isImage ? (
                <img
                  src={doc.dataUrl}
                  alt={doc.nom}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                />
              ) : (
                <div className="text-center text-uf-text-muted dark:text-uf-text-muted-dark">
                  <FileText className="w-16 h-16 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Format non pris en charge</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Notes editor */}
        <div className="lg:w-1/2 flex-1 flex flex-col border-t lg:border-t-0 lg:border-l border-uf-border dark:border-uf-border-dark bg-uf-card dark:bg-uf-card-dark">
          <div className="px-4 py-2 border-b border-uf-border dark:border-uf-border-dark shrink-0">
            <h3 className="text-sm font-semibold text-uf-title dark:text-uf-title-dark mb-2">
              Notes et observations
            </h3>
            <Toolbar editor={notesEditor} />
          </div>
          <div className="flex-1 overflow-auto">
            <EditorContent editor={notesEditor} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-3 border-t border-uf-border dark:border-uf-border-dark bg-uf-card dark:bg-uf-card-dark shrink-0">
        {doc.dataUrl && (
          <Button variant="secondary" onClick={onDownload}>
            <Download className="w-4 h-4 mr-2" />
            Télécharger
          </Button>
        )}
        <Button
          onClick={() =>
            onSave(
              notesEditor?.getHTML() || "",
              mainEditor?.getHTML() || ""
            )
          }
        >
          <Save className="w-4 h-4 mr-2" />
          Enregistrer
        </Button>
      </div>
    </div>
  );
}
