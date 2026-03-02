
import React, { useState, useRef, useEffect, memo } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { Build, ClassName, SpecName, ItemStats, Item, RaceName } from '../types';
import { calculateTotalStats } from '../services/gearService';
import { RACIAL_STATS } from '../constants';

interface ArchmageChatProps {
    equipped: Build;
    currentClass: ClassName;
    spec: SpecName;
    activeBuffs: string[];
    talentStats: ItemStats;
    race: RaceName;
}

interface Message {
    role: 'user' | 'model';
    text: string;
}

const ArchmageChatComponent: React.FC<ArchmageChatProps> = ({ equipped, currentClass, spec, activeBuffs, talentStats, race }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', text: "Greetings, hero. I am the Archmage. Ask me about your gear, stats, or optimal loadouts." }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const [cooldown, setCooldown] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatSessionRef = useRef<Chat | null>(null);

    // Auto-scroll
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen]);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
    const hasApiKey = apiKey.length > 0;

    const getChatSession = async () => {
        if (chatSessionRef.current) return chatSessionRef.current;
        if (!hasApiKey) throw new Error("No API key configured");
        const ai = new GoogleGenAI({ apiKey });
        const session = ai.chats.create({
            model: 'gemini-2.0-flash',
            config: {
                systemInstruction: "You are the Archmage, a wise theorycrafting expert for WoW Classic. Be concise.",
            }
        });
        chatSessionRef.current = session;
        return session;
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isThinking || cooldown) return;

        const userMsg = inputValue;
        setInputValue("");
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsThinking(true);

        try {
            const session = await getChatSession();
            
            // Calculate context ONLY when sending a message
            const racialStats = RACIAL_STATS[race] || {};
            const stats = calculateTotalStats(equipped, activeBuffs, talentStats, racialStats);
            const gearList = Object.entries(equipped).map(([slot, item]: [string, Item | undefined]) => 
                item ? `${slot}: ${item.name} ${item.enchant ? `(Enchant: ${item.enchant.name})` : ''}` : `${slot}: Empty`
            ).join('\n');

            const contextPrompt = `
            [CONTEXT]
            Class: ${currentClass} | Spec: ${spec} | Race: ${race}
            Stats: SP ${stats.sp}, Hit ${stats.hit}%, Crit ${stats.crit}%, Int ${stats.int}, Stam ${stats.stam}
            Gear:
            ${gearList}
            
            [QUESTION]
            ${userMsg}
            `;

            const response = await session.sendMessage({ message: contextPrompt });
            
            if (response.text) {
                setMessages(prev => [...prev, { role: 'model', text: response.text }]);
            }
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, { role: 'model', text: "The arcane currents are turbulent..." }]);
        } finally {
            setIsThinking(false);
            setCooldown(true);
            setTimeout(() => setCooldown(false), 3000);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-[0_0_20px_rgba(163,53,238,0.5)] border border-[#a335ee] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group bg-[#0f0f12] overflow-hidden"
                title="Ask the Archmage"
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-[#a335ee]/20 to-transparent"></div>
                <span className="text-2xl z-10 group-hover:animate-pulse">🔮</span>
            </button>

            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-[380px] h-[500px] bg-[#0f0f12] border border-[#a335ee]/50 rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
                    <div className="bg-[#1a1a1d] px-4 py-3 border-b border-[#a335ee]/30 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="text-xl">🧙‍♂️</span>
                            <div>
                                <h3 className="text-[#a335ee] font-cinzel font-bold text-sm tracking-widest">THE ARCHMAGE</h3>
                                <div className="flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse"></div>
                                    <span className="text-[9px] text-[#666] font-bold tracking-wide">ONLINE</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-[#666] hover:text-white transition-colors">✕</button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-[#0a0a0c] scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent">
                        {!hasApiKey && (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center p-6">
                                    <span className="text-3xl mb-3 block opacity-40">🔮</span>
                                    <p className="text-[#666] text-xs font-bold tracking-wide mb-1">AI CHAT OFFLINE</p>
                                    <p className="text-[#444] text-[10px]">Set VITE_GEMINI_API_KEY in .env to enable</p>
                                </div>
                            </div>
                        )}
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-lg p-3 text-xs leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-[#a335ee]/20 border border-[#a335ee]/30 text-[#e2e8f0] rounded-br-none' : 'bg-[#1f1f22] border border-[#333] text-[#a1a1aa] rounded-bl-none'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isThinking && (
                            <div className="flex justify-start">
                                <div className="bg-[#1f1f22] border border-[#333] rounded-lg p-3 rounded-bl-none flex gap-1.5 items-center">
                                    <div className="w-1.5 h-1.5 bg-[#a335ee] rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-[#a335ee] rounded-full animate-bounce delay-100"></div>
                                    <div className="w-1.5 h-1.5 bg-[#a335ee] rounded-full animate-bounce delay-200"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-3 bg-[#1a1a1d] border-t border-[#333]">
                        <div className="relative">
                            <textarea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about your build..."
                                className="w-full bg-[#0f0f12] border border-[#333] rounded-md pl-3 pr-10 py-2 text-xs text-[#e2e8f0] focus:outline-none focus:border-[#a335ee] resize-none h-10 scrollbar-none"
                            />
                            <button onClick={handleSendMessage} disabled={!inputValue.trim() || isThinking || cooldown} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#a335ee] hover:text-white disabled:opacity-30 disabled:hover:text-[#a335ee] transition-colors">
                                {cooldown ? '⏳' : '➤'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// --- MEMOIZATION ---
// Removing custom comparison logic to avoid accessing internal state 'isOpen' on props.
// Default shallow comparison of props is sufficient.
export const ArchmageChat = memo(ArchmageChatComponent);
