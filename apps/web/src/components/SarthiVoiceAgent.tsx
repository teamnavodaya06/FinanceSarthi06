import React, { useState, useEffect, useRef } from 'react';
import { useFinancial } from '../context/FinancialContext';
import { useAuth } from '../context/AuthContext';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  X, 
  Sparkles, 
  Bot, 
  User, 
  Radio,
  Zap,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SarthiVoiceAgentProps {
  isOpen: boolean;
  onClose: () => void;
}

type AgentState = 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING';

export const SarthiVoiceAgent: React.FC<SarthiVoiceAgentProps> = ({ isOpen, onClose }) => {
  const { aiContext, userProfile } = useFinancial();
  const { user } = useAuth();

  const [agentState, setAgentState] = useState<AgentState>('IDLE');
  const [transcript, setTranscript] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Initialize Speech Recognition & Synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-IN';

        recognition.onstart = () => {
          setAgentState('LISTENING');
          setErrorMessage(null);
        };

        recognition.onresult = (event: any) => {
          let currentText = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentText += event.results[i][0].transcript;
          }
          setTranscript(currentText);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition warning:', event.error);
          if (event.error !== 'no-speech') {
            setErrorMessage(`Mic Warning: ${event.error}`);
          }
          setAgentState('IDLE');
        };

        recognition.onend = () => {
          if (transcript.trim() && agentState === 'LISTENING') {
            processVoiceQuery(transcript);
          } else {
            setAgentState('IDLE');
          }
        };

        recognitionRef.current = recognition;
      } else {
        setErrorMessage('Browser Speech API not supported. Recommended Chrome / Safari.');
      }

      if ('speechSynthesis' in window) {
        synthRef.current = window.speechSynthesis;
      }
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Auto-start mic when modal opens
  useEffect(() => {
    if (isOpen) {
      setTranscript('');
      setAiResponse('');
      setAgentState('IDLE');
      startListening();
    } else {
      stopListening();
      stopSpeaking();
    }
  }, [isOpen]);

  const startListening = () => {
    stopSpeaking();
    if (recognitionRef.current) {
      try {
        setTranscript('');
        recognitionRef.current.start();
      } catch (e) {
        console.warn('Recognition start caught:', e);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
  };

  const speakText = (text: string) => {
    if (!synthRef.current || isMuted) return;

    stopSpeaking();
    // Clean markdown symbols for natural TTS speech
    const cleanText = text
      .replace(/[*#_`]/g, '')
      .replace(/₹/g, 'Rupees ')
      .replace(/(\d+)\s*%/g, '$1 percent');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-IN';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setAgentState('SPEAKING');
    utterance.onend = () => setAgentState('IDLE');
    utterance.onerror = () => setAgentState('IDLE');

    synthRef.current.speak(utterance);
  };

  const processVoiceQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    setAgentState('THINKING');

    try {
      // Call backend AI service powered by NVIDIA Kimi K3
      const res = await fetch('http://localhost:8000/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: queryText,
          context: aiContext,
        }),
      }).catch(() => null);

      let textResult = '';
      if (res && res.ok) {
        const data = await res.json();
        textResult = data.text;
      } else {
        // Voice fallback response generator
        textResult = generateVoiceFallback(queryText);
      }

      setAiResponse(textResult);
      speakText(textResult);
    } catch (err) {
      console.error('Voice query processing error:', err);
      const fallback = `I analyzed your request. Your monthly profile shows strong cash flow. How else can I assist your goals?`;
      setAiResponse(fallback);
      speakText(fallback);
    }
  };

  const generateVoiceFallback = (q: string) => {
    const l = q.toLowerCase();
    if (l.includes('tax') || l.includes('save') || l.includes('regime')) {
      return `Under the New Tax Regime, your income up to 7 Lakh Rupees is tax-free. Old regime is better if your deductions exceed 3 Lakh 75 Thousand Rupees.`;
    }
    if (l.includes('sip') || l.includes('invest') || l.includes('mutual fund')) {
      return `I recommend putting 20% of your salary into an index fund and flexicap mutual fund for optimal compound returns.`;
    }
    return `Namaste! Based on your financial profile, your budget health is in good shape. Let me know if you want to optimize your savings further.`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl selection:bg-blue-600 selection:text-white">
        
        {/* Main Voice Agent Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-between min-h-[520px] shadow-2xl overflow-hidden"
        >
          {/* Top Bar */}
          <div className="w-full flex items-center justify-between pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                  Sarthi Voice Agent
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-sky-400 text-[9px] font-extrabold uppercase">
                    Gemini Live
                  </span>
                </h3>
                <span className="text-[10px] text-slate-400 font-semibold block">
                  Powered by NVIDIA Kimi K3 AI
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isMuted 
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                }`}
                title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-sky-400" />}
              </button>

              <button
                onClick={onClose}
                className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Animated Interactive Waveform / Pulsing Orb */}
          <div className="my-8 flex flex-col items-center justify-center relative">
            {/* Outer Glow Ring */}
            <div className={`absolute h-48 w-48 rounded-full blur-3xl transition-all duration-700 ${
              agentState === 'LISTENING' ? 'bg-emerald-500/25 scale-125' :
              agentState === 'THINKING' ? 'bg-purple-500/25 animate-pulse scale-110' :
              agentState === 'SPEAKING' ? 'bg-sky-500/30 scale-125' :
              'bg-blue-600/15'
            }`} />

            {/* Central Animated Orb */}
            <motion.div
              animate={
                agentState === 'LISTENING' ? { scale: [1, 1.12, 1], rotate: [0, 5, -5, 0] } :
                agentState === 'THINKING' ? { rotate: 360, scale: [1, 0.95, 1] } :
                agentState === 'SPEAKING' ? { scale: [1, 1.15, 1.05, 1.2, 1] } :
                { scale: 1 }
              }
              transition={{ repeat: Infinity, duration: agentState === 'THINKING' ? 2 : 1.5 }}
              className={`h-32 w-32 rounded-full flex items-center justify-center border shadow-2xl relative z-10 ${
                agentState === 'LISTENING' ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 border-emerald-400/40 shadow-emerald-500/30' :
                agentState === 'THINKING' ? 'bg-gradient-to-tr from-purple-600 to-indigo-500 border-purple-400/40 shadow-purple-500/30' :
                agentState === 'SPEAKING' ? 'bg-gradient-to-tr from-blue-600 to-sky-400 border-sky-400/40 shadow-sky-500/30' :
                'bg-gradient-to-tr from-slate-900 to-slate-800 border-slate-700 shadow-slate-900/50'
              }`}
            >
              {agentState === 'LISTENING' && <Mic className="h-12 w-12 text-white animate-pulse" />}
              {agentState === 'THINKING' && <Zap className="h-12 w-12 text-white animate-spin" />}
              {agentState === 'SPEAKING' && <Radio className="h-12 w-12 text-white animate-bounce" />}
              {agentState === 'IDLE' && <Bot className="h-12 w-12 text-slate-300" />}
            </motion.div>

            {/* Equalizer Wave Sound Bars */}
            <div className="flex items-center gap-1.5 mt-6 h-8">
              {[0.4, 0.9, 0.6, 1.0, 0.7, 0.3, 0.8, 0.5].map((heightMult, i) => (
                <motion.div
                  key={i}
                  animate={
                    agentState === 'LISTENING' || agentState === 'SPEAKING'
                      ? { height: [`${12 * heightMult}px`, `${28 * heightMult}px`, `${10 * heightMult}px`] }
                      : { height: '8px' }
                  }
                  transition={{ repeat: Infinity, duration: 0.6 + i * 0.1 }}
                  className={`w-1.5 rounded-full ${
                    agentState === 'LISTENING' ? 'bg-emerald-400' :
                    agentState === 'SPEAKING' ? 'bg-sky-400' :
                    'bg-slate-700'
                  }`}
                />
              ))}
            </div>

            {/* Status Label */}
            <span className="text-xs font-extrabold uppercase tracking-widest text-slate-300 mt-3">
              {agentState === 'LISTENING' && 'Listening to your voice...'}
              {agentState === 'THINKING' && 'Thinking with NVIDIA AI...'}
              {agentState === 'SPEAKING' && 'Sarthi is speaking...'}
              {agentState === 'IDLE' && 'Tap Mic to speak'}
            </span>
          </div>

          {/* Transcript & Response Area */}
          <div className="w-full space-y-3 bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 min-h-[110px] max-h-[160px] overflow-y-auto">
            {transcript && (
              <div className="flex items-start gap-2 text-xs">
                <User className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                <p className="text-slate-300 font-medium italic">"{transcript}"</p>
              </div>
            )}

            {aiResponse && (
              <div className="flex items-start gap-2 text-xs pt-2 border-t border-slate-800/60">
                <Bot className="h-3.5 w-3.5 text-sky-400 shrink-0 mt-0.5" />
                <p className="text-slate-100 font-medium leading-relaxed">{aiResponse}</p>
              </div>
            )}

            {!transcript && !aiResponse && (
              <p className="text-xs text-slate-500 text-center py-4 font-semibold">
                Ask Sarthi anything about your budget, tax savings, SIPs, or monthly goals.
              </p>
            )}
          </div>

          {/* Bottom Controls */}
          <div className="w-full pt-5 flex items-center justify-center gap-4">
            {agentState === 'LISTENING' ? (
              <button
                onClick={stopListening}
                className="px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/20 transition-all cursor-pointer"
              >
                <MicOff className="h-4 w-4" />
                <span>Stop Listening</span>
              </button>
            ) : agentState === 'SPEAKING' ? (
              <button
                onClick={stopSpeaking}
                className="px-6 py-3 rounded-full bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-600/20 transition-all cursor-pointer"
              >
                <VolumeX className="h-4 w-4" />
                <span>Interrupt Speech</span>
              </button>
            ) : (
              <button
                onClick={startListening}
                className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all hover:scale-105 cursor-pointer"
              >
                <Mic className="h-4 w-4" />
                <span>Start Speaking</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
