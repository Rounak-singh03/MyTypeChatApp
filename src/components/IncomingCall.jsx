import { Phone, PhoneOff, Sparkles, Video } from 'lucide-react';
import React from 'react'

const IncomingCall = ({caller,callType,onAccept,onDecline}) => {
    if(!caller) return null;
  return (
   <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm
   animate-fade-in'>
    <div className='absolute inset-0 overflow-hidden pointer-events-none'></div>
    <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
    w-75 h-75 bg-rose-500/20 rounded-full blur-[80px] animate-pulse'></div>
    <div className='relative bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl max-w-sm w-full mx-4 text-center'>
    <div className='relative mx-auto mb-6'>
        <div className='absolute inset-0 bg-linear-to-br from-rose-500
        to-amber-500 rounded-full animate-ping opacity-20' style={{
            width:"120px",height:"120px",margin:"auto"
        }}/>
      
<div className='relative'>
    <img src={caller.avatar} alt={caller.name} className='w-28 h-28
    rounded-full object-cover mx-auto ring-4 ring-black shadow-xl relative z-10'/>
    <div className='absolute -bottom-1 -right-1 z-20 bg-black
    rounded-full p-1'>
        <div className='w-10 h-10 rounded-full bg-linear-to-br from-rose-500
        to-amber-500 flex items-center justify-center shadow-lg'>
            {callType==="video"?(
                <Video className='w-5 h-5 text-white'/>
            ):(
                <Phone className='w-5 h-5 text-white'/>
            )}
        </div>
    </div>
</div>
    </div>
{/*caller info  */}
<h2 className='text-2xl font-bold text-white mb-1 flex items-center justify-center gap-2'>
    {caller.name}
    <Sparkles className='w-5 h-5 text-amber-400 fill-amber-400'/>
</h2>
<p className='text-zinc-400 mb-8'>
    Incoming {callType==="video"?"video0":"voice"} call...
</p>
<div className='flex items-center justify-center gap-6'>
    <div className='group'>
        <button onClick={onDecline} className='w-16 h-16 bg-red-500/20 text-red-500 border
        border-red-500/50 flex items-center justify-center hover:bg-red-500
        hover:text-white transition-all duration-300 shadow-lg 
        shadow-red-500/10 hover:shadow-red-500/30 hover:scale-110'>
            <PhoneOff className='w-7 h-7'/>
        </button>
        <span className='block text-xs text-zinc-500 mt-2 font-medium
        transition-colors group-hover:text-red-400'>
            Decline 
        </span>
    </div>
    <div className='group'>
        <button onClick={onAccept} className='w-16 h-16 rounded-full
        bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-500
        transition-all duration-300 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50
        hover:scale-110 animate-bounce-subtle
        '>
            {callType==="video"?(
                <Video className='w-7 h-7'/>
            ):(
                <Phone className='w-7 h-7'/>
            )}
        </button>
        <span className='block text-xs text-zinc-500 mt-2 font-medium
        transition-colors group-hover:text-emerald-400'>
        Accept
        </span>
    </div>
</div>
    </div>
   </div>
  )
}

export default IncomingCall
