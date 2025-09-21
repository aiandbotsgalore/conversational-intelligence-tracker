
import React from 'react';
import type { FactCheckResult } from '../types';
import { XIcon, LinkIcon } from './Icons';

interface FactCheckModalProps {
    result: FactCheckResult;
    onClose: () => void;
}

export const FactCheckModal: React.FC<FactCheckModalProps> = ({ result, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white">Fact Check: <span className="text-indigo-400">{result.entity}</span></h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    <h3 className="font-semibold text-lg text-gray-200 mb-2">Summary</h3>
                    <p className="text-gray-400 whitespace-pre-wrap">{result.summary}</p>
                    
                    <h3 className="font-semibold text-lg text-gray-200 mt-6 mb-3">Sources</h3>
                    {result.sources.length > 0 ? (
                        <ul className="space-y-2">
                            {result.sources.map((source, index) => (
                                <li key={index}>
                                    <a 
                                      href={source.uri} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      className="flex items-center text-blue-400 hover:text-blue-300 hover:underline"
                                    >
                                        <LinkIcon className="w-4 h-4 mr-2 flex-shrink-0"/>
                                        <span className="truncate">{source.title || source.uri}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">No web sources were found for this summary.</p>
                    )}
                </div>
                 <div className="p-4 border-t border-gray-700 text-right">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
