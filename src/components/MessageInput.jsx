import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Image, Send, X, Smile, Plus, Mic, Trash2, File, FileText } from "lucide-react";
import toast from "react-hot-toast";
import EmojiPicker from "emoji-picker-react";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileName, setFileName] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);
  const docInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { sendMessage, selectedUser, blockUser, clearMessages } = useChatStore();
  const { authUser } = useAuthStore();

  const isBlocked = authUser?.blockedUsers?.includes(selectedUser?._id);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setFilePreview(null);
    setFileName("");
    if (docInputRef.current) docInputRef.current.value = "";
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          setIsSending(true);
          try {
            await sendMessage({ audio: reader.result });
            setRecordingDuration(0);
          } catch (error) {
            toast.error("Failed to send audio");
          } finally {
            setIsSending(false);
          }
        };
      };
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
      setRecordingDuration(0);
    }
  };

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? "0" + sec : sec}`;
  };

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);

    const socket = useAuthStore.getState().socket;
    if (socket && selectedUser && !selectedUser.isGroup) {
      socket.emit("typing", { receiverId: selectedUser._id });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stopTyping", { receiverId: selectedUser._id });
      }, 2000);
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!text.trim() && !imagePreview && !filePreview) return;

    setIsSending(true);
    try {
      const socket = useAuthStore.getState().socket;
      if (socket && selectedUser && !selectedUser.isGroup) {
        socket.emit("stopTyping", { receiverId: selectedUser._id });
      }

      await sendMessage({
        text: text.trim(),
        image: imagePreview,
        file: filePreview,
        fileName: fileName,
      });

      // Clear form
      setText("");
      setImagePreview(null);
      setFilePreview(null);
      setFileName("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (docInputRef.current) docInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-3 bg-[#0a0a0a] border-t border-white/5 relative shrink-0">
      {/* Previews Overlay */}
      {(imagePreview || filePreview) && (
        <div className="absolute bottom-full left-0 w-full p-4 bg-[#1a1a1a] border-t border-white/5 flex gap-4 overflow-x-auto z-50 animate-in slide-in-from-bottom duration-200">
          {imagePreview && (
            <div className="relative group shrink-0">
              <img src={imagePreview} alt="Preview" className="size-16 object-cover rounded border border-white/10" />
              <button
                onClick={removeImage}
                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 shadow-lg"
              >
                <X className="size-3" />
              </button>
            </div>
          )}
          {filePreview && (
            <div className="bg-[#262626] p-2 rounded flex items-center gap-3 border border-white/10 relative min-w-[180px] shrink-0">
              <div className="bg-[#00a884] p-1.5 rounded">
                <FileText className="size-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-white truncate">{fileName}</p>
              </div>
              <button
                onClick={removeFile}
                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5"
              >
                <X className="size-3" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Recording UI Overlay */}
      {isRecording && (
        <div className="absolute inset-0 bg-[#0a0a0a] flex items-center gap-4 px-4 z-50">
          <div className="flex-1 flex items-center gap-3 bg-[#1a1a1a] p-2 rounded-full border border-white/5">
            <Mic className="size-4 text-red-500 animate-pulse ml-2" />
            <span className="text-white font-mono text-sm tabular-nums">{formatTime(recordingDuration)}</span>
            <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden mx-2">
              <div className="bg-red-500 h-full animate-pulse" style={{ width: '100%' }} />
            </div>
          </div>
          <button onClick={cancelRecording} className="text-red-500 p-2 hover:bg-white/5 rounded-full">
            <Trash2 className="size-5" />
          </button>
        </div>
      )}

      {/* Restricted View for Blocked Users */}
      {isBlocked ? (
        <div className="bg-[#1a1a1a] p-3 rounded text-center border border-white/5 max-w-2xl mx-auto">
          <p className="text-[var(--wa-gray)] mb-2 text-xs">You blocked this contact.</p>
          <div className="flex justify-center gap-4">
            <button onClick={() => blockUser(selectedUser._id)} className="text-[var(--wa-teal)] text-sm font-bold">Unblock</button>
            <button onClick={() => clearMessages(selectedUser._id)} className="text-red-500 text-sm font-bold">Delete Chat</button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 max-w-full mx-auto">
          <button
            type="button"
            className={`p-2 hover:bg-white/5 rounded-full transition-all shrink-0 ${showEmojiPicker ? "text-[var(--wa-teal)]" : "text-[var(--wa-gray)]"}`}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <Smile className="size-6" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsAttachmentMenuOpen(!isAttachmentMenuOpen)}
              className={`p-2 hover:bg-white/5 rounded-full transition-all shrink-0 ${isAttachmentMenuOpen ? "text-[var(--wa-teal)]" : "text-[var(--wa-gray)]"}`}
            >
              <Plus className={`size-7 transition-transform duration-200 ${isAttachmentMenuOpen ? "rotate-45" : ""}`} />
            </button>

            {isAttachmentMenuOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-40 bg-[#1a1a1a] rounded shadow-xl border border-white/5 z-50 overflow-hidden">
                <button
                  onClick={() => { fileInputRef.current?.click(); setIsAttachmentMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-[#e9edef] hover:bg-white/5 flex items-center gap-3"
                >
                  <Image className="size-4 text-blue-500" /> Gallery
                </button>
                <button
                  onClick={() => { docInputRef.current?.click(); setIsAttachmentMenuOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-[#e9edef] hover:bg-white/5 flex items-center gap-3"
                >
                  <File className="size-4 text-indigo-500" /> Document
                </button>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="flex-1 flex gap-2 items-center min-w-0">
            <input
              type="text"
              placeholder="Type a message"
              className="flex-1 bg-[#1a1a1a] outline-none rounded-lg py-2 px-4 text-[#e9edef] text-[15px] placeholder-[var(--wa-gray)] min-w-0"
              value={text}
              onChange={handleTextChange}
            />

            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
            <input type="file" className="hidden" ref={docInputRef} onChange={handleFileChange} />

            <div className="shrink-0">
              {text.trim() || imagePreview || filePreview || isRecording ? (
                <button
                  type="submit"
                  disabled={isSending || isRecording}
                  onClick={isRecording ? stopRecording : handleSendMessage}
                  className="p-2 text-[var(--wa-teal)] hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  <Send className="size-6" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startRecording}
                  className="p-2 text-[var(--wa-gray)] hover:text-white"
                >
                  <Mic className="size-6" />
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {showEmojiPicker && (
        <div className="absolute bottom-full left-0 mb-2 z-50">
          <EmojiPicker
            theme="dark"
            onEmojiClick={(emojiData) => {
              setText((prev) => prev + emojiData.emoji);
              setShowEmojiPicker(false);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default MessageInput;
