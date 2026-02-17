import { X, QrCode, ShieldCheck, Monitor, Camera, RefreshCw, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Html5Qrcode } from "html5-qrcode";
import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";

const PairDeviceModal = ({ isOpen, onClose }) => {
    const [pairingCode, setPairingCode] = useState("");
    const { pairWeb } = useAuthStore();

    const handlePair = async (e) => {
        if (e) e.preventDefault();
        if (pairingCode.length < 6) return;
        await pairWeb(pairingCode);
        onClose();
        setPairingCode("");
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
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#00a884]/10 rounded-xl">
                                    <Monitor className="size-5 text-[#00a884]" />
                                </div>
                                <h3 className="text-xl font-bold text-[#e9edef]">Link a Device</h3>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                <X className="size-5 text-zinc-400" />
                            </button>
                        </div>

                        <div className="p-8 space-y-8">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="p-4 bg-[#00a884]/5 rounded-full ring-8 ring-[#00a884]/5">
                                    <Smartphone className="size-12 text-[#00a884]" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[#e9edef] text-lg font-medium">Enter Pairing Code</p>
                                    <p className="text-sm text-zinc-400 leading-relaxed px-4">
                                        Type the 6-digit code shown on your computer screen to link this device.
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handlePair} className="space-y-6">
                                <div className="flex justify-center gap-2">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="000000"
                                        className="w-full max-w-[240px] bg-black/20 border border-white/10 rounded-2xl px-4 py-4 text-center text-3xl font-mono font-bold tracking-[0.5em] text-[#00a884] focus:outline-none focus:ring-2 focus:ring-[#00a884]/50 transition-all placeholder:opacity-20"
                                        value={pairingCode}
                                        maxLength={6}
                                        onChange={(e) => setPairingCode(e.target.value.replace(/\D/g, ""))}
                                        autoFocus
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={pairingCode.length < 6}
                                    className="w-full py-4 bg-[#00a884] text-[#111b21] rounded-2xl font-bold hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#00a884]/10 active:scale-[0.98]"
                                >
                                    Confirm Linking
                                </button>
                            </form>

                            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-start gap-3">
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
