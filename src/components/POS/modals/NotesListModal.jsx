import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useNotes } from '../../../hooks/queries/useNotes';

const NotesListModal = ({ isOpen, onClose, activeTableId = '' }) => {
    const { notes, isLoading, addNote, toggleNoteStatus, deleteNote } = useNotes();
    const [inputValue, setInputValue] = useState('');

    if (!isOpen) return null;

    const handleAddNote = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;
        addNote.mutate({
            note: inputValue.trim(),
            table_id: activeTableId || undefined
        });
        setInputValue('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-8 pt-8 pb-6 flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-1">Notes List</h2>
                        <p className="text-[13px] text-gray-500 font-medium">Keep service and kitchen notes in one place.</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full p-2 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Input Area */}
                <div className="px-8 pb-6">
                    <form onSubmit={handleAddNote} className="relative">
                        <input 
                            type="text"
                            placeholder={activeTableId ? `Add note (tagged Table ${activeTableId})...` : "Add a note for the team..."}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="w-full pl-5 pr-32 py-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-[14px] text-gray-700 placeholder-gray-400"
                        />
                        <button 
                            type="submit"
                            disabled={!inputValue.trim()}
                            className="absolute right-1.5 top-1.5 bottom-1.5 px-6 rounded-[9px] bg-gradient-to-r from-[#8B206F] to-[#D32F2F] text-white text-[13px] font-medium transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
                        >
                            <span>Add note</span>
                        </button>
                    </form>
                </div>

                {/* Notes List */}
                <div className="px-8 pb-8 flex-1 overflow-y-auto max-h-[400px]">
                    <div className="flex flex-col">
                        {isLoading ? (
                            <div className="py-8 space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-4 animate-pulse">
                                        <div className="w-5 h-5 bg-gray-200 rounded-[5px]"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                            <div className="h-3 bg-gray-100 rounded w-1/4"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : notes.length === 0 ? (
                            <p className="text-center text-gray-400 py-8 text-sm">No notes available.</p>
                        ) : (
                            notes.map((note, index) => (
                                <div 
                                    key={note.id || note._id} 
                                    className={`flex items-start gap-4 py-4 ${index !== notes.length - 1 ? 'border-b border-gray-100/80' : ''}`}
                                >
                                    {/* Custom Checkbox */}
                                    <button 
                                        onClick={() => toggleNoteStatus.mutate(note.id || note._id)}
                                        className={`mt-1 flex-shrink-0 w-5 h-5 rounded-[5px] flex items-center justify-center transition-all ${
                                            note.completed 
                                            ? 'bg-gradient-to-br from-[#8B206F] to-[#A817FB] border-none' 
                                            : 'bg-white border-[1.5px] border-gray-300 hover:border-gray-400'
                                        }`}
                                    >
                                        {note.completed && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                                    </button>

                                    {/* Note Content */}
                                    <div className="flex-1 flex flex-col justify-center min-h-[28px]">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className={`text-[14px] leading-snug transition-colors ${
                                                note.completed ? 'text-gray-400 line-through' : 'text-gray-700 font-medium'
                                            }`}>
                                                {note.text || note.note}
                                            </p>
                                            {note.table_id && !((note.text || note.note || '').toLowerCase().includes(`table ${note.table_id}`.toLowerCase())) && (
                                                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-purple-50 text-purple-700 rounded border border-purple-200">
                                                    Table {note.table_id}
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[11px] text-gray-400 font-medium mt-1">
                                            {note.time}
                                        </span>
                                    </div>

                                    {/* Delete Button */}
                                    <button 
                                        onClick={() => deleteNote.mutate(note.id || note._id)}
                                        className="mt-1 flex-shrink-0 p-1 text-gray-300 hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotesListModal;
