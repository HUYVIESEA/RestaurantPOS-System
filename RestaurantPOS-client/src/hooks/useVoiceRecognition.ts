import { useState, useEffect, useRef, useCallback } from 'react';

// Extend the Window interface to include webkitSpeechRecognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export interface UseVoiceRecognitionResult {
  isListening: boolean;
  transcript: string;
  start: () => void;
  stop: () => void;
  reset: () => void;
  error: string | null;
  supported: boolean;
  finalTranscript: string;
}

export const useVoiceRecognition = (): UseVoiceRecognitionResult => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(false);

  // Use a ref to store the recognition instance
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true; // Keep listening
      recognitionRef.current.interimResults = true; // Real-time feedback
      recognitionRef.current.lang = 'vi-VN'; // Vietnamese

      recognitionRef.current.onstart = () => {
        console.log("🎤 Voice recognition STARTED");
        setIsListening(true);
        setError(null);
      };

      recognitionRef.current.onend = () => {
        console.log("🛑 Voice recognition ENDED");
        setIsListening(false);
      };

      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        console.log("👂 Heard:", { interim: interimTranscript, final: final });

        if (interimTranscript) setTranscript(interimTranscript);
        if (final) {
            setFinalTranscript(prev => {
                const newVal = prev + ' ' + final;
                console.log("📝 Final Transcript Updated:", newVal);
                return newVal;
            });
            setTranscript(''); 
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('⚠️ Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
            setError('Bạn chưa cấp quyền Micro. Vui lòng kiểm tra cài đặt trình duyệt.');
        } else if (event.error === 'no-speech') {
            // Ignore no-speech, just stays quiet
            return;
        } else {
             setError(`Lỗi: ${event.error}`);
        }
        // Don't always stop on error, sometimes it's recoverable
        if (event.error === 'aborted' || event.error === 'not-allowed') {
            setIsListening(false);
        }
      };
    } else {
      console.warn("❌ Browser does not support SpeechRecognition");
      setSupported(false);
      setError('Trình duyệt không hỗ trợ Web Speech API.');
    }

    return () => {
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch(e) {}
        }
    };
  }, []);

  const start = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setFinalTranscript('');
      setTranscript('');
      try {
        console.log("▶️ Attempting to START...");
        recognitionRef.current.start();
      } catch (err) {
        console.error("Failed to start recognition:", err);
      }
    }
  }, [isListening]);

  const stop = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        console.log("⏹️ Attempting to STOP...");
        recognitionRef.current.stop();
      } catch (err) {
         console.error("Failed to stop:", err);
      }
    }
  }, [isListening]);

  const reset = useCallback(() => {
    setFinalTranscript('');
    setTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    finalTranscript,
    start,
    stop,
    reset,
    error,
    supported
  };
};
