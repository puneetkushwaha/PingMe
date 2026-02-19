import { useEffect, useRef } from "react";
import { useCallStore } from "../store/useCallStore";
import { useChatStore } from "../store/useChatStore";
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff } from "lucide-react";

const CallModal = () => {
    const {
        call,
        localStream,
        remoteStream,
        acceptCall,
        endCall,
        toggleMic,
        toggleVideo,
        isMuted,
        isVideoOff
    } = useCallStore();
    const { users, groups } = useChatStore();
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
            localVideoRef.current.play().catch(e => console.error("Error playing local stream:", e));
        }
    }, [localStream, call?.status]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.play().catch(e => console.error("Error playing remote stream:", e));
        }
    }, [remoteStream, call?.status]);

    if (!call) return null;

    // For groups, display group info. For direct, display user info.
    const displayInfo = call.isGroup && call.groupId
        ? groups.find(g => g._id === call.groupId)
        : (groups.find(g => g._id === call.to) || users.find(u => u._id === (call.from || call.to)));

    const displayName = displayInfo?.fullName || displayInfo?.name || "User";
    const displayPic = displayInfo?.profilePic || displayInfo?.groupPic || "/avatar.png";

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm ${call?.status === 'connected' && call?.type === 'video' ? '' : 'p-4'}`}>
            <div className={`bg-[#202c33] w-full ${call?.status === 'connected' && call?.type === 'video' ? 'h-full w-full max-w-none rounded-none' : 'max-w-lg rounded-2xl'} overflow-hidden shadow-2xl border border-zinc-700 relative flex flex-col`}>

                {/* Call Info */}
                <div className={`flex flex-col items-center text-center ${call?.status === 'connected' && call?.type === 'video' ? 'absolute top-12 left-0 w-full z-20 pointer-events-none' : 'p-8'}`}>
                    {(call?.status !== 'connected' || call?.type !== 'video') && (
                        <div className="size-24 rounded-full overflow-hidden mb-4 ring-4 ring-[#00a884]">
                            <img src={displayPic} alt="" className="w-full h-full object-cover" />
                        </div>
                    )}
                    <h2 className={`font-bold text-white mb-1 ${call?.status === 'connected' && call?.type === 'video' ? 'text-xl drop-shadow-md' : 'text-2xl'}`}>{displayName}</h2>
                    <p className={`animate-pulse ${call?.status === 'connected' && call?.type === 'video' ? 'text-white/80 text-sm drop-shadow-md' : 'text-[var(--wa-gray)]'}`}>
                        {call?.status === 'calling' ? 'Calling...' :
                            call?.status === 'incoming' ? 'Incoming ' + call?.type + ' call...' :
                                'Connected'}
                    </p>
                </div>

                {/* Video Streams */}
                {call?.type === 'video' && (
                    <div className={`relative bg-black flex items-center justify-center ${call?.status === 'connected' ? 'flex-1 h-full' : 'aspect-video'}`}>
                        {call?.status === 'connected' && remoteStream ? (
                            <video ref={remoteVideoRef} autoPlay playsInline muted={false} className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center justify-center">
                                <div className="size-20 rounded-full overflow-hidden ring-2 ring-white/20 mb-4">
                                    <img src={displayPic} alt="" className="w-full h-full object-cover opacity-50" />
                                </div>
                                <p className="text-white/50 text-sm">Waiting for video...</p>
                            </div>
                        )}
                        <div className="absolute bottom-4 right-4 w-32 aspect-video bg-zinc-800 rounded-lg overflow-hidden border border-zinc-600 shadow-lg z-10">
                            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                        </div>
                    </div>
                )}

                {/* Audio for audio-only calls (video calls use the video element for audio) */}
                {call?.type === 'audio' && (
                    <audio ref={remoteVideoRef} autoPlay className="hidden" />
                )}

                {/* Controls */}
                <div className={`p-6 flex justify-center items-center gap-8 ${call?.status === 'connected' && call?.type === 'video' ? 'absolute bottom-8 left-1/2 -translate-x-1/2 bg-transparent z-20' : 'bg-[#111b21]'}`}>
                    {call?.status === 'incoming' ? (
                        <>
                            <button
                                onClick={acceptCall}
                                className="size-16 bg-[#00a884] rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg"
                            >
                                <Phone className="size-8" />
                            </button>
                            <button
                                onClick={endCall}
                                className="size-16 bg-red-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg"
                            >
                                <PhoneOff className="size-8" />
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={toggleMic}
                                className={`p-4 rounded-full transition-colors font-bold backdrop-blur-md ${isMuted ? 'bg-white text-black' : 'bg-black/40 text-white hover:bg-black/60'}`}
                            >
                                {isMuted ? <MicOff className="size-6" /> : <Mic className="size-6" />}
                            </button>
                            {call.type === 'video' && (
                                <button
                                    onClick={toggleVideo}
                                    className={`p-4 rounded-full transition-colors backdrop-blur-md ${isVideoOff ? 'bg-white text-black' : 'bg-black/40 text-white hover:bg-black/60'}`}
                                >
                                    {isVideoOff ? <VideoOff className="size-6" /> : <Video className="size-6" />}
                                </button>
                            )}
                            <button
                                onClick={useCallStore.getState().toggleSpeaker}
                                className={`p-4 rounded-full transition-colors backdrop-blur-md ${useCallStore.getState().isSpeakerOn ? 'bg-white text-black' : 'bg-black/40 text-white hover:bg-black/60'}`}
                            >
                                {useCallStore.getState().isSpeakerOn ? <div className="relative"><Phone className="size-6" /><span className="absolute -top-1 -right-1 text-xs font-bold">(( ))</span></div> : <Phone className="size-6" />}
                            </button>
                            <button
                                onClick={endCall}
                                className="size-16 bg-red-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform shadow-lg"
                            >
                                <PhoneOff className="size-8" />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div >
    );
};

export default CallModal;
