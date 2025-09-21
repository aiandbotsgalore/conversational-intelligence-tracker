
import React, { useRef, useEffect } from 'react';
import type { TranscriptChunk } from '../types';
import { SwitchHorizontalIcon } from './Icons';

interface TranscriptPanelProps {
    transcript: TranscriptChunk[];
    keywords: string[];
    onChangeChunkSpeaker: (chunkId: string) => void;
}

const highlightKeywords = (text: string, keywords: string[]) => {
    if (!keywords.length) return <>{text}</>;
    const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
        regex.test(part) ? (
            <span key={i} className="bg-yellow-500 bg-opacity-30 text-yellow-300 font-semibold rounded px-1">
                {part}
            </span>
        ) : (
            part
        )
    );
};


export const TranscriptPanel: React.FC<TranscriptPanelProps> = ({ transcript, keywords, onChangeChunkSpeaker }) => {
    const endOfTranscriptRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endOfTranscriptRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript]);

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col h-[calc(100vh-150px)]">
            <h2 className="text-lg font-semibold text-white mb-3 border-b border-gray-700 pb-2">Live Transcript</h2>
            <div className="flex-grow overflow-y-auto pr-2">
                {transcript.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>Waiting for audio to begin...</p>
                    </div>
                ) : (
                    transcript.map((chunk) => (
                        <div key={chunk.id} className="mb-3 group">
                            <p className="text-sm font-bold text-indigo-400 flex items-center">
                                {chunk.speaker}
                                <button
                                    onClick={() => onChangeChunkSpeaker(chunk.id)}
                                    title="Switch Speaker"
                                    className="ml-2 text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200"
                                >
                                    <SwitchHorizontalIcon className="w-4 h-4" />
                                </button>
                            </p>
                            <p className="text-gray-300 whitespace-pre-wrap">
                                {highlightKeywords(chunk.text, keywords)}
                            </p>
                        </div>
                    ))
                )}
                <div ref={endOfTranscriptRef} />
            </div>
        </div>
    );
};
