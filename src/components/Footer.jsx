import { Heart, MessageCircle, Sparkles, GitBranch, Globe, Send } from 'lucide-react'
import React from 'react'

const Footer = () => {
  return (
   <footer className='relative bg-[#0a0a0a] overflow-hidden'>
    <div className='h-px bg-linear-to-r from-transparent via-white/5 to-transparent'></div>
    <div className='absolute inset-0 opacity-20'>
        <div className='absolute -bottom-20 -left-20 w-64 h-64 bg-linear-to-br from-rose-500/10 to-transparent
        rounded-full blur-3xl '></div>
       <div className='absolute -top-20 -right-20 w-64 h-64 bg-linear-to-bl
       from-violet-500/10 to-transparent rounded-full blur-3xl'></div>
    </div>
      <div className='relative z-10 max-w-6xl mx-auto px-6 py-12'>
        <div className='flex flex-col items-center text-center space-y-8'>
            <a href="#" className='group flex items-center gap-3 transition-all
            mb-2 duration-300 hover:scale-105' >
                <div className='relative'>
                    <div className='absolute inset-0 bg-linear-to-r from-rose-500/20 to-violet-500/20
                   rounded-xl blur-md group-hover:blur-xl transition-all duration-500 '></div>
                   <div className='relative w-10 h-10 rounded-xl bg-linear-to-br
                   from-rose-500 to-amber-500 items-center justify-center flex shadow-lg'>
                    <Heart className='w-5 h-5 text-white fill-white'/>
                   </div>
                </div>
                <span className='text-2xl font-bold tracking-tight'>
                    <span className='bg-linear-to-r from-white to-zinc-200 bg-clip-text
                    text-transparent'>
                        My
                    </span>
                <span className='font-serif italic bg-linear-to-r from-rose-300 to-amber-300
                bg-clip-text text-transparent'>
                    Type
                </span>
                </span>
               <Sparkles className='h-4 w-4 text-amber-300 opacity-0 group-hover:opacity-100 transition-all duration-300'/>

            </a>
            <p className='text-sm text-zinc-500 max-w-md mx-auto leading-relaxed'>
                Where genuine connections blossom through real conversations.
                <span className='block mt-1 text-xs text-zinc-600'>
                   Video Dates   ●   Voice Chats   ●   Real Connections
                </span>
            </p>
            <div className='flex items-center gap-4'>
             {[
 {  icon: Send,
    label: "Telegram",
    color: "hover:text-blue-400", },
  {
    icon: MessageCircle,
    label: "Discord",
    color: "hover:text-indigo-400",
  },
  { icon: GitBranch, 
    label: "GitHub", 
    color: "hover:text-zinc-300" },
  {
    icon: Globe,
    label: "Website",
    color: "hover:text-sky-400",
  },
].map((social) => (
  <a
    href="#"
    key={social.label}
    className={`group rounded-lg p-2 transition-all duration-300
    ${social.color} hover:bg-white/5`}
  >

    {React.createElement(social.icon, {
      className:
        "h-5 w-5 text-zinc-500 group-hover:scale-110 transition-transform",
    })}

  </a>
))}
            </div>
            <div className='flex flex-wrap items-center justify-center gap-6 text-sm'>
                
            {["About", "Blog", "Safety", "Help"].map((item) => (
            <a href="#" key={item} className='text-zinc-500 hover:text-zinc-300
            transition-colors duration-200 relative after:absolute after:bottom-0
            after:left-0 after:w-0 after:h-px after:bg-linear-to-r after:from-rose-400
            after:to-amber-400 hover:after:w-full after:transition-all after:duration-300'>
                {item}
            </a>
            ))}
            </div>
           <div className='pt-6 border-t border-white/5 w-full'>
            <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
                <p className='text-xs text-zinc-600'>
                    &copy; {new Date().getFullYear()} MyType. Made with{" "}
                    <Heart className='inline h-3 w-3 text-rose-400 fill-rose-400' />{" "}
                for meaningful connections
                </p>
                <div className='flex items-center gap-4 text-xs'>
                    <a href="#" className='text-zinc-600 hover:text-zinc-400 transition-colors 
                    duration-200'>
                        Privacy
                    </a>
                    <span className='text-zinc-700'>
                     ● 
                    </span>
                 <a href="#" className='text-zinc-600 hover:text-zinc-400 transition-colors duration-200 ' >
                    Terms
                 </a>
                   <span className='text-zinc-700'>
                     ● 
                    </span>
                   <a href="#" className='text-zinc-600 hover:text-zinc-400 transition-colors 
                    duration-200'>
                        Cookies
                    </a>
                  
                </div>
            </div>

            </div>
        </div>
        <button onClick={()=> window.scrollTo({top:0,behavior:"smooth"})} className='fixed bottom-6 right-6 sm:bottom-8 sm:right-8 w-10
        h-10 rounded-full glass backdrop-blur-xl border border-white/5 flex items-center
        justify-center group z-50 transition-all duration-300 
        hover:scale-110 hover:border-white/10'>
    <div className='w-2 h-2 border-t border-l border-zinc-500 group-hover:border-zinc-300
    rotate-45 -translate-y-0.5 transition-all duration-300'/>
        </button>
      </div>
   </footer>
  )
}

export default Footer
