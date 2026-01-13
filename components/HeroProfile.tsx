
import React, { useState, useEffect } from 'react';
import { ClassName } from '../types';
import { CLASS_CONFIG } from '../constants';

interface HeroProfileProps {
    currentClass: ClassName;
    setClass: (c: ClassName) => void;
    spec: string;
}

const HeroProfile: React.FC<HeroProfileProps> = ({ currentClass, setClass, spec }) => {
    const classData = CLASS_CONFIG[currentClass];
    
    // State to manage the active image source and loading status
    const [imgSrc, setImgSrc] = useState(classData.image);
    const [imgLoaded, setImgLoaded] = useState(false);

    // Reset when class changes
    useEffect(() => {
        setImgSrc(classData.image);
        setImgLoaded(false);
    }, [currentClass]);

    // Fallback handler: If the image fails, switch to a generated placeholder
    const handleError = () => {
        const colorHex = classData.color.replace('#', '');
        // Generates a dark placeholder with the class name in the class color
        setImgSrc(`https://placehold.co/400x800/050505/${colorHex}?text=${currentClass.toUpperCase()}&font=roboto`);
        setImgLoaded(true); // Force visibility
    };

    return (
        <aside className="w-full lg:w-[320px] shrink-0 bg-[#050505] border-r border-[#2d2d30] flex flex-col relative z-20 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
            
            {/* --- HERO IMAGE LAYER --- */}
            <div className="absolute inset-0 z-0 overflow-hidden bg-[#0a0a0c]">
                {/* Fallback Gradient (Visible while loading) */}
                <div 
                    className="absolute inset-0 opacity-20 transition-colors duration-700"
                    style={{ background: `radial-gradient(circle at 50% 20%, ${classData.color}, transparent 80%)` }}
                ></div>

                {/* Hero Image */}
                <img
                    key={currentClass} // Force re-mount on class change
                    src={imgSrc}
                    alt={currentClass}
                    onLoad={() => setImgLoaded(true)}
                    onError={handleError}
                    className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-700 ${imgLoaded ? 'opacity-90 grayscale-[20%]' : 'opacity-0'}`}
                />

                {/* Gradient Overlays for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0c]/80 via-transparent to-[#0a0a0c] opacity-90"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/40 to-transparent opacity-90"></div>
            </div>

            {/* --- CONTENT LAYER --- */}
            <div className="relative z-10 flex flex-col h-full p-8 justify-between">
                
                {/* Header / Branding */}
                <div className="text-center">
                    <h1 className="font-cinzel text-3xl text-[#FFD700] tracking-[0.2em] font-bold drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] border-b border-[#ffffff]/10 pb-5 mb-2">
                        BiS ARCHITECT
                    </h1>
                    <div className="text-[10px] text-[#888] font-cinzel tracking-[0.3em] uppercase opacity-70">
                        Sanctum of Shadows
                    </div>
                </div>

                {/* Center Badge (Optional Visual Anchor) */}
                <div className="flex-1 flex items-center justify-center opacity-0 lg:opacity-100 transition-opacity duration-700 pointer-events-none">
                     {/* Could put a faction emblem or class icon here in the future */}
                </div>

                {/* Footer Controls */}
                <div className="flex flex-col gap-5">
                    
                    {/* Active Spec Badge */}
                    <div className="flex justify-center">
                         <div className="bg-black/60 backdrop-blur-md border border-[#333] px-5 py-2 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                            <span className="text-[10px] text-[#aaa] font-cinzel tracking-wider mr-2">SPEC</span>
                            <span className="text-xs font-bold uppercase tracking-widest drop-shadow-[0_0_5px_rgba(0,0,0,0.8)]" style={{ color: classData.color }}>
                                {spec.split('(')[0]}
                            </span>
                         </div>
                    </div>

                    {/* Inputs */}
                    <div className="bg-[#121212]/90 backdrop-blur-md p-5 rounded-xl border border-[#333] shadow-[0_0_30px_rgba(0,0,0,0.8)] flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] text-[#666] font-bold tracking-[0.2em] ml-1">CLASS</label>
                            <div className="relative group">
                                <select 
                                    value={currentClass} 
                                    onChange={(e) => setClass(e.target.value as ClassName)}
                                    className="w-full appearance-none bg-[#1c1c21] border border-[#333] text-[#f0f0f0] text-center font-cinzel text-sm font-bold tracking-widest py-3 rounded-md hover:border-[#666] hover:bg-[#222] focus:border-[#c7b377] focus:ring-1 focus:ring-[#c7b377]/50 focus:outline-none transition-all cursor-pointer shadow-sm"
                                    style={{ textShadow: '0 1px 2px rgba(0,0,0,1)' }}
                                >
                                    {Object.keys(CLASS_CONFIG).map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#666] text-[10px] group-hover:text-[#aaa] transition-colors">▼</div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[9px] text-[#666] font-bold tracking-[0.2em] ml-1">CHARACTER NAME</label>
                            <input 
                                type="text" 
                                placeholder="ENTER NAME" 
                                className="w-full bg-[#1c1c21] border border-[#333] text-[#f0f0f0] placeholder-[#444] text-center font-cinzel text-xs tracking-[0.1em] py-3 px-3 focus:outline-none focus:border-[#c7b377] focus:ring-1 focus:ring-[#c7b377]/50 focus:bg-[#222] transition-all rounded-md uppercase shadow-sm"
                            />
                        </div>
                    </div>

                </div>
            </div>
        </aside>
    );
};

export default HeroProfile;
