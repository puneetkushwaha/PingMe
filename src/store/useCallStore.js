import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios.js";

export const useCallStore = create((set, get) => ({
    call: null, // { from, type, status: 'calling' | 'incoming' | 'connected' }
    localStream: null,
    remoteStream: null,
    peerConnection: null,
    isMuted: false,
    isVideoOff: false,
    ringtone: null,
    audioContextWarmed: false,
    startTime: null,

    warmUpAudio: () => {
        if (get().audioContextWarmed) return;
        const sound = new Audio("/notification.mp3");
        sound.volume = 0;
        sound.play().then(() => {
            sound.pause();
            set({ audioContextWarmed: true });
            console.log("🔊 Audio warmed up successfully");
        }).catch(() => {
            console.log("🔇 Audio warm-up failed, user interaction required");
        });
    },

    playRingtone: () => {
        const { ringtone: existingRingtone, call } = get();
        if (existingRingtone) return;

        const ringtone = new Audio("/notification.mp3");
        ringtone.loop = true;
        ringtone.play().catch(err => {
            console.warn("Ringtone autoplay blocked, showing notification fallback");
            if (Notification.permission === "granted" && call) {
                new Notification(`Incoming Call`, {
                    body: `Incoming ${call.type} call. Click to answer.`,
                    icon: "/icon-192x192.png",
                    tag: 'incoming-call',
                    requireInteraction: true
                });
            }
        });
        set({ ringtone });
    },

    stopRingtone: () => {
        const { ringtone } = get();
        if (ringtone) {
            ringtone.pause();
            ringtone.currentTime = 0;
            set({ ringtone: null });
        }
    },

    toggleMic: () => {
        const { localStream, isMuted } = get();
        if (localStream) {
            localStream.getAudioTracks().forEach(track => track.enabled = isMuted);
            set({ isMuted: !isMuted });
        }
    },

    toggleVideo: () => {
        const { localStream, isVideoOff } = get();
        if (localStream) {
            localStream.getVideoTracks().forEach(track => track.enabled = isVideoOff);
            set({ isVideoOff: !isVideoOff });
        }
    },

    setCall: (call) => set({ call }),
    isCallLoading: false,
    calls: [], // Call history

    getCallHistory: async () => {
        set({ isCallLoading: true });
        try {
            const res = await axiosInstance.get("/calls");
            set({ calls: res.data });
        } catch (error) {
            console.error("Error fetching call history:", error);
        } finally {
            set({ isCallLoading: false });
        }
    },

    logCall: async (callData) => {
        try {
            await axiosInstance.post("/calls/log", callData);
            // Refresh history
            get().getCallHistory();
        } catch (error) {
            console.error("Error logging call:", error);
        }
    },

    initiateCall: async (receiverId, type = "audio") => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        try {
            let stream;
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: type === "video" ? { facingMode: "user" } : false
                });
            } catch (err) {
                console.warn("Primary camera access failed, retrying with generic constraints:", err);
                if (type === "video") {
                    stream = await navigator.mediaDevices.getUserMedia({
                        audio: true,
                        video: true // Fallback to any available camera
                    });
                } else {
                    throw err;
                }
            }

            set({ localStream: stream, call: { to: receiverId, type, status: 'calling' } });

            const pc = new RTCPeerConnection({
                iceServers: [
                    { urls: "stun:stun.l.google.com:19302" },
                    { urls: "stun:global.stun.twilio.com:3478" }
                ]
            });

            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            pc.ontrack = (event) => {
                console.log('🎥 [CALLER] Remote track received:', event.streams[0]);
                console.log('Track kind:', event.track.kind);
                if (event.streams && event.streams[0]) {
                    set({ remoteStream: event.streams[0] });
                    console.log('✅ [CALLER] Remote stream set in state');
                } else {
                    console.error('❌ [CALLER] No remote stream in event');
                }
            };

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit("ice:candidate", { to: receiverId, candidate: event.candidate });
                }
            };

            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            socket.emit("call:user", { to: receiverId, offer, type });
            set({ peerConnection: pc });

        } catch (error) {
            console.error("Error initiating call:", error);
            toast.error("Could not access camera/microphone");
            set({ call: null, localStream: null });
            get().stopRingtone();
        }
    },

    handleIncomingCall: async (data) => {
        set({ call: { ...data, status: 'incoming' } });
        get().playRingtone();
    },

    acceptCall: async () => {
        get().stopRingtone();
        const { call } = get();
        const socket = useAuthStore.getState().socket;
        if (!socket || !call) return;

        try {
            let stream;
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: call.type === "video" ? { facingMode: "user" } : false
                });
            } catch (err) {
                console.warn("Primary camera access failed (accept), retrying:", err);
                if (call.type === "video") {
                    stream = await navigator.mediaDevices.getUserMedia({
                        audio: true,
                        video: true
                    });
                } else {
                    throw err;
                }
            }

            set({ localStream: stream });

            const pc = new RTCPeerConnection({
                iceServers: [
                    { urls: "stun:stun.l.google.com:19302" },
                    { urls: "stun:global.stun.twilio.com:3478" }
                ]
            });

            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            pc.ontrack = (event) => {
                console.log('🎥 [RECEIVER] Remote track received:', event.streams[0]);
                console.log('Track kind:', event.track.kind);
                if (event.streams && event.streams[0]) {
                    set({ remoteStream: event.streams[0] });
                    console.log('✅ [RECEIVER] Remote stream set in state');
                } else {
                    console.error('❌ [RECEIVER] No remote stream in event');
                }
            };

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit("ice:candidate", { to: call.from, candidate: event.candidate });
                }
            };

            await pc.setRemoteDescription(new RTCSessionDescription(call.offer));
            const ans = await pc.createAnswer();
            await pc.setLocalDescription(ans);

            socket.emit("call:accepted", { to: call.from, ans });
            set({ peerConnection: pc, call: { ...call, status: 'connected' }, startTime: Date.now() });

        } catch (error) {
            console.error("Error accepting call:", error);
            toast.error("Failed to accept call");
            get().endCall();
        }
    },

    handleCallConnected: async ({ ans }) => {
        const { peerConnection, call } = get();
        if (peerConnection) {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(ans));
            set({ call: { ...call, status: 'connected' }, startTime: Date.now() });
        }
    },

    handleIceCandidate: async ({ candidate }) => {
        const { peerConnection } = get();
        if (peerConnection && candidate) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
    },

    endCall: () => {
        get().stopRingtone();
        const { localStream, peerConnection, call, startTime } = get();
        const socket = useAuthStore.getState().socket;

        if (call) {
            // Calculate duration if status was 'connected'
            let duration = 0;
            let status = 'completed';

            if (call.status === 'connected' && startTime) {
                duration = Math.round((Date.now() - startTime) / 1000);
            } else if (call.status === 'calling') {
                status = 'missed';
            } else if (call.status === 'incoming') {
                status = 'rejected';
            }

            // Only caller logs the call to prevent duplicates
            // OR if it's a missed/rejected call, the relevant party logs it
            // For now, let's have the person who ENDS the call log it if it was connected
            // If it wasn't connected, only the caller logs 'missed' if they cancel, 
            // and receiver logs 'rejected' if they reject.

            const isCaller = !!call.to;
            const receiverId = call.to || call.from;

            if (isCaller && receiverId) {
                get().logCall({
                    receiverId,
                    type: call.type,
                    status,
                    duration
                });
            }

            if (call.status === 'incoming') {
                socket.emit("call:rejected", { to: receiverId });
            } else {
                socket.emit("call:ended", { to: receiverId });
            }
        }

        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        if (peerConnection) {
            peerConnection.close();
        }

        set({ call: null, localStream: null, remoteStream: null, peerConnection: null, startTime: null });
    },

    subscribeToCalls: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        socket.on("call:incoming", async (data) => {
            get().handleIncomingCall(data);
        });

        socket.on("call:connected", async (data) => {
            get().handleCallConnected(data);
        });

        socket.on("call:rejected", () => {
            const { call } = get();
            if (call) set({ call: { ...call, status: 'rejected' } });
            toast.error("Call rejected");
            get().endCall();
        });

        socket.on("ice:candidate", (data) => {
            get().handleIceCandidate(data);
        });

        socket.on("call:ended", () => {
            toast("Call ended");
            get().endCall();
        });
    },

    unsubscribeFromCalls: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;
        socket.off("call:incoming");
        socket.off("call:connected");
        socket.off("call:rejected");
        socket.off("ice:candidate");
        socket.off("call:ended");
    }
}));
