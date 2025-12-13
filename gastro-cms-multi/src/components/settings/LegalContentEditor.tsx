'use client';

import { useState, useEffect } from 'react';
import { DocumentTextIcon, CheckIcon, ClockIcon } from '@heroicons/react/24/outline';

interface LegalContentEditorProps {
  title: string;
  content: string;
  lastUpdated: string | null;
  onSave: (content: string) => void;
}

export default function LegalContentEditor({ title, content, lastUpdated, onSave }: LegalContentEditorProps) {
  const [editorContent, setEditorContent] = useState(content);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setEditorContent(content);
    setHasChanges(false);
  }, [content]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditorContent(e.target.value);
    setHasChanges(e.target.value !== content);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(editorContent);
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving content:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const formatLastUpdated = (dateString: string | null) => {
    if (!dateString) return 'Noch nie gespeichert';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Unbekannt';
    }
  };

  const insertPlaceholder = (placeholder: string) => {
    const textarea = document.getElementById('legal-content-editor') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = editorContent.substring(0, start) + placeholder + editorContent.substring(end);
      setEditorContent(newContent);
      setHasChanges(true);
      
      // Set cursor position after inserted text
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + placeholder.length, start + placeholder.length);
      }, 0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <DocumentTextIcon className="w-5 h-5 mr-2" />
            {title}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Bearbeiten Sie den Inhalt für {title.toLowerCase()}
          </p>
        </div>
        
        {lastUpdated && (
          <div className="flex items-center text-sm text-gray-500">
            <ClockIcon className="w-4 h-4 mr-1" />
            Zuletzt geändert: {formatLastUpdated(lastUpdated)}
          </div>
        )}
      </div>

      {/* Quick Insert Buttons */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Schnelle Einfügungen:</h4>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => insertPlaceholder('Überschrift 1\n\n')}
            className="px-3 py-1 text-xs bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Überschrift
          </button>
          <button
            type="button"
            onClick={() => insertPlaceholder('Absatz\n\n')}
            className="px-3 py-1 text-xs bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Absatz
          </button>
          <button
            type="button"
            onClick={() => insertPlaceholder('• Listenpunkt 1\n• Listenpunkt 2\n\n')}
            className="px-3 py-1 text-xs bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Liste
          </button>
          <button
            type="button"
            onClick={() => insertPlaceholder('https://example.com\n\n')}
            className="px-3 py-1 text-xs bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Link
          </button>
        </div>
      </div>

      {/* Editor */}
      <div>
        <label htmlFor="legal-content-editor" className="block text-sm font-medium text-gray-700 mb-2">
          Inhalt (Text)
        </label>
        <textarea
          id="legal-content-editor"
          rows={20}
          autoComplete="off"
          value={editorContent || ''}
          onChange={handleContentChange}
          className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          placeholder="Geben Sie hier den Inhalt als Text ein..."
        />
        <p className="mt-2 text-sm text-gray-500">
          Geben Sie hier den Inhalt als Text ein. HTML-Tags werden als Text gespeichert.
        </p>
      </div>

      {/* Preview */}
      {editorContent && editorContent.trim() && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Vorschau:</h4>
          <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-gray-700">
                {editorContent}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className={`
            inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
            ${hasChanges && !isSaving
              ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              : 'bg-gray-400 cursor-not-allowed'
            }
          `}
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Wird gespeichert...
            </>
          ) : (
            <>
              <CheckIcon className="w-4 h-4 mr-2" />
              {hasChanges ? 'Änderungen speichern' : 'Gespeichert'}
            </>
          )}
        </button>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Hilfe:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Geben Sie den Inhalt als reinen Text ein</li>
          <li>• Die Restaurant-Daten werden automatisch aus den Einstellungen übernommen</li>
          <li>• Speichern Sie regelmäßig, um Änderungen zu sichern</li>
          <li>• Die Vorschau zeigt den Inhalt als Text an</li>
        </ul>
      </div>
    </div>
  );
}
