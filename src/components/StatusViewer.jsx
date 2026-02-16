import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const StatusViewer = ({ statusItem, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    const currentStatus = statusItem.statuses[currentIndex];

    useEffect(() => {
        setProgress(0);
        const duration = 5000; // 5 seconds per status
        const interval = 50;
        const step = (interval / duration) * 100;

        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    handleNext();
                    return 0;
                }
                return prev + step;
            });
        }, interval);

        return () => clearInterval(timer);
    }, [currentIndex]);

    const handleNext = () => {
        if (currentIndex < statusItem.statuses.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            onClose();
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] bg-black flex flex-col items-center justify-center p-4">
            {/* Progress Bars */}
            <div className="absolute top-4 left-4 right-4 flex gap-1 z-20">
                {statusItem.statuses.map((_, idx) => (
                    <div key={idx} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white transition-all duration-75 ease-linear"
                            style={{
                                width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%'
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Header */}
            <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-20">
                <div className="flex items-center gap-3">
                    <img src={statusItem.user.profilePic || "/avatar.png"} className="size-10 rounded-full border border-white/20" alt="" />
                    <div>
                        <h3 className="text-white font-medium">{statusItem.user.fullName}</h3>
                        <p className="text-xs text-white/60">{new Date(currentStatus.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                </div>
                <button onClick={onClose} className="text-white/80 hover:text-white p-2">
                    <X className="size-6" />
                </button>
            </div>

            {/* Main Content */}
            <div className="relative w-full max-w-lg aspect-[9/16] bg-zinc-900 rounded-xl overflow-hidden flex items-center justify-center">
                <img src={currentStatus.content} className="w-full h-full object-contain" alt="" />

                {/* Navigation Overlays */}
                <div className="absolute inset-y-0 left-0 w-1/4 cursor-pointer" onClick={handlePrev}></div>
                <div className="absolute inset-y-0 right-0 w-1/4 cursor-pointer" onClick={handleNext}></div>

                {currentStatus.text && (
                    <div className="absolute bottom-10 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-center">
                        <p className="text-white text-lg">{currentStatus.text}</p>
                    </div>
                )}
            </div>

            {/* Desktop Navigation Buttons */}
            <div className="hidden lg:flex absolute inset-x-10 top-1/2 -translate-y-1/2 justify-between">
                <button
                    onClick={handlePrev}
                    className={`p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors ${currentIndex === 0 ? 'invisible' : ''}`}
                >
                    <ChevronLeft className="size-8" />
                </button>
                <button
                    onClick={handleNext}
                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                    <ChevronRight className="size-8" />
                </button>
            </div>
        </div>
    );
};

export default StatusViewer;
