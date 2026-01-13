
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { Build, ClassName, SpecName, ItemStats, Item } from '../types';
import { calculateTotalStats } from '../services/gearService';

interface ArchmageChatProps {
    equipped: Build;
    currentClass: ClassName;
    spec: SpecName;
    activeBuffs: string[];
    talentStats: ItemStats;
}

interface Message {
    role: 'user' | 'model';
    text: string;
}

export const ArchmageChat: React.FC<ArchmageChatProps> = ({ equipped, currentClass, spec, activeBuffs, talentStats }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', text: "Greetings, hero. I am the Archmage. Ask me about your gear, stats, or optimal loadouts." }
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatSessionRef = useRef<Chat | null>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen]);

    // Initialize Chat Session (Lazy)
    const getChatSession = async () => {
        if (chatSessionRef.current) return chatSessionRef.current;

        // @ts-ignore: Process env injected by framework
        const apiKey = process.env.API_KEY || "";
        const ai = new GoogleGenAI({ apiKey });

        const session = ai.chats.create({
            model: 'gemini-3-flash-preview',
            config: {
                systemInstruction: "You are the Archmage, a wise and slightly arrogant theorycrafting expert for World of Warcraft Classic (Vanilla). You help players optimize their gear. You are concise, helpful, but speak with a magical flair. You have access to the player's current gear context.",
            }
        });
        chatSessionRef.current = session;
        return session;
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isThinking) return;

        const userMsg = inputValue;
        setInputValue("");
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsThinking(true);

        try {
            const session = await getChatSession();
            
            // Build Context Payload
            const stats = calculateTotalStats(equipped, activeBuffs, talentStats);
            const gearList = Object.entries(equipped).map(([slot, item]: [string, Item | undefined]) => 
                item ? `${slot}: ${item.name} ${item.enchant ? `(Enchant: ${item.enchant.name})` : ''}` : `${slot}: Empty`
            ).join('\n');

            const contextPrompt = `
            [CURRENT CONTEXT UPDATE]
            Class: ${currentClass}
            Spec: ${spec}
            Active Buffs: ${activeBuffs.join(', ') || 'None'}
            
            Current Stats:
            Spell Power: ${stats.sp}
            Hit: ${stats.hit}%
            Crit: ${stats.crit}%
            Int: ${stats.int}
            Stam: ${stats.stam}
            
            Equipped Gear:
            ${gearList}
            
            [USER QUESTION]
            ${userMsg}
            `;

            const response = await session.sendMessage({ message: contextPrompt });
            
            if (response.text) {
                setMessages(prev => [...prev, { role: 'model', text: response.text }]);
            }
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, { role: 'model', text: "The arcane currents are turbulent... I cannot answer right now." }]);
        } finally {
            setIsThinking(false);
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
            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-[0_0_20px_rgba(163,53,238,0.5)] border border-[#a335ee] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group bg-[#0f0f12] overflow-hidden`}
                title="Ask the Archmage"
            >
                {/* Arcane Orb Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#a335ee]/20 to-transparent"></div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#a335ee]/40 via-transparent to-transparent"></div>
                <span className="text-2xl z-10 group-hover:animate-pulse">🔮</span>
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-[380px] h-[500px] bg-[#0f0f12] border border-[#a335ee]/50 rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
                    
                    {/* Header */}
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

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-[#0a0a0c] scrollbar-thin scrollbar-thumb-[#333] scrollbar-track-transparent">
                        {messages.map((msg, idx) => (
                            <div 
                                key={idx} 
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div 
                                    className={`max-w-[85%] rounded-lg p-3 text-xs leading-relaxed whitespace-pre-wrap ${
                                        msg.role === 'user' 
                                            ? 'bg-[#a335ee]/20 border border-[#a335ee]/30 text-[#e2e8f0] rounded-br-none' 
                                            : 'bg-[#1f1f22] border border-[#333] text-[#a1a1aa] rounded-bl-none'
                                    }`}
                                >
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

                    {/* Input Area */}
                    <div className="p-3 bg-[#1a1a1d] border-t border-[#333]">
                        <div className="relative">
                            <textarea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about your build..."
                                className="w-full bg-[#0f0f12] border border-[#333] rounded-md pl-3 pr-10 py-2 text-xs text-[#e2e8f0] focus:outline-none focus:border-[#a335ee] resize-none h-10 scrollbar-none"
                            />
                            <button 
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim() || isThinking}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#a335ee] hover:text-white disabled:opacity-30 disabled:hover:text-[#a335ee] transition-colors"
                            >
                                ➤
                            </button>
                        </div>
                        <div className="text-[9px] text-[#444] text-center mt-1 font-mono">
                            Press Enter to send
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
