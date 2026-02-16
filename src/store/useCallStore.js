import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import toast from "react-hot-toast";

export const useCallStore = create((set, get) => ({
    call: null, // { from, type, status: 'calling' | 'incoming' | 'connected' }
    localStream: null,
    remoteStream: null,
    peerConnection: null,
    isMuted: false,
    isVideoOff: false,

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
                set({ remoteStream: event.streams[0] });
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
        }
    },

    handleIncomingCall: async (data) => {
        set({ call: { ...data, status: 'incoming' } });
    },

    acceptCall: async () => {
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
                set({ remoteStream: event.streams[0] });
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
            set({ peerConnection: pc, call: { ...call, status: 'connected' } });

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
            set({ call: { ...call, status: 'connected' } });
        }
    },

    handleIceCandidate: async ({ candidate }) => {
        const { peerConnection } = get();
        if (peerConnection && candidate) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
    },

    endCall: () => {
        const { localStream, peerConnection, call } = get();
        const socket = useAuthStore.getState().socket;

        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        if (peerConnection) {
            peerConnection.close();
        }

        if (call) {
            socket.emit("call:ended", { to: call.to });
        }

        set({ call: null, localStream: null, remoteStream: null, peerConnection: null, isIncomingCall: false });
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
