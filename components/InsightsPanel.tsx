
import React, { useState } from 'react';
import type { Insight, Settings } from '../types';
import { SettingsComponent } from './Settings';
import { SearchIcon } from './Icons';

interface InsightsPanelProps {
    insights: Insight;
    settings: Settings;
    onSettingsChange: (settings: Settings) => void;
    onSummarize: () => void;
    onExport: () => void;
    onFactCheck: (entity: string) => void;
    isLoading: boolean;
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({
    insights,
    settings,
    onSettingsChange,
    onSummarize,
    onExport,
    onFactCheck,
    isLoading
}) => {
    const [showSettings, setShowSettings] = useState(false);

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col h-[calc(100vh-150px)]">
            <h2 className="text-lg font-semibold text-white mb-3 border-b border-gray-700 pb-2">Context & Insights</h2>
            <div className="flex-grow overflow-y-auto pr-2">
                <div className="mb-4">
                    <h3 className="font-semibold text-indigo-400 mb-2">Summary</h3>
                    <p className="text-gray-400 text-sm">{insights.summary || 'Summary will appear here.'}</p>
                </div>
                <div>
                    <h3 className="font-semibold text-indigo-400 mb-2">Key Entities</h3>
                    {insights.entities.length > 0 ? (
                        <ul className="flex flex-wrap gap-2">
                            {insights.entities.map((entity, index) => (
                                <li key={index} className="flex items-center bg-gray-700 text-sm text-gray-300 rounded-full px-3 py-1">
                                    {entity}
                                    <button onClick={() => onFactCheck(entity)} className="ml-2 text-gray-400 hover:text-white">
                                        <SearchIcon className="w-4 h-4" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 text-sm">No entities identified yet.</p>
                    )}
                </div>
                <div className="mt-4 border-t border-gray-700 pt-4">
                     <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="text-indigo-400 hover:text-indigo-300 font-semibold w-full text-left mb-2"
                    >
                        {showSettings ? 'Hide Settings ▼' : 'Show Settings ►'}
                    </button>
                    {showSettings && (
                       <SettingsComponent settings={settings} onSettingsChange={onSettingsChange} />
                    )}
                </div>
            </div>
            <div className="flex-shrink-0 border-t border-gray-700 pt-3 flex items-center gap-2">
                <button
                    onClick={onSummarize}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-md disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                >
                    {isLoading ? 'Updating...' : 'Update Insights'}
                </button>
                <button
                    onClick={onExport}
                    className="flex-1 px-4 py-2 text-sm bg-gray-600 hover:bg-gray-700 rounded-md transition-colors"
                >
                    Export Transcript
                </button>
            </div>
        </div>
    );
};
