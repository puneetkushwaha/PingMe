import { useState, useRef, useEffect } from "react";
import { Mic, Square, Trash2, Send } from "lucide-react";
import toast from "react-hot-toast";

const VoiceRecorder = ({ onSend, onCancel }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);

    useEffect(() => {
        startRecording();
        return () => {
            stopRecordingCleanup();
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);

            timerRef.current = setInterval(() => {
                setRecordingDuration((prev) => prev + 1);
            }, 1000);

        } catch (error) {
            console.error("Error accessing microphone:", error);
            toast.error("Microphone access denied");
            onCancel();
        }
    };

    const stopRecordingCleanup = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
    };

    const handleSend = () => {
        stopRecordingCleanup();
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = () => {
                    const base64Audio = reader.result;
                    onSend(base64Audio);
                };
            };
        } else {
            onCancel();
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div className="flex items-center gap-3 w-full animate-fade-in px-2">
            <div className="flex items-center gap-2 text-red-500 animate-pulse">
                <div className="size-3 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium">{formatTime(recordingDuration)}</span>
            </div>

            <div className="flex-1"></div>

            <button
                onClick={onCancel}
                className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                title="Cancel recording"
            >
                <Trash2 className="size-5" />
            </button>

            <button
                onClick={handleSend}
                className="p-2 bg-[#00a884] text-[#111b21] rounded-full hover:bg-[#008f6f] transition-colors"
                title="Send voice note"
            >
                <Send className="size-5" />
            </button>
        </div>
    );
};

export default VoiceRecorder;
