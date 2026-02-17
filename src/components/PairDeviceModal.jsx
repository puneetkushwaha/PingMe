import { X, QrCode, ShieldCheck, Monitor, Camera, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";

const PairDeviceModal = ({ isOpen, onClose }) => {
    const [pairingCode, setPairingCode] = useState("");
    const [isScanning, setIsScanning] = useState(true);
    const { pairWeb } = useAuthStore();

    useEffect(() => {
        let scanner = null;
        if (isOpen && isScanning) {
            scanner = new Html5QrcodeScanner("reader", {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            });

            scanner.render(async (decodedText) => {
                setPairingCode(decodedText);
                setIsScanning(false);
                await pairWeb(decodedText);
                onClose();
            }, (error) => {
                // Ignore scanner errors
            });
        }

        return () => {
            if (scanner) {
                scanner.clear().catch(err => console.error("Failed to clear scanner", err));
            }
        };
    }, [isOpen, isScanning, pairWeb, onClose]);

    const handlePair = async (e) => {
        if (e) e.preventDefault();
        if (pairingCode.length < 4) return;
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
                                <div className="p-2 bg-primary/10 rounded-xl">
                                    <Camera className="size-5 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-[#e9edef]">Scan QR Code</h3>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                                <X className="size-5 text-zinc-400" />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            {isScanning ? (
                                <div className="space-y-6">
                                    <div className="flex flex-col items-center text-center space-y-2 mb-2">
                                        <p className="text-[#e9edef] font-medium">Capture QR Code</p>
                                        <p className="text-xs text-zinc-400">Point your camera at the QR code on your computer screen.</p>
                                    </div>
                                    <div id="reader" className="overflow-hidden rounded-2xl border-2 border-[#00a884] bg-black shadow-inner"></div>
                                    <button
                                        onClick={() => setIsScanning(false)}
                                        className="w-full py-3 text-sm text-[#00a884] hover:underline transition-all"
                                    >
                                        Use pairing code instead
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex flex-col items-center text-center space-y-4">
                                        <div className="p-4 bg-primary/5 rounded-full ring-8 ring-primary/5">
                                            <QrCode className="size-12 text-primary" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[#e9edef] font-medium">Enter Pairing Code</p>
                                            <p className="text-sm text-zinc-400">Type the 8-character code shown on your screen.</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handlePair} className="space-y-4">
                                        <div className="form-control">
                                            <input
                                                type="text"
                                                placeholder="Enter Pairing Code"
                                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-center text-xl font-mono tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                                value={pairingCode}
                                                maxLength={8}
                                                onChange={(e) => setPairingCode(e.target.value.toUpperCase())}
                                                autoFocus
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={pairingCode.length < 8}
                                            className="w-full py-4 bg-primary text-primary-content rounded-xl font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/20"
                                        >
                                            Link This Device
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setIsScanning(true)}
                                            className="w-full py-3 text-sm text-[#00a884] hover:underline transition-all"
                                        >
                                            Back to QR Scanner
                                        </button>
                                    </form>
                                </>
                            )}

                            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-start gap-3 mt-4">
                                <ShieldCheck className="size-5 text-emerald-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-emerald-500/80 leading-relaxed">
                                    Linking a device allows you to stay synced across browsers. Your messages remain end-to-end encrypted.
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
