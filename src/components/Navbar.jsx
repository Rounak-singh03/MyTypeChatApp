import React, { useState } from 'react'
import { Heart, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const Navbar = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass bg-[#0a0a0a0]/80 backdrop-blur-xl 
    border-b border-white/5">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <a href="/" className="flex items-center gap-3 group cursor-pointer">
                        <div className="relative">
                            <div className="absolute inset-0 bg-linear-to-br from-rose-500/20 to-amber-500/20 rounded-xl 
        blur-md group-hover:blur-lg transition-all duration-500"></div>
                            <div className="relative w-10 h-10 rounded-xl bg-linear-to-br from-rose-500 to-amber-500 flex items-center justify-center shadow-lg">
                                <Heart className="h-5 w-5 text-white fill-white" />
                            </div>
                        </div>
                        <span className="text-2xl font-bold tracking-tight">
                            <span className="bg-linear-to-r from-white to-zinc-200 bg-clip-text text-transparent">
                                My
                            </span>
                            <span className="font-serif italic bg-linear-to-r from-red-300 via-amber-300 to-rose-300
        bg-clip-text text-transparent">
                                Type
                            </span>
                        </span>
                    </a>
                    <div className="hidden md:block">
                 <button onClick={()=> navigate("/chatroom")} className="group relative
                 px-6 py-2.5 rounded-xl overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-r from-rose-500 via-amber-500
                    to-violet-500 opacity-80 group-hover:opacity-100 transition-all duration-500"></div>
                    <div className="absolute inset-px bg-[#0a0a0a] rounded-xl"></div>
                    <span className="relative font-semibold bg-linear-to-r from-rose-300 via-amber-300
                    to-violet-300 bg-clip-text text-transparent">
                        Get Started
                    </span>


                 </button>

                    </div>
                    {/*Mobile Toggle*/ }
                    <button onClick={()=> setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden
                    p-2 text-zinc-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                        {mobileMenuOpen ?(
                            <X className="w-6 h-6"/>
                        ):<Menu className="w-6 h-6"/>
                        }
                    </button>
                </div>

                {mobileMenuOpen && (
                    <div className="md:hidden mt-4 pt-4 border-t border-white/5 animate-fade-in">
                     <div className="flex flex-col gap-4 ">
                        <button onClick={()=>{
                            navigate("/chatroom");
                            setMobileMenuOpen(false);
                        }}
                        className="group relative px-6 py-2.5 rounded-xl overflow-hidden mt-2">
                            <div className="absolute inset-0 bg-linear-to-r from-rose-500 via-amber-500 
                            to-violet-500 opacity-80 group-hover:opacity-100 transition-all duration-500"></div>
                            <div className="absolute inset-px bg-[#0a0a0a] rounded-xl"></div>
                            <span className="relative font-semibold bg-linear-to-r from-rose-300
                            via-amber-300 to-violet-300 bg-clip-text text-transparent"> 
                            Get Started</span>
                        </button>
                     </div>
                    </div>
                )}

            </div>

        </nav>

    )
}

export default Navbar
