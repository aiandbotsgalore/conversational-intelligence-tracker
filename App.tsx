
import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Settings, SuggestedReply, Insight, TranscriptChunk, FactCheckResult } from './types';
import { getInsightsAndReplies, factCheckWithGemini } from './services/geminiService';
import { Header } from './components/Header';
import { TranscriptPanel } from './components/TranscriptPanel';
import { RepliesPanel } from './components/RepliesPanel';
import { InsightsPanel } from './components/InsightsPanel';
import { FactCheckModal } from './components/FactCheckModal';
import useSpeechRecognition from './hooks/useSpeechRecognition';

export default function App() {
    const [isListening, setIsListening] = useState<boolean>(false);
    const [transcript, setTranscript] = useState<TranscriptChunk[]>([]);
    const [suggestedReplies, setSuggestedReplies] = useState<SuggestedReply[]>([]);
    const [insights, setInsights] = useState<Insight>({ summary: '', entities: [] });
    const [settings, setSettings] = useState<Settings>({
        tone: 'helpful and concise',
        knowledgeBase: '',
        keywords: [],
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [factCheckModalContent, setFactCheckModalContent] = useState<FactCheckResult | null>(null);

    const insightUpdateTimeout = useRef<NodeJS.Timeout | null>(null);
    
    const updateInsightsAndReplies = useCallback(async () => {
        const fullTranscriptText = transcript.map(t => `${t.speaker}: ${t.text}`).join('\n');
        if (transcript.length === 0 || !fullTranscriptText) return;
        setIsLoading(true);
        setError(null);
        try {
            const result = await getInsightsAndReplies(fullTranscriptText, settings);
            if (result) {
                setInsights({ summary: result.summary, entities: result.entities || [] });
                setSuggestedReplies(result.suggestedReplies || []);
            }
        } catch (e: any) {
            setError(`Failed to get insights from AI: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [transcript, settings]);
    
    const updateInsightsAndRepliesRef = useRef(updateInsightsAndReplies);
    useEffect(() => {
        updateInsightsAndRepliesRef.current = updateInsightsAndReplies;
    }, [updateInsightsAndReplies]);


    const handleNewTranscript = useCallback((text: string) => {
        if (!text) return;

        const PAUSE_THRESHOLD_MS = 2500; // 2.5 seconds for speaker change

        setTranscript(prev => {
            const now = new Date();
            const lastChunk = prev.length > 0 ? prev[prev.length - 1] : null;
            const uniqueId = `chunk-${now.getTime()}-${Math.random()}`;

            if (lastChunk) {
                const pauseDuration = now.getTime() - lastChunk.timestamp.getTime();

                if (pauseDuration > PAUSE_THRESHOLD_MS) {
                    // Long pause: switch speaker and create a new chunk.
                    const newSpeaker = lastChunk.speaker === 'Speaker 1' ? 'Speaker 2' : 'Speaker 1';
                    const newChunk: TranscriptChunk = { id: uniqueId, text, speaker: newSpeaker, timestamp: now };
                    return [...prev, newChunk];
                } else {
                    // Short pause: assume same speaker, append text to the last chunk.
                    const updatedLastChunk: TranscriptChunk = {
                        ...lastChunk,
                        text: `${lastChunk.text} ${text}`.trim(),
                        timestamp: now,
                    };
                    return [...prev.slice(0, -1), updatedLastChunk];
                }
            } else {
                // First chunk of the conversation.
                const newChunk: TranscriptChunk = { id: uniqueId, text, speaker: 'Speaker 1', timestamp: now };
                return [newChunk];
            }
        });

        if (insightUpdateTimeout.current) {
            clearTimeout(insightUpdateTimeout.current);
        }

        insightUpdateTimeout.current = setTimeout(() => {
            updateInsightsAndRepliesRef.current();
        }, 5000); // Increased debounce to 5s to reduce API calls

    }, []);

    const { startListening, stopListening, error: recognitionError } = useSpeechRecognition(handleNewTranscript);

    useEffect(() => {
        if (recognitionError) {
            setError(`Speech Recognition Error: ${recognitionError}`);
            setIsListening(false);
        }
    }, [recognitionError]);
    
    const handleToggleListening = () => {
        if (isListening) {
            stopListening();
            setIsListening(false);
            if (insightUpdateTimeout.current) clearTimeout(insightUpdateTimeout.current);
        } else {
            setTranscript([]);
            setInsights({ summary: '', entities: [] });
            setSuggestedReplies([]);
            setError(null);
            startListening().then(() => setIsListening(true)).catch(err => {
                setError(`Could not start listening: ${err.message}. Please grant microphone permissions.`);
            });
        }
    };
    
    const handleChangeChunkSpeaker = (chunkId: string) => {
        setTranscript(prev =>
            prev.map(chunk => {
                if (chunk.id === chunkId) {
                    return {
                        ...chunk,
                        speaker: chunk.speaker === 'Speaker 1' ? 'Speaker 2' : 'Speaker 1',
                    };
                }
                return chunk;
            })
        );
    };

    const handleFactCheck = async (entity: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await factCheckWithGemini(entity);
            setFactCheckModalContent({ entity, ...result });
        } catch (e: any) {
            setError(`Fact check failed: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = () => {
        const data = {
            transcript,
            insights,
            suggestedReplies,
            settings,
            createdAt: new Date().toISOString(),
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `conversation_${new Date().getTime()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '9') {
                e.preventDefault();
                const index = parseInt(e.key) - 1;
                if (suggestedReplies[index]) {
                    navigator.clipboard.writeText(suggestedReplies[index].reply);
                    // Add a visual feedback if possible
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [suggestedReplies]);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 font-sans flex flex-col">
            <Header isListening={isListening} onToggleListening={handleToggleListening} />
            {error && <div className="bg-red-800 text-white p-3 text-center">{error}</div>}
            <main className="flex-grow p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
                <TranscriptPanel 
                    transcript={transcript} 
                    keywords={settings.keywords}
                    onChangeChunkSpeaker={handleChangeChunkSpeaker} 
                />
                <RepliesPanel replies={suggestedReplies} isLoading={isLoading} />
                <InsightsPanel
                    insights={insights}
                    settings={settings}
                    onSettingsChange={setSettings}
                    onSummarize={updateInsightsAndReplies}
                    onExport={handleExport}
                    onFactCheck={handleFactCheck}
                    isLoading={isLoading}
                />
            </main>
            {factCheckModalContent && (
                <FactCheckModal
                    result={factCheckModalContent}
                    onClose={() => setFactCheckModalContent(null)}
                />
            )}
        </div>
    );
}
