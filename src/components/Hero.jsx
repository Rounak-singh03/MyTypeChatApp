import {
  ArrowRight,
  Heart,
  MessageCircle,
  Phone,
  Play,
  Video
} from 'lucide-react';

import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {

  const navigate = useNavigate();
  const [pulse, setPulse] = useState(false);
  const containerRef = useRef(null);

  return (

    <section
      ref={containerRef}
      className='relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0a]'
    >

      {/* Background */}
      <div className='absolute inset-0 opacity-30'>

        <div
          className='absolute top-0 left-0 w-full h-full
          bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))]
          from-rose-500/10 via-transparent to-transparent'
        ></div>

        <div
          className='absolute bottom-0 right-0 w-full h-full
          bg-[radial-gradient(ellipse_at_bottom_right,var(--tw-gradient-stops))]
          from-violet-600/10 via-transparent to-transparent'
        ></div>

        <div
          className='absolute top-1/2 left-1/3 w-150 h-150
          bg-[radial-gradient(circle,var(--tw-gradient-stops))]
          from-amber-500/10 via-transparent to-transparent'
        ></div>

      </div>

      {/* Floating Effects */}
      <div
        className='absolute top-20 left-10 w-72 h-72
        bg-linear-to-br from-rose-400/10 to-purple-500/5
        rounded-full blur-3xl animate-float-slow'
      ></div>

      <div
        className='absolute bottom-20 right-10 w-96 h-96
        bg-linear-to-tr from-violet-500/10 to-pink-500/5
        rounded-full blur-3xl animate-float-medium'
      ></div>

      {/* Animated Lines */}
      <div className='absolute inset-0 overflow-hidden'>

        {[...Array(8)].map((_, i) => (

          <div
            key={i}
            className='absolute w-px h-32
            bg-linear-to-b from-transparent via-rose-400/20 to-transparent'
            style={{
              left: `${10 + i * 12}%`,
              top: "30%",
              animation: `float-vertical ${3 + i * 0.5}s ease-in-out infinite ${i * 0.2}s`,
              transform: `translateY(${Math.sin(Date.now() / 1000 + i) * 20}px)`
            }}
          />

        ))}

      </div>

      {/* Main Content */}
      <div className='relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-20 text-center'>

        {/* Heading */}
        <h1
          className='text-5xl sm:text-6xl pt-5 md:text-7xl
          font-bold text-white tracking-tight mb-6 leading-[0.9]'
        >

          <div className='animate-fade-in-up delay-100'>

            <span
              className='bg-linear-to-r from-white via-rose-50 to-white
              bg-clip-text text-transparent'
            >
              Sparks turn
            </span>

          </div>

          <div className='animate-fade-in-up delay-200'>

            <span
              className='font-serif italic font-light
              bg-linear-to-r from-red-300 via-amber-300 to-rose-400
              bg-clip-text text-transparent'
            >
              into stories
            </span>

          </div>

          <div className='animate-fade-in-up delay-300'>

            <span
              className='bg-linear-to-r from-white via-violet-50 to-white
              bg-clip-text text-transparent'
            >
              worth telling
            </span>

          </div>

        </h1>

        {/* Paragraph */}
        <div
          className='relative inline-block max-w-2xl mx-auto mb-12
          animate-fade-in-up delay-400'
        >

          <div
            className='absolute -inset-1
            bg-linear-to-r from-rose-400/20 via-transparent to-violet-400/20
            rounded-2xl blur-xl'
          ></div>

          <p
            className='relative text-lg md:text-xl text-zinc-300
            leading-relaxed px-6 py-4 backdrop-blur-sm
            bg-white/5 rounded-2xl'
          >

            Real connections through{" "}

            <span className='text-rose-300 font-medium'>
              instant video calls
            </span>

            ,{" "}

            <span className='text-amber-300 font-medium'>
              crystal-clear voice
            </span>

            , and{" "}

            <span className='text-violet-300 font-medium'>
              seamless chat
            </span>

            . No waiting, just genuine moments.

          </p>

        </div>

        {/* Features */}
        <div
          className='flex flex-wrap items-center justify-center gap-6 mb-12
          animate-fade-in-up delay-500'
        >

          {[
            {
              icon: <Video className="h-3 w-3" />,
              label: "HD Video",
              color: "from-rose-400 to-rose-600",
            },
            {
              icon: <Phone className="h-3 w-3" />,
              label: "Voice Call",
              color: "from-amber-400 to-amber-600",
            },
            {
              icon: <MessageCircle className="h-3 w-3" />,
              label: "Live Chat",
              color: "from-violet-400 to-violet-600",
            },
            {
              icon: <Heart className="h-3 w-3" />,
              label: "Smart Match",
              color: "from-pink-400 to-pink-600",
            },
          ].map((feature, idx) => (

            <div key={idx} className='group relative'>

              <div
                className='absolute -inset-1 bg-linear-to-r opacity-0
                group-hover:opacity-100 blur transition-all duration-500
                rounded-xl'
              ></div>

              <div
                className='relative flex items-center gap-2 px-4 py-3
                rounded-xl glass backdrop-blur-xl
                group-hover:scale-105 transition-all duration-300'
              >

                <div
                  className={`${feature.color} p-2 rounded-lg bg-linear-to-br`}
                >
                  {feature.icon}
                </div>

                <span className='text-sm font-medium text-zinc-200'>
                  {feature.label}
                </span>

              </div>

            </div>

          ))}

        </div>

        {/* Buttons */}
        <div
          className='flex flex-col sm:flex-row items-center justify-center
          gap-5 mb-16 animate-fade-in-up delay-600'
        >

          {/* Button 1 */}
          <button
            onClick={() => navigate("/chatroom")}
            className='group relative px-8 py-4 rounded-xl overflow-hidden'
          >

            <div
              className='absolute inset-0 bg-linear-to-r from-rose-500
              via-amber-500 to-violet-500 opacity-80
              group-hover:opacity-100 transition-all duration-500'
            ></div>

            <div className='absolute inset-px bg-[#0a0a0a] rounded-xl'></div>

            <div
              className='relative flex items-center gap-3
              text-lg font-semibold'
            >

              <span
                className='bg-linear-to-r from-rose-300 via-amber-300
                to-violet-300 bg-clip-text text-transparent'
              >
                Start Matching Free
              </span>

              <ArrowRight
                className='h-4 w-4 text-amber-300
                group-hover:translate-x-1 transition-transform'
              />

            </div>

          </button>

          {/* Button 2 */}
          <button
            className='group px-8 py-4 rounded-xl border border-white/10
            bg-white/5 backdrop-blur-xl hover:bg-white/10
            transition-all duration-300 hover:border-white/20'
          >

            <div className='flex items-center gap-3 text-lg font-medium'>

              <div
                className='p-2 rounded-full
                bg-linear-to-br from-rose-500/20 to-violet-500/20
                group-hover:scale-110 transition-transform'
              >
                <Play className='h-4 w-4 text-rose-400' />
              </div>

              <span
                className='bg-linear-to-r from-white to-zinc-300
                bg-clip-text text-transparent'
              >
                See Real Stories
              </span>

            </div>

          </button>

        </div>

        {/* Stats */}
        <div
          className='grid grid-cols-2 md:grid-cols-4 gap-6
          max-w-4xl mx-auto animate-fade-in-up delay-700'
        >

          {[
            {
              value: "2M+",
              label: "Active Connections",
              color: "text-rose-300",
            },
            {
              value: "500K+",
              label: "Video Dates Weekly",
              color: "text-amber-300",
            },
            {
              value: "98%",
              label: "Satisfaction Rate",
              color: "text-violet-300",
            },
            {
              value: "<2s",
              label: "Match Response Time",
              color: "text-emerald-300",
            },
          ].map((stat, idx) => (

            <div
              key={idx}
              className='card-elegant p-6 backdrop-blur-xl
              hover:scale-105 transition-all duration-500
              cursor-pointer group'
            >

              <div
                className={`text-3xl font-bold mb-2 ${stat.color}
                group-hover:scale-110 transition-transform`}
              >
                {stat.value}
              </div>

              <div
                className='text-sm text-zinc-400
                group-hover:text-zinc-300 transition-colors'
              >
                {stat.label}
              </div>

            </div>

          ))}

        </div>

      </div>

    </section>

  );
};

export default Hero;