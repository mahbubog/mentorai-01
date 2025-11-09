import { useState, useEffect } from 'react';
import { NotebookPen, Plus, Trash2, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { UserNoteRow, UserNotesInsert, UserNotesUpdate } from '../../lib/database.types';

interface LessonNotesProps {
  lessonId: string;
}

export function LessonNotes({ lessonId }: LessonNotesProps) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<UserNoteRow[]>([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadNotes();
    }
  }, [lessonId, user]);

  const loadNotes = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase
        .from('user_notes')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lessonId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (err: any) {
      setError('Failed to load notes: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!user || !newNoteContent.trim()) return;

    setSaving(true);
    setError('');

    try {
      const noteData: UserNotesInsert = {
        user_id: user.id,
        lesson_id: lessonId,
        note_content: newNoteContent.trim(),
        timestamp_seconds: 0, // Placeholder for future video integration
      };

      const { data, error } = await supabase
        .from('user_notes')
        .insert([noteData])
        .select()
        .single();

      if (error) throw error;

      setNotes([data, ...notes]);
      setNewNoteContent('');
    } catch (err: any) {
      setError('Failed to save note: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const { error } = await supabase
        .from('user_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      setNotes(notes.filter(n => n.id !== noteId));
    } catch (err: any) {
      setError('Failed to delete note: ' + err.message);
    }
  };

  const handleUpdateNote = async (noteId: string, newContent: string) => {
    try {
      const updatePayload: UserNotesUpdate = {
        note_content: newContent,
      };

      await supabase
        .from('user_notes')
        .update(updatePayload)
        .eq('id', noteId);
      
      // Optimistically update state
      setNotes(notes.map(n => n.id === noteId ? { ...n, note_content: newContent } : n));
    } catch (err: any) {
      setError('Failed to update note: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-lg font-bold mb-3 flex items-center text-gray-900">
          <NotebookPen className="h-5 w-5 mr-2 text-blue-600" />
          Add a New Note
        </h3>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <textarea
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          placeholder="Write your note here..."
          rows={4}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
        <button
          onClick={handleAddNote}
          disabled={saving || !newNoteContent.trim()}
          className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center"
        >
          {saving ? (
            'Saving...'
          ) : (
            <>
              <Plus className="h-5 w-5 mr-2" />
              Save Note
            </>
          )}
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900">Your Notes ({notes.length})</h3>
        {notes.length === 0 ? (
          <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
            <p>You haven't taken any notes for this lesson yet.</p>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="bg-white p-4 rounded-lg shadow border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date(note.created_at).toLocaleDateString()}
                </div>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="text-red-500 hover:text-red-700 p-1 rounded transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <textarea
                value={note.note_content}
                onChange={(e) => handleUpdateNote(note.id, e.target.value)}
                rows={Math.max(2, Math.ceil(note.note_content.length / 80))} // Dynamic row sizing
                className="w-full text-gray-700 p-2 border border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}