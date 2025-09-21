
import React from 'react';
import type { SuggestedReply } from '../types';
import { ClipboardIcon } from './Icons';

interface RepliesPanelProps {
    replies: SuggestedReply[];
    isLoading: boolean;
}

const ReplyCard: React.FC<{ reply: SuggestedReply; index: number }> = ({ reply, index }) => {
    const copyToClipboard = () => {
        navigator.clipboard.writeText(reply.reply);
    };

    const confidenceColor = reply.confidence > 0.8 ? 'text-green-400' : reply.confidence > 0.6 ? 'text-yellow-400' : 'text-red-400';
    
    return (
        <div className="bg-gray-700 p-3 rounded-md mb-3 transition-transform duration-200 hover:scale-[1.02]">
            <div className="flex justify-between items-start">
                <p className="text-gray-300 mr-4">{reply.reply}</p>
                <div className="flex items-center flex-shrink-0">
                    <button onClick={copyToClipboard} className="text-gray-400 hover:text-white mr-3">
                        <ClipboardIcon className="w-5 h-5" />
                    </button>
                    <span className={`text-xs font-mono p-1 rounded ${confidenceColor}`}>
                        {Math.round(reply.confidence * 100)}%
                    </span>
                </div>
            </div>
            <div className="text-xs text-gray-500 font-mono mt-2">
                Hotkey: <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">Ctrl/Cmd</kbd> + <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">{index + 1}</kbd>
            </div>
        </div>
    );
};


export const RepliesPanel: React.FC<RepliesPanelProps> = ({ replies, isLoading }) => {
    return (
        <div className="bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col h-[calc(100vh-150px)]">
            <h2 className="text-lg font-semibold text-white mb-3 border-b border-gray-700 pb-2">Suggested Replies</h2>
            <div className="flex-grow overflow-y-auto pr-2">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>Generating suggestions...</p>
                    </div>
                ) : replies.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                         <p>No replies generated yet. Start a conversation.</p>
                    </div>
                ) : (
                    replies.map((reply, index) => <ReplyCard key={index} reply={reply} index={index} />)
                )}
            </div>
        </div>
    );
};
