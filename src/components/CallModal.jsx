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
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    if (!call) return null;

    // For groups, display group info. For direct, display user info.
    const displayInfo = call.isGroup && call.groupId
        ? groups.find(g => g._id === call.groupId)
        : (groups.find(g => g._id === call.to) || users.find(u => u._id === (call.from || call.to)));

    const displayName = displayInfo?.fullName || displayInfo?.name || "User";
    const displayPic = displayInfo?.profilePic || displayInfo?.groupPic || "/avatar.png";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#202c33] w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-zinc-700">

                {/* Call Info */}
                <div className="p-8 flex flex-col items-center text-center">
                    <div className="size-24 rounded-full overflow-hidden mb-4 ring-4 ring-[#00a884]">
                        <img src={displayPic} alt="" className="w-full h-full object-cover" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-1">{displayName}</h2>
                    <p className="text-[var(--wa-gray)] animate-pulse">
                        {call.status === 'calling' ? 'Calling...' :
                            call.status === 'incoming' ? 'Incoming ' + call.type + ' call...' :
                                'Connected'}
                    </p>
                </div>

                {/* Video Streams */}
                {call.status === 'connected' && call.type === 'video' && (
                    <div className="relative aspect-video bg-black flex items-center justify-center">
                        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        <div className="absolute bottom-4 right-4 w-32 aspect-video bg-zinc-800 rounded-lg overflow-hidden border border-zinc-600 shadow-lg">
                            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                        </div>
                    </div>
                )}

                {/* Controls */}
                <div className="p-6 bg-[#111b21] flex justify-center items-center gap-8">
                    {call.status === 'incoming' ? (
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
                                className={`transition-colors ${isMuted ? 'text-red-500' : 'text-[var(--wa-gray)] hover:text-white'}`}
                            >
                                {isMuted ? <MicOff className="size-6" /> : <Mic className="size-6" />}
                            </button>
                            {call.type === 'video' && (
                                <button
                                    onClick={toggleVideo}
                                    className={`transition-colors ${isVideoOff ? 'text-red-500' : 'text-[var(--wa-gray)] hover:text-white'}`}
                                >
                                    {isVideoOff ? <VideoOff className="size-6" /> : <Video className="size-6" />}
                                </button>
                            )}
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
        </div>
    );
};

export default CallModal;
