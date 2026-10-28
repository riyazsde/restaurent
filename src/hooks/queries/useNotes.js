import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import notesService from '../../services/notesService';

// Format and normalize note schema from backend
const normalizeNote = (item) => {
    if (!item) return null;
    const id = item._id || item.id || String(Date.now());
    const text = item.note || item.text || '';
    const completed = Boolean(item.completed || item.is_completed || item.status === 'completed');
    
    // Format time display
    let time = item.time || '';
    if (!time && item.createdAt) {
        try {
            const d = new Date(item.createdAt);
            time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        } catch {
            time = '';
        }
    }
    if (!time) {
        const d = new Date();
        time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    }

    return {
        id,
        _id: item._id || id,
        text,
        note: text,
        completed,
        table_id: item.table_id || '',
        order_id: item.order_id || '',
        time,
        createdAt: item.createdAt || new Date().toISOString()
    };
};

export const useNotes = () => {
    const queryClient = useQueryClient();
    const QUERY_KEY = ['restaurant_notes'];

    // 1. Fetch notes from live API
    const { data: notes = [], isLoading, isError, refetch } = useQuery({
        queryKey: QUERY_KEY,
        queryFn: async () => {
            try {
                const response = await notesService.getNotes();
                const rawList = Array.isArray(response) 
                    ? response 
                    : (response?.data?.notes || response?.data || response?.notes || []);
                const normalized = rawList.map(normalizeNote).filter(Boolean);
                // Cache locally for resilient offline access
                try {
                    localStorage.setItem('pos_notes', JSON.stringify(normalized));
                } catch {}
                return normalized;
            } catch (err) {
                console.warn('Notes API unreachable, loading cached notes:', err);
                const local = localStorage.getItem('pos_notes');
                if (local) {
                    try {
                        return JSON.parse(local).map(normalizeNote).filter(Boolean);
                    } catch {}
                }
                return [];
            }
        },
        staleTime: 1000 * 20, // 20 seconds
    });

    // 2. Add new note mutation with optimistic update
    const addNote = useMutation({
        mutationFn: async (notePayload) => {
            const payload = typeof notePayload === 'string' 
                ? { note: notePayload } 
                : notePayload;
            return await notesService.createNote(payload);
        },
        onMutate: async (notePayload) => {
            // Cancel outgoing queries so they do not overwrite optimistic insertion
            await queryClient.cancelQueries({ queryKey: QUERY_KEY });
            
            // Snapshot previous state
            const previousNotes = queryClient.getQueryData(QUERY_KEY) || [];
            
            const text = typeof notePayload === 'string' 
                ? notePayload 
                : (notePayload.note || notePayload.text || '');
            const table_id = typeof notePayload === 'object' ? (notePayload.table_id || '') : '';
            const order_id = typeof notePayload === 'object' ? (notePayload.order_id || '') : '';
            
            const now = new Date();
            const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            
            // Construct optimistic note item
            const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
            const optimisticNote = {
                id: tempId,
                _id: tempId,
                text,
                note: text,
                completed: false,
                table_id,
                order_id,
                time: timeString,
                createdAt: now.toISOString(),
                isOptimistic: true
            };
            
            // Optimistically insert at top of list immediately
            queryClient.setQueryData(QUERY_KEY, (old = []) => [optimisticNote, ...old]);
            
            return { previousNotes, tempId };
        },
        onError: (err, notePayload, context) => {
            // Roll back to previous notes snapshot on error
            if (context?.previousNotes) {
                queryClient.setQueryData(QUERY_KEY, context.previousNotes);
            }
            toast.error(err.message || "Failed to add note.");
        },
        onSuccess: (data, notePayload, context) => {
            // Replace temporary note with confirmed backend data if available
            const created = data?.data?.note || data?.data || data?.note;
            if (created && context?.tempId) {
                const normalized = normalizeNote(created);
                queryClient.setQueryData(QUERY_KEY, (old = []) => 
                    old.map(n => (n.id === context.tempId || n._id === context.tempId) ? normalized : n)
                );
            }
        },
        onSettled: () => {
            // Background sync with server
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        }
    });

    // 3. Toggle note completion status with optimistic update
    const toggleNoteStatus = useMutation({
        mutationFn: async (arg) => {
            const id = typeof arg === 'object' ? arg.id : arg;
            const currentNote = notes.find(n => n.id === id || n._id === id);
            const nextCompleted = typeof arg === 'object' && arg.completed !== undefined 
                ? arg.completed 
                : !(currentNote?.completed);

            return await notesService.updateNote(id, {
                completed: nextCompleted,
                note: currentNote?.text || currentNote?.note
            });
        },
        onMutate: async (arg) => {
            const id = typeof arg === 'object' ? arg.id : arg;
            await queryClient.cancelQueries({ queryKey: QUERY_KEY });
            const previousNotes = queryClient.getQueryData(QUERY_KEY);
            queryClient.setQueryData(QUERY_KEY, (old = []) => 
                old.map(n => (n.id === id || n._id === id) ? { ...n, completed: !n.completed } : n)
            );
            return { previousNotes };
        },
        onError: (err, variables, context) => {
            if (context?.previousNotes) {
                queryClient.setQueryData(QUERY_KEY, context.previousNotes);
            }
            toast.error(err.message || "Failed to update note status.");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        }
    });

    // 4. Delete note mutation with optimistic update
    const deleteNote = useMutation({
        mutationFn: async (noteId) => {
            return await notesService.deleteNote(noteId);
        },
        onMutate: async (noteId) => {
            await queryClient.cancelQueries({ queryKey: QUERY_KEY });
            const previousNotes = queryClient.getQueryData(QUERY_KEY);
            queryClient.setQueryData(QUERY_KEY, (old = []) => 
                old.filter(n => n.id !== noteId && n._id !== noteId)
            );
            return { previousNotes };
        },
        onError: (err, variables, context) => {
            if (context?.previousNotes) {
                queryClient.setQueryData(QUERY_KEY, context.previousNotes);
            }
            toast.error(err.message || "Failed to delete note.");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEY });
            toast.success("Note removed");
        }
    });

    return {
        notes,
        isLoading,
        isError,
        refetch,
        addNote,
        toggleNoteStatus,
        deleteNote
    };
};
