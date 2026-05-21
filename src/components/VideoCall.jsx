import { Maximize2, Mic, MicOff, Minimize2, PhoneOff, Sparkles, Video, VideoOff } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ZegoExpressEngine } from "zego-express-engine-webrtc"
const APP_ID=parseInt(import.meta.env.VITE_ZEGO_APP_ID);
const SERVER=import.meta.env.VITE_ZEGO_SERVER_URL;
const VIDEO_TOKEN_A="04AAAAAGoOyrYADDJ2Za7UlCqhucoHEwCr3hJK1pUtg8C5AAQHezOf7RILu9qzt1ts5kfNRhZRl+MyF7Os1rVcDPeKOZi3kBuMUOGTXtjjh7A8L9yAYC3VQXaBxMtleH5hP8Yoede0FhW8LtAuPJ6wyltu1B2/qWRSRlM0APE51ULgxRrEu41oACute6uNXwCi8bK6HS03AYDWTjKn1kBJBTSMdiKYNCoGRGypAOMcvTg7bu1PiHS3FxpsN2KHnpvOevUYAQ=="
const VIDEO_TOKEN_B="04AAAAAGoOy8cADEc/K7YhkaOw9AleNQCrBc04m6iAFve4vSj7SPYAwqzcvsrfUYTVtQfFai4aWleuMfVourIn+TvXPWSPuOesUNCBBCqtDlI1sMF1Imohx4zpYC/Ad6K4i5uh/JMF0XDPlbYQWIdSCZUehS1tO5Q4kIFFuG84C6h9WCcszZL1Omq5UXaequLsXiLvK3bnWQkxgVicoEpYZWbnIvAEctxkXkyCxFVYUzRz1cHTEoBpomtaFePUfIw7vS/4AQ==";

