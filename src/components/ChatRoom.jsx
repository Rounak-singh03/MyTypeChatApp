import React, { useEffect, useRef, useState } from 'react'
import { ZIM } from 'zego-zim-web';
import VideoCall from './VideoCall';
import IncomingCall from './IncomingCall';
import { Heart, Phone, Video, Menu, Send, LogOut, MessageCircle, Sparkles, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const APP_ID=parseInt(import.meta.env.VITE_ZEGO_APP_ID);

// const SERVER=import.meta.env.VITE_ZEGO_SERVER_URL;

const TOKEN_A="04AAAAAGoOyrYADDJ2Za7UlCqhucoHEwCr3hJK1pUtg8C5AAQHezOf7RILu9qzt1ts5kfNRhZRl+MyF7Os1rVcDPeKOZi3kBuMUOGTXtjjh7A8L9yAYC3VQXaBxMtleH5hP8Yoede0FhW8LtAuPJ6wyltu1B2/qWRSRlM0APE51ULgxRrEu41oACute6uNXwCi8bK6HS03AYDWTjKn1kBJBTSMdiKYNCoGRGypAOMcvTg7bu1PiHS3FxpsN2KHnpvOevUYAQ=="

const TOKEN_B="04AAAAAGoOy8cADEc/K7YhkaOw9AleNQCrBc04m6iAFve4vSj7SPYAwqzcvsrfUYTVtQfFai4aWleuMfVourIn+TvXPWSPuOesUNCBBCqtDlI1sMF1Imohx4zpYC/Ad6K4i5uh/JMF0XDPlbYQWIdSCZUehS1tO5Q4kIFFuG84C6h9WCcszZL1Omq5UXaequLsXiLvK3bnWQkxgVicoEpYZWbnIvAEctxkXkyCxFVYUzRz1cHTEoBpomtaFePUfIw7vS/4AQ==";

//call signaling message types
const CALL_SIGNAL={
  INVITE:"CALL_INVITE",
  ACCEPT:"CALL_ACCEPT",
  DECLINE:"CALL_DECLINE",
  END:"CALL_END",
};

//for text message to be normalized
function normalizeMessage(msg) {
  const text =
    (msg &&
      (msg.message || msg.text || msg.message?.message || msg.text?.content)) ||
    "";

  const from =
    msg.fromUserID || msg.senderUserID || (msg && msg.userID) || "unknown";

  const id = msg.messageID || msg.msgID || `${from}-${Date.now()}`;

  const timestamp = msg.timestamp || msg.serverTime || Date.now();

  return { id, text, from, timestamp, raw: msg };
}

function isCallSignal(text){
  try{
    const data=JSON.parse(text);
    return data && data.type && Object.values(CALL_SIGNAL).includes(data.type);
  }catch{
    return false;
  }
}

function parseCallSignal(text){
  try{
    return JSON.parse(text);

  }catch{
    return null;
  }
}

const testUsers = [
  {
    id: "A",
    name: "Emma",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  },
  {
    id: "B",
    name: "James",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
  },
];

const ChatRoom = () => {

  const [zimInstance, setZimInstance] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Call state
  const [callOpen, setCallOpen] = useState(false);
  const [callType, setCallType] = useState("video");
  const [isCaller, setIsCaller] = useState(false);

  // Incoming call state
  const [incomingCall, setIncomingCall] = useState(null);
  const [callRoomId, setCallRoomId] = useState(null);

  const messageEndRef = useRef(null);

  //to create a zim instance on mount
  useEffect(()=>{

    const instance=ZIM.create(APP_ID);

    setZimInstance(instance);

    const onError=(zim,errorInfo)=>console.error("ZIM Error",errorInfo);

    const onConnectionStateChanged=(zim,{state,event})=>{};

    const onPeerMessageReceived=(zim,{messageList})=>{

      if(Array.isArray(messageList) && messageList.length){

        messageList.forEach((msg)=>{

          const normalized=normalizeMessage(msg);

          const text=normalized.text;

          //check whether a call or message()text
          if(isCallSignal(text)){

            const signal=parseCallSignal(text);

            handleCallSignal(signal,normalized.from);

          }else{

            setMessages((prev)=>[...prev,normalized])
          }
        });
      }
    };

    const onTokenWillExpire=(zim,{second})=>
      console.log("TokenExpires in ",second,"s");

    instance.on("error",onError);

    instance.on("connectionStateChanged",onConnectionStateChanged);

    instance.on("peerMessageReceived",onPeerMessageReceived);

    instance.on("tokenWillExpire",onTokenWillExpire);

    return ()=>{

      try{

        instance.off && instance.off("error",onError);

        instance.off && instance.off("connectionStateChanged",onConnectionStateChanged);

        instance.off && instance.off("peerMessageReceived",onPeerMessageReceived);

        instance.off && instance.off("tokenWillExpire",onTokenWillExpire)

      }catch(e){
        console.error("Error :",e)
      }

      if(instance && instance.destroy) instance.destroy();

      setZimInstance(null);
    }

  }, []);

  //handleCall Signal Messages
  const handleCallSignal=(signal,fromUserID)=>{

    console.log("Call signal received:",signal,"from:",fromUserID);

    switch(signal.type){

      case CALL_SIGNAL.INVITE:

        //Someone is calling us
        const caller=testUsers.find((u)=>u.id===fromUserID);

        setIncomingCall({
          from:fromUserID,
          callType:signal.callType,
          callerInfo:caller,
          roomId:signal.roomId,
        });

        break;

      case CALL_SIGNAL.ACCEPT:

        //our call was accepted;
        setCallRoomId(signal.roomId);

        setCallOpen(true);

        break;

      case CALL_SIGNAL.DECLINE:

        setCallOpen(false);

        setIsCaller(false);

        alert(
          `${testUsers.find((u)=>u.id===fromUserID)?.name || "User"} declined your call`
        );

        break;

      case CALL_SIGNAL.END:

        setCallOpen(false);

        setIsCaller(false);

        setIncomingCall(null);

        break;

      default:
        break;
    }
  };

  // to send call signaling message

  const sendCallSignal=async(toUserId,SignalType,extraData={})=>{

    if(!zimInstance || !isLoggedIn) return;

    const signalMessage=JSON.stringify({

      type:SignalType,

      callType:callType,

      roomId:
      callRoomId || `call_${[selectedUser,toUserId].sort().join("-")}_${Date.now()}`,

      timestamp:Date.now(),

      ...extraData,
    });

    const messageTextObj={type:1,message:signalMessage};

    try{

      await zimInstance.sendMessage(
        messageTextObj,
        toUserId,
        0,
        {priority:1},
        {onMessageAttached:()=>{}},
      );

    }catch(err){

      console.error("Failed to send call signal:",err);
    }
  };

  useEffect(()=>{

    messageEndRef.current?.scrollIntoView({behavior:"smooth"})

  },[messages]);

  const handleSelectUser=(u)=>{

    setSelectedUser(u);

    setSidebarOpen(false);
  }

  const handleLogin=async()=>{

    if(!selectedUser) return alert("select a user to login");

    setIsConnecting(true);

    const info={

      userID:selectedUser,

      userName:testUsers.find((u)=> u.id===selectedUser)?.name || selectedUser,
    };

    setUserInfo(info);

    const token=selectedUser==="A" ? TOKEN_A:TOKEN_B;

    let inst=zimInstance;

    try{

      if(!inst){

        inst=ZIM.create(APP_ID);

        setZimInstance(inst);
      }

      await inst.login(info,token);

      setIsLoggedIn(true);

      setIsConnecting(false);

      setMessages((prev)=>[
        ...prev,
        {
          id:`sys-${Date.now()}`,
          text:`${info.userName} joined the chat 💜`,
          from:"system",
          timestamp:Date.now(),
        },
      ]);

    }catch(error){

      console.error("Login failed",error);

      setIsConnecting(false);

      alert("Login failed");
    }
  };

  const handleLogout=async()=>{

    if(!zimInstance) return;

    try {

      await zimInstance.logout();

    } catch (e) {

      console.error(e);
    }

    setIsLoggedIn(false);

    setUserInfo(null);

    setMessages([]);
  };

  const handleSendMessage=async()=>{

    if(!isLoggedIn || !zimInstance || !messageText.trim()) return;

    const toConversationID=selectedUser==="A" ? "B" : "A";

    const messageTextObj={type:1,message:messageText}

    try {

      const {message} =await zimInstance.sendMessage(
        messageTextObj,
        toConversationID,
        0,
        {priority:1},
        {onMessageAttached:()=>{}},
      );

      const norm=normalizeMessage(
        message ||{
          message: messageText,
          fromUserID: userInfo.userID,
          timestamp:Date.now(),
          messageID:`local-${Date.now()}`,
        },
      );

      setMessages((prev)=>[...prev,norm]);

      setMessageText("");

    } catch (err) {

      console.error("Send Failed:",err);

      alert("Message Failed");
    }
  };

  const onKeyDown=(e)=>{

    if(e.key === "Enter" && !e.shiftKey){

      e.preventDefault();

      handleSendMessage();
    }
  };

  const formatTime=(ts)=>
    new Date(ts).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});

  const partnerUser=
  testUsers.find((u)=>u.id !==selectedUser) || testUsers[1];

  //to start call

  const startVoiceCall=()=>{

    const roomId=`call-${[selectedUser,partnerUser.id].sort().join("-")}_${Date.now()}`;

    setCallType("voice");

    setCallRoomId(roomId);

    setIsCaller(true);

    setCallOpen(true);

    sendCallSignal(partnerUser.id,CALL_SIGNAL.INVITE,{
      callType:"voice",
      roomId,
    });
  };

  const startVideoCall=()=>{

    const roomId=`call-${[selectedUser,partnerUser.id].sort().join("-")}_${Date.now()}`;

    setCallType("video");

    setCallRoomId(roomId);

    setIsCaller(true);

    setCallOpen(true);

    sendCallSignal(partnerUser.id,CALL_SIGNAL.INVITE,{
      callType:"video",
      roomId,
    });
  }

  //handle incoming call
  const handleAcceptCall=()=>{

    if(!incomingCall) return;

    setCallType(incomingCall.callType);

    setCallRoomId(incomingCall.roomId);

    setIsCaller(false);

    setCallOpen(true);

    sendCallSignal(incomingCall.from,CALL_SIGNAL.ACCEPT,{
      roomId: incomingCall.roomId,
    });

    setIncomingCall(null);
  };

  //to decline incoming call
  const handleDeclineCall=()=>{

    if(!incomingCall) return;

    sendCallSignal(incomingCall.from,CALL_SIGNAL.DECLINE);

    setIncomingCall(null);
  };

  //handle call end
  const handleCallEnd=()=>{

    sendCallSignal(partnerUser.id,CALL_SIGNAL.END);

    setCallOpen(false);

    setIsCaller(false);

    setCallRoomId(null);
  };

  return (
    <>
      <div className='min-h-screen flex flex-col bg-[#0a0a0a]'>

        <header
          className='md:hidden flex items-center justify-between px-4 py-3 glass sticky top-0 z-40 bg-[#121216]/80 backdrop-blur-xl'
          style={{
            borderBottom:"1px solid rgba(255,255,255,0.05)",
          }}
        >

          <button
            onClick={()=>setSidebarOpen(true)}
            className='p-2 -ml-2 text-zinc-300 rounded-full hover:bg-white/5'
          >
            <Menu className="w-6 h-6 "/>
          </button>

          <div className='flex items-center gap-2'>

            <Heart className='w-6 h-6 text-rose-400 fill-rose-400'/>

            <Link
              to="/"
              className='font-serif italic font-bold bg-linear-to-r from-rose-300 via-amber-300 to-rose-300 bg-clip-text text-transparent'
            >
              MyType
            </Link>

          </div>

          {/*for mobile */}
          {isLoggedIn &&(

            <div className='flex items-center gap-1'>

              <button
                onClick={startVoiceCall}
                title='Voice Call'
                className='p-2 text-amber-400 rounded-full hover:bg-white/5'
              >
                <Phone className='w-5 h-5'/>
              </button>

              <button
                onClick={startVideoCall}
                title='Video Call'
                className='p-2 text-rose-400 rounded-full hover:bg-white/5'
              >
                <Video className='w-5 h-5'/>
              </button>

            </div>
          )}

          {!isLoggedIn && <div className='w-20'/>}

        </header>
<div className="flex-1 flex overflow-hidden">
          {/* Sidebar Overlay - Mobile */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <aside
            className={`
            fixed md:relative inset-y-0 left-0 z-50 
            w-80 max-w-[85vw] md:w-80 
            transform transition-transform duration-300 ease-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
            flex flex-col
            bg-linear-to-b from-[#121216] to-[#0a0a0a]
            border-r border-white/5
          `}
          >
            {/* Sidebar Header */}
            <div className="p-5 border-b border-white/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="relative w-10 h-10 rounded-xl bg-linear-to-r from-rose-500 to-amber-500 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-white fill-white" />
                  </div>
                  <Link
                    to="/"
                    className="font-serif italic font-bold bg-linear-to-r from-rose-300 via-amber-300 to-rose-300 bg-clip-text text-transparent"
                  >
                    MyType
                  </Link>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="md:hidden p-2 text-zinc-400 hover:text-zinc-200 rounded-full hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-zinc-400">
                Connect with your match 💕
              </p>
            </div>

            {/* User Selection */}
            <div className="p-5">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
                Select Profile
              </p>
              <div className="space-y-2">
                {testUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleSelectUser(u.id)}
                    className={`group relative w-full rounded-2xl overflow-hidden transition-all duration-200 ${
                      selectedUser === u.id
                        ? "shadow-lg shadow-rose-500/25"
                        : ""
                    }`}
                  >
                    {/* linear border for selected */}
                    {selectedUser === u.id ? (
                      <>
                        <div className="absolute inset-0 bg-linear-to-r from-rose-500 via-amber-500 to-violet-500"></div>
                        <div className="relative flex items-center gap-3 p-3 bg-linear-to-r from-rose-500 to-amber-500 text-white">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-white/20"
                          />
                          <div className="text-left">
                            <p className="font-semibold">{u.name}</p>
                            <p className="text-xs text-white/80">
                              {u.id === "A"
                                ? "Looking for love"
                                : "Ready to mingle"}
                            </p>
                          </div>
                          <Sparkles className="w-5 h-5 ml-auto" />
                        </div>
                      </>
                    ) : (
                      <>
                        {/* linear border for unselected */}
                        <div className="absolute inset-0 bg-linear-to-r from-rose-500 via-amber-500 to-violet-500 opacity-60 group-hover:opacity-100 transition-all duration-300"></div>
                        <div className="relative flex items-center gap-3 p-3 m-px bg-[#0a0a0a] rounded-2xl">
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-white/20"
                          />
                          <div className="text-left">
                            <p className="font-semibold text-white">{u.name}</p>
                            <p className="text-xs bg-linear-to-r from-rose-300 via-amber-300 to-violet-300 bg-clip-text text-transparent">
                              {u.id === "A"
                                ? "Looking for love"
                                : "Ready to mingle"}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Login/Logout */}
            <div className="px-5 pb-5">
              {!isLoggedIn ? (
                <button
                  onClick={handleLogin}
                  disabled={!selectedUser || isConnecting}
                  className="group relative w-full rounded-xl overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-linear-to-r from-rose-500 via-amber-500 to-violet-500 opacity-80 group-hover:opacity-100 transition-all duration-500"></div>
                  <div className="absolute inset-px bg-[#0a0a0a] rounded-xl"></div>
                  <div className="relative flex items-center justify-center gap-2 py-3 font-semibold bg-linear-to-r from-rose-300 via-amber-300 to-violet-300 bg-clip-text text-transparent">
                    {isConnecting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-rose-300/30 border-t-rose-300 rounded-full animate-spin" />
                        Connecting...
                      </span>
                    ) : (
                      <>
                        <MessageCircle className="w-5 h-5 text-rose-400" />
                        <span>Start Chat</span>
                      </>
                    )}
                  </div>
                </button>
              ) : (
                <div className="bg-linear-to-r from-rose-500/10 to-amber-500/10 rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={
                            testUsers.find((u) => u.id === selectedUser)?.avatar
                          }
                          alt=""
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="online-indicator absolute -bottom-0.5 -right-0.5" />
                      </div>
                      <div>
                        <p className="font-semibold text-white">
                          {userInfo?.userName}
                        </p>
                        <p className="text-xs text-emerald-400 font-medium">
                          Online
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-white/5 rounded-xl transition-colors"
                      title="Logout"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Match Info */}
            {isLoggedIn && (
              <div className="px-5 mt-auto pb-5">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
                  Chatting with
                </p>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/10">
                  <div className="relative">
                    <img
                      src={partnerUser.avatar}
                      alt={partnerUser.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="online-indicator absolute -bottom-0.5 -right-0.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white">
                      {partnerUser.name}
                    </p>
                    <p className="text-xs text-zinc-400">Your match 💕</p>
                  </div>
                </div>

                {/* Quick call buttons */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={startVoiceCall}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-500/20 text-amber-300 rounded-xl font-medium hover:bg-amber-500/30 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">Voice</span>
                  </button>
                  <button
                    onClick={startVideoCall}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-rose-500/20 text-rose-300 rounded-xl font-medium hover:bg-rose-500/30 transition-colors"
                  >
                    <Video className="w-4 h-4" />
                    <span className="text-sm">Video</span>
                  </button>
                </div>
              </div>
            )}
          </aside>

          {/* Main Chat Area */}
          <main className="flex-1 flex flex-col min-w-0 bg-linear-to-br from-[#0a0a0a] to-[#121216]">
            {/* Chat Header - Desktop */}
            <div className="hidden md:flex items-center justify-between px-6 py-4 glass bg-[#121216]/50 backdrop-blur-xl border-b border-white/5">
              <div className="flex items-center gap-4">
                {isLoggedIn && (
                  <div className="relative">
                    <img
                      src={partnerUser.avatar}
                      alt={partnerUser.name}
                      className="w-11 h-11 rounded-full object-cover"
                    />
                    <div className="online-indicator absolute -bottom-0.5 -right-0.5" />
                  </div>
                )}
                <div>
                  <h2 className="font-semibold text-white">
                    {isLoggedIn
                      ? partnerUser.name
                      : "Select a profile to start"}
                  </h2>
                  <p className="text-xs text-zinc-400">
                    {isLoggedIn
                      ? "Online • Matched with you"
                      : "Your conversations appear here"}
                  </p>
                </div>
              </div>

              {/* Desktop call buttons */}
              {isLoggedIn && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={startVoiceCall}
                    className="p-3 text-amber-400 rounded-full hover:bg-white/5 transition-colors"
                    title="Voice call"
                  >
                    <Phone className="w-5 h-5" />
                  </button>
                  <button
                    onClick={startVideoCall}
                    className="p-3 text-rose-400 rounded-full hover:bg-white/5 transition-colors"
                    title="Video call"
                  >
                    <Video className="w-5 h-5" />
                  </button>
                  <div className="ml-2 flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-full">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-xs font-medium text-emerald-400">
                      Connected
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="max-w-2xl mx-auto space-y-3">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
                    <h3 className="font-semibold text-lg text-white mb-2">
                      No messages yet
                    </h3>
                    <p className="text-zinc-400 text-sm max-w-xs">
                      {isLoggedIn
                        ? `Say hello to ${partnerUser.name}! 👋`
                        : "Select a profile and start chatting"}
                    </p>
                  </div>
                )}

                {messages.map((m) => {
                  const fromMe = userInfo && m.from === userInfo.userID;
                  const isSystem = m.from === "system";

                  if (isSystem) {
                    return (
                      <div key={m.id} className="flex justify-center my-4">
                        <div className="message-system">{m.text}</div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={m.id}
                      className={`flex ${fromMe ? "justify-end" : "justify-start"}`}
                    >
                      {!fromMe && (
                        <img
                          src={partnerUser.avatar}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover mr-2 mt-auto shrink-0"
                        />
                      )}
                      <div
                        className={`message-bubble ${fromMe ? "message-sent" : "message-received"}`}
                      >
                        <p className="text-sm leading-relaxed wrap-break-words whitespace-pre-wrap">
                          {m.text}
                        </p>
                        <p
                          className={`text-[10px] mt-1.5 text-right ${fromMe ? "text-white/60" : "text-surface-400"}`}
                        >
                          {formatTime(m.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messageEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <div className="p-4 md:p-6 glass bg-[#121216]/50 backdrop-blur-xl border-t border-white/5">
              <div className="max-w-2xl mx-auto">
                <div className="flex items-end gap-3">
                  <div className="flex-1 relative">
                    <textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={onKeyDown}
                      placeholder={
                        isLoggedIn
                          ? "Type your message..."
                          : "Login to send messages"
                      }
                      disabled={!isLoggedIn}
                      rows={1}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-500 resize-none min-h-13 max-h-32 focus:border-rose-400/50 focus:ring-2 focus:ring-rose-400/20 transition-all disabled:opacity-50"
                      style={{ paddingTop: "14px", paddingBottom: "14px" }}
                    />
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!isLoggedIn || !messageText.trim()}
                    className="btn btn-primary btn-icon w-13 h-13 shrink-0"
                    aria-label="Send message"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-zinc-500 mt-2 text-center md:text-left">
                  Press Enter to send • Shift+Enter for new line
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
      
      {incomingCall && (
        <IncomingCall caller={incomingCall.callerInfo}
        callType={incomingCall.callType} onAccept={handleAcceptCall}
        onDecline={handleDeclineCall}
        />
      )}
      <VideoCall isOpen={callOpen} onClose={handleCallEnd} callType={callType}
      localUser={userInfo} remoteUser={partnerUser} roomId={callRoomId} isCaller={isCaller}/>
    </>
  )
};

export default ChatRoom;