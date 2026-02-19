import { X, QrCode, ShieldCheck, Monitor, Camera as CameraIcon, RefreshCw, Smartphone as SmartphoneIcon, List, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import LinkedDevices from "./LinkedDevices";
import toast from "react-hot-toast";

const PairDeviceModal = ({ isOpen, onClose }) => {
    const [pairingCode, setPairingCode] = useState("");
    const [activeTab, setActiveTab] = useState("link"); // "link" or "devices"
    const { pairWeb } = useAuthStore();

    const handlePair = async (e) => {
        if (e) e.preventDefault();
        if (pairingCode.length < 6) return;
        await pairWeb(pairingCode);
        setActiveTab("devices");
        setPairingCode("");
    };

    const [copied, setCopied] = useState(false);
    const WEB_URL = "https://ping-me-web-chi.vercel.app/";

    const copyToClipboard = () => {
        navigator.clipboard.writeText(WEB_URL);
        setCopied(true);
        toast.success("Link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-[#1d232a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
                    >
                        {/* Header with Tabs */}
                        <div className="bg-white/[0.02]">
                            <div className="p-6 flex items-center justify-between">
                                <h3 className="text-xl font-bold text-[#e9edef]">Linked Devices</h3>
                                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                    <X className="size-5 text-zinc-400" />
                                </button>
                            </div>

                            <div className="flex px-6 border-b border-white/5">
                                <button
                                    onClick={() => setActiveTab("link")}
                                    className={`flex-1 py-3 text-sm font-medium transition-all border-b-2 flex items-center justify-center gap-2 ${activeTab === "link" ? "border-[#00a884] text-[#00a884]" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}
                                >
                                    <Smartphone className="size-4" /> Link New
                                </button>
                                <button
                                    onClick={() => setActiveTab("devices")}
                                    className={`flex-1 py-3 text-sm font-medium transition-all border-b-2 flex items-center justify-center gap-2 ${activeTab === "devices" ? "border-[#00a884] text-[#00a884]" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}
                                >
                                    <List className="size-4" /> Manage
                                </button>
                            </div>
                        </div>

                        <div className="p-8">
                            <AnimatePresence mode="wait">
                                {activeTab === "link" ? (
                                    <motion.div
                                        key="link-tab"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="space-y-8"
                                    >
                                        <div className="flex flex-col items-center text-center space-y-4">
                                            <div className="p-4 bg-[#00a884]/5 rounded-full ring-8 ring-[#00a884]/5">
                                                <Monitor className="size-12 text-[#00a884]" />
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-[#e9edef] text-lg font-medium">Link Web Device</p>
                                                <p className="text-sm text-zinc-400 leading-relaxed px-4">
                                                    Enter the 6-digit code shown on your desktop to authorize the link.
                                                </p>
                                                <div className="flex flex-col items-center gap-2 pt-2">
                                                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Open on your computer</p>
                                                    <button
                                                        onClick={copyToClipboard}
                                                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all group"
                                                    >
                                                        <span className="text-xs text-[#e9edef] font-medium">{WEB_URL}</span>
                                                        {copied ? (
                                                            <Check className="size-3 text-[#00a884]" />
                                                        ) : (
                                                            <Copy className="size-3 text-zinc-500 group-hover:text-[#00a884]" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <form onSubmit={handlePair} className="space-y-6">
                                            <div className="flex justify-center gap-2">
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    placeholder="000000"
                                                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-4 py-4 text-center text-3xl font-mono font-bold tracking-[0.5em] text-[#00a884] focus:outline-none focus:ring-2 focus:ring-[#00a884]/50 transition-all placeholder:opacity-20"
                                                    value={pairingCode}
                                                    maxLength={6}
                                                    onChange={(e) => setPairingCode(e.target.value.replace(/\D/g, ""))}
                                                    autoFocus
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={pairingCode.length < 6}
                                                className="w-full py-4 bg-[#00a884] text-[#111b21] rounded-2xl font-bold hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg active:scale-[0.98]"
                                            >
                                                Verify & Link
                                            </button>
                                        </form>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="devices-tab"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                    >
                                        <LinkedDevices />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="mt-8 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-start gap-3">
                                <ShieldCheck className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-emerald-500/70 leading-relaxed">
                                    Your personal messages are end-to-end encrypted on all your linked devices.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PairDeviceModal;