const VideoCall = ({
  isOpen,onClose,callType,localUser,remoteUser,roomId,isCaller,
}) => {
    const [zg, setZg] = useState(null);
  const [callState, setCallState] = useState("connecting");
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === "voice");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [localMediaStream, setLocalMediaStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callDuration, setCallDuration] = useState(0);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const timerRef = useRef(null);
  const zgRef = useRef(null);
  const localStreamRef = useRef(null);
  const publishedStreamIdRef = useRef(null);

  // to use the roomID
  const effectiveRoomId=
  roomId || `call-${[localUser?.userID,remoteUser?.id].sort().join("-")}`;

  //to get token
  const getToken=useCallback(()=>{
    return localUser?.userID==="A"? VIDEO_TOKEN_A:VIDEO_TOKEN_B;
  },[localUser]);

  //effect to play local video
  useEffect(()=>{
    if(localMediaStream && callType==="video" && localVideoRef.current){
      console.log("Attaching local MediaStream to video element");
      localVideoRef.current.srcObject=localMediaStream;
      localVideoRef.current.play().catch((err)=>{
        console.log("Local video autoplay issue:",err);
      })
    }
  },[localMediaStream,callType])


  //initalize the call
  useEffect(()=>{
    if(!isOpen || !localUser) return;

    let mounted=true;

    const initCall=async()=>{
      try {
        console.log("Initializing call...",{
          roomId:effectiveRoomId,
          isCaller,
          callType
        });

        //create zego instance
        const zegoEngine=new ZegoExpressEngine(APP_ID,SERVER);
        setZg(zegoEngine);
        zgRef.current=zegoEngine;

        //register callbacks

        zegoEngine.on("roomStateChanged",(roomId,reason,errorCode)=>{
          console.log("Room state:",reason,errorCode);
          if(!mounted) return;
          if(reason==="LOGINED"){
            setCallState("connected");
          } else if(reason==="LOGOUT" || reason==="KICKOUT"){
            setCallState("ended");
          }else if (reason==="LOGIN FAILED"){
            console.error("Room login failed:", errorCode);
            setCallState("ended");
          }
        });

         zegoEngine.on("roomUserUpdate",async(roomId,updateType,userList)=>{
          console.log("User Updated:",updateType,userList);
         });

         zegoEngine.on("roomStreamUpdate",async(roomId,updateType,streamList)=>{
          console.log("Stream Updated:",updateType,streamList);
          if(!mounted) return;

          if(updateType==="ADD" && streamList.length>0){
            const streamID=streamList[0].streamID;
            try {
              const remoteMediaStream=await zegoEngine.stopPlayingStream(streamID);
              console.log("Remote stream received:",remoteMediaStream);
              setRemoteStream(remoteMediaStream);
              
              if(callType==="video"){
                if(remoteVideoRef.current){
                  remoteVideoRef.current.srcObject=remoteMediaStream;
                  remoteVideoRef.current.play().catch((err)=>{
                    console.log("Video auto-play issue:",err)
                  })
                } 
              }
              else{
                  if(remoteAudioRef.current){
                    remoteAudioRef.current.srcObject=remoteMediaStream;
                    remoteAudioRef.current.play().catch((err)=>{
                      console.log("Audio auto-play issue:",err);
                    });
                  }
                }
            } catch (err) {
              console.log("Failed to play remote stream:",err)
            }
          }else if(updateType==="DELETE"){
            setRemoteStream(null);
            if(remoteVideoRef.current){
              remoteVideoRef.current.srcObject=null;
            }
            if(remoteAudioRef.current){
              remoteAudioRef.current.srcObject=null;
            }
          }
         })
          //Login to room
          const token=getToken();
          console.log("Logging token room:",effectiveRoomId);
          const result=await zegoEngine.loginRoom(
            effectiveRoomId,
            token,
            {userID:localUser.userID,userName:localUser.userName},
            {userUpdate:true},
          )
          console.log("Room login result:",result);
          if(result && mounted){
            const stream=await zegoEngine.createZegoStream({
              camera:{
                video: callType==="video",
                audio:true,
              },
            });
            console.log("Local stream created:",stream);
            setLocalStream(stream);
            localStreamRef.current=stream;

            if(callType=="video"){
              let mediaStream=null;
              if(typeof stream.getMediaStream==="function"){
                mediaStream=stream.getMediaStream();

              } else if(stream.stream){
                mediaStream=stream.stream;
              }else if(stream instanceof MediaStream){
                mediaStream=stream;
              }

              if(mediaStream){
                console.log("Got MediaStream for local video:",mediaStream);
                setLocalMediaStream(mediaStream);
              }else{
                console.log("Trying playVideo method as fallback");
                if(localVideoRef.current){
                  stream.playVideo(localVideoRef.current);
                }
              }
            }

            // unique id
            const streamID=`${effectiveRoomId}_${localUser.userID}_stream`;
            publishedStreamIdRef.current=streamID;
            console.log("Room Stream Id",streamID);
            await zegoEngine.stopPublishingStream(streamID,stream);


            //start timer 
            timerRef.current=setInterval(()=>{
            setCallDuration((prev)=>prev+1);
            },1000)
          }
      } catch (error) {
        console.error("Call initialization failed:",error);
        if(mounted){
          setCallState("ended");
        }
      }
    };
    initCall();
    return()=>{
      mounted=false;
      if(timerRef.current) clearInterval(timerRef.current);
    }
  },isOpen,localUser,callType,effectiveRoomId,getToken,isCaller
);


  // Cleanup on close
  const handleEndCall = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const engine = zgRef.current || zg;
    const stream = localStreamRef.current || localStream;
    const streamID = publishedStreamIdRef.current;

    if (engine) {
      try {
        // Stop publishing
        if (streamID) {
          engine.stopPublishingStream(streamID);
        }
        // Destroy local stream
        if (stream) {
          engine.destroyStream(stream);
        }
        // Logout and destroy engine
        await engine.logoutRoom(effectiveRoomId);
        engine.destroyEngine();
      } catch (e) {
        console.error("Cleanup error:", e);
      }
    }

    setZg(null);
    zgRef.current = null;
    setLocalStream(null);
    localStreamRef.current = null;
    publishedStreamIdRef.current = null;
    setRemoteStream(null);
    setCallState("connecting");
    setCallDuration(0);
    setIsMuted(false);
    setIsVideoOff(callType === "voice");
    onClose();
  }, [zg, localStream, effectiveRoomId, onClose, callType]);

  // Toggle mic
  const toggleMic = useCallback(() => {
    const stream = localStreamRef.current || localStream;
    const engine = zgRef.current || zg;

    if (stream && engine) {
      const newMutedState = !isMuted;

      // Use the stream's muteMicrophone method or engine's muteMicrophone
      if (typeof stream.muteAudio === "function") {
        stream.muteAudio(newMutedState);
      } else if (typeof engine.muteMicrophone === "function") {
        engine.muteMicrophone(newMutedState);
      }

      setIsMuted(newMutedState);
      console.log("Mic muted:", newMutedState);
    }
  }, [localStream, zg, isMuted]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    const stream = localStreamRef.current || localStream;
    const engine = zgRef.current || zg;

    if (stream && callType === "video") {
      const newVideoOffState = !isVideoOff;

      // Try multiple methods to mute/unmute video
      let videoMuted = false;

      // Method 1: Use Zego stream's muteVideo method
      if (typeof stream.muteVideo === "function") {
        stream.muteVideo(newVideoOffState);
        videoMuted = true;
        console.log("Used stream.muteVideo");
      }

      // Method 2: Use engine's muteCamera
      if (!videoMuted && engine && typeof engine.muteCamera === "function") {
        engine.muteCamera(newVideoOffState);
        videoMuted = true;
        console.log("Used engine.muteCamera");
      }

      // Method 3: Directly disable video tracks on the MediaStream
      if (localMediaStream) {
        const videoTracks = localMediaStream.getVideoTracks();
        videoTracks.forEach((track) => {
          track.enabled = !newVideoOffState;
          console.log("Video track enabled:", track.enabled);
        });
        videoMuted = true;
      }

      // Method 4: Try to get MediaStream from Zego stream and disable tracks
      if (!videoMuted) {
        let mediaStream = null;
        if (typeof stream.getMediaStream === "function") {
          mediaStream = stream.getMediaStream();
        } else if (stream.stream) {
          mediaStream = stream.stream;
        }

        if (mediaStream) {
          const videoTracks = mediaStream.getVideoTracks();
          videoTracks.forEach((track) => {
            track.enabled = !newVideoOffState;
            console.log("Video track enabled (fallback):", track.enabled);
          });
        }
      }

      setIsVideoOff(newVideoOffState);
      console.log("Video off:", newVideoOffState);
    }
  }, [localStream, zg, callType, isVideoOff, localMediaStream]);

  // Format duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col ${isFullscreen ? "" : "md:p-8"}`}
    >
      {/* Hidden audio element for voice calls */}
      <audio
        ref={remoteAudioRef}
        autoPlay
        playsInline
        style={{ display: "none" }}
      />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-2 sm:p-3 md:p-4 flex items-center justify-between z-10 bg-linear-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-2 sm:gap-3">
          <img
            src={remoteUser?.avatar}
            alt={remoteUser?.name}
            className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full object-cover ring-2 ring-white/20"
          />
          <div>
            <h3 className="font-semibold text-white text-sm sm:text-base flex items-center gap-2">
              {remoteUser?.name}
              {callState === "connected" && (
                <Sparkles className="w-3 h-3 text-amber-400" />
              )}
            </h3>
            <p className="text-xs sm:text-sm text-white/70">
              {callState === "connecting" &&
                (isCaller ? "Calling..." : "Connecting...")}
              {callState === "connected" && formatDuration(callDuration)}
              {callState === "ended" && "Call ended"}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-1.5 sm:p-2 text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </button>
      </div>

      {/* Video/Voice Area */}
      <div className="flex-1 relative flex items-center justify-center bg-[#050505] overflow-hidden rounded-2xl border border-white/5">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-rose-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        {/* Remote Video (Main) - Only for video calls */}
        {callType === "video" ? (
          <>
            {/* Remote video - large main view */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />

            {/* No remote stream placeholder */}
            {!remoteStream && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="text-center px-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full bg-white/5 flex items-center justify-center mb-3 sm:mb-4 mx-auto ring-4 ring-white/5">
                    <img
                      src={remoteUser?.avatar}
                      alt={remoteUser?.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full object-cover animate-pulse"
                    />
                  </div>
                  <p className="text-white/60 text-sm sm:text-base">
                    {isCaller
                      ? `Waiting for ${remoteUser?.name} to answer...`
                      : `Connecting to ${remoteUser?.name}...`}
                  </p>
                </div>
              </div>
            )}

            {/* Local Video (PiP) - Small overlay showing your own video */}
            <div className="absolute bottom-20 sm:bottom-24 md:bottom-28 lg:bottom-24 xl:bottom-40 2xl:bottom-96 right-2 sm:right-3 md:right-4 lg:right-6 xl:right-8 2xl:right-10 w-24 h-32 sm:w-28 sm:h-38 md:w-36 md:h-48 lg:w-44 lg:h-60 xl:w-56 xl:h-75 2xl:w-64 2xl:h-85 rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl border border-white/20 sm:border-2 z-20">
              {/* Always render video element, just hide it when video is off */}
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isVideoOff ? "hidden" : ""}`}
                style={{ transform: "scaleX(-1)" }}
              />
              {/* Show placeholder when video is off */}
              {isVideoOff && (
                <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                  <VideoOff className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white/40" />
                </div>
              )}
              <div className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 px-1.5 py-0.5 sm:px-2 sm:py-1 bg-black/50 rounded text-[10px] sm:text-xs text-white backdrop-blur-md">
                You
              </div>
            </div>
          </>
        ) : (
          /* Voice call UI */
          <div className="flex flex-col items-center justify-center px-4 relative z-10">
            <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-linear-to-br from-rose-500 to-amber-500 flex items-center justify-center mb-4 sm:mb-5 md:mb-6 shadow-lg shadow-rose-500/20 animate-pulse-glow">
              <img
                src={remoteUser?.avatar}
                alt={remoteUser?.name}
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full object-cover ring-4 ring-black/20"
              />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5 sm:mb-2 flex items-center gap-2">
              {remoteUser?.name}
            </h2>
            <p className="text-rose-200/60 text-sm sm:text-base">
              {callState === "connecting"
                ? isCaller
                  ? "Calling..."
                  : "Connecting..."
                : "Voice call in progress"}
            </p>
            {callState === "connected" && (
              <p className="text-white/40 text-xs sm:text-sm mt-1.5 sm:mt-2 bg-white/5 px-3 py-1 rounded-full">
                {formatDuration(callDuration)}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6 bg-linear-to-t from-black/90 to-transparent">
        <div className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8">
          {/* Mute */}
          <button
            onClick={toggleMic}
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all ${
              isMuted
                ? "bg-white text-black"
                : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-md"
            }`}
          >
            {isMuted ? (
              <MicOff className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : (
              <Mic className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </button>

          {/* Video toggle (only for video calls) */}
          {callType === "video" && (
            <button
              onClick={toggleVideo}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all ${
                isVideoOff
                  ? "bg-white text-black"
                  : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-md"
              }`}
            >
              {isVideoOff ? (
                <VideoOff className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <Video className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </button>
          )}

          {/* End call */}
          <button
            onClick={handleEndCall}
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30 hover:scale-105 active:scale-95"
          >
            <PhoneOff className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        </div>

        {/* Call type indicator */}
        <p className="text-center text-white/30 text-xs sm:text-sm mt-4 tracking-wide uppercase font-medium">
          {callType === "video" ? "Video Call" : "Voice Call"} •{" "}
          <span className="text-white/50">
            {callState === "connected"
              ? "Connected"
              : isCaller
                ? "Calling..."
                : "Connecting..."}
          </span>
        </p>
      </div>
    </div>
  );
}



export default VideoCall
