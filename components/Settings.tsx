
import React, { useState } from 'react';
import type { Settings } from '../types';

interface SettingsProps {
    settings: Settings;
    onSettingsChange: (settings: Settings) => void;
}

export const SettingsComponent: React.FC<SettingsProps> = ({ settings, onSettingsChange }) => {
    const [keywordsInput, setKeywordsInput] = useState(settings.keywords.join(', '));

    const handleKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setKeywordsInput(e.target.value);
        const keywordsArray = e.target.value.split(',').map(k => k.trim()).filter(Boolean);
        onSettingsChange({ ...settings, keywords: keywordsArray });
    };

    return (
        <div className="space-y-4 p-2 bg-gray-900/50 rounded-md">
            <div>
                <label htmlFor="tone" className="block text-sm font-medium text-gray-400">Preferred Tone</label>
                <input
                    type="text"
                    id="tone"
                    value={settings.tone}
                    onChange={(e) => onSettingsChange({ ...settings, tone: e.target.value })}
                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>
            <div>
                <label htmlFor="knowledge" className="block text-sm font-medium text-gray-400">My Knowledge Base</label>
                <textarea
                    id="knowledge"
                    rows={4}
                    value={settings.knowledgeBase}
                    onChange={(e) => onSettingsChange({ ...settings, knowledgeBase: e.target.value })}
                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Add facts, acronyms, or specific knowledge..."
                />
            </div>
             <div>
                <label htmlFor="keywords" className="block text-sm font-medium text-gray-400">Keyword Alerts (comma-separated)</label>
                <input
                    type="text"
                    id="keywords"
                    value={keywordsInput}
                    onChange={handleKeywordsChange}
                    className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="e.g., project deadline, follow-up"
                />
            </div>
        </div>
    );
};
