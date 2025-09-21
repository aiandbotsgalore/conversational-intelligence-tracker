
import { useState, useRef, useCallback, useEffect } from 'react';

// Global types for the Web Speech API, which are not included in standard TypeScript DOM libraries.
declare global {
    interface SpeechRecognitionAlternative {
        readonly transcript: string;
        readonly confidence: number;
    }

    interface SpeechRecognitionResult {
        readonly isFinal: boolean;
        readonly length: number;
        item(index: number): SpeechRecognitionAlternative;
        [index: number]: SpeechRecognitionAlternative;
    }

    interface SpeechRecognitionResultList {
        readonly length: number;
        item(index: number): SpeechRecognitionResult;
        [index: number]: SpeechRecognitionResult;
    }

    interface SpeechRecognitionErrorEvent extends Event {
        readonly error: string;
        readonly message: string;
    }

    interface SpeechRecognitionEvent extends Event {
        readonly resultIndex: number;
        readonly results: SpeechRecognitionResultList;
    }

    interface SpeechRecognition extends EventTarget {
        continuous: boolean;
        interimResults: boolean;
        lang: string;
        onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
        onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
        onend: ((this: SpeechRecognition, ev: Event) => any) | null;
        start(): void;
        stop(): void;
    }
    
    interface SpeechRecognitionStatic {
        new (): SpeechRecognition;
    }

    interface Window {
        SpeechRecognition: SpeechRecognitionStatic;
        webkitSpeechRecognition: SpeechRecognitionStatic;
    }
}

const useSpeechRecognition = (onTranscript: (transcript: string) => void) => {
    const [error, setError] = useState<string | null>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    // Use a ref to hold the latest onTranscript callback.
    // This prevents the main useEffect from re-running when the callback changes,
    // which would otherwise reinstantiate the SpeechRecognition object.
    const onTranscriptRef = useRef(onTranscript);
    useEffect(() => {
        onTranscriptRef.current = onTranscript;
    }, [onTranscript]);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError('Speech recognition not supported in this browser.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            if (finalTranscript) {
                onTranscriptRef.current(finalTranscript.trim());
            }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            setError(event.error);
        };

        recognition.onend = () => {
            // It will only restart if it was intentionally started and not explicitly stopped.
            if (streamRef.current && recognitionRef.current) {
                try {
                   recognitionRef.current.start();
                } catch(e) {
                    // This can happen if stop was called, then onend fires. It's safe to ignore.
                }
            }
        };
        
        recognitionRef.current = recognition;
        
        return () => {
          if (recognitionRef.current) {
              recognitionRef.current.onend = null; // prevent restart on unmount
              recognitionRef.current.stop();
          }
          if (streamRef.current) {
              streamRef.current.getTracks().forEach(track => track.stop());
          }
          if(audioContextRef.current && audioContextRef.current.state !== 'closed') {
              audioContextRef.current.close();
          }
        };
    }, []); // onTranscript is removed from deps, the ref handles updates.

    const startListening = useCallback(async () => {
        if (recognitionRef.current) {
            try {
                // Capture audio from the user's microphone instead of system audio
                // to avoid permissions policy issues with getDisplayMedia.
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                });
                
                streamRef.current = stream;

                // Use an AudioContext to process the stream without playing it back.
                const audioContext = new AudioContext();
                audioContextRef.current = audioContext;
                const source = audioContext.createMediaStreamSource(stream);
                // By not connecting the source to a destination, we prevent audio feedback.
                
                recognitionRef.current.start();
                setError(null);
                
            } catch (err: any) {
                setError(`Microphone access denied or error: ${err.message}`);
                throw err;
            }
        }
    }, []);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.onend = null; // prevent automatic restart
            recognitionRef.current.stop();
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
    }, []);

    return { startListening, stopListening, error };
};

export default useSpeechRecognition;
