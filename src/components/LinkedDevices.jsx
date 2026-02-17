import { Trash2, Monitor, Smartphone, Laptop, Clock, ShieldCheck } from "lucide-react";
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { formatDistanceToNow } from "date-fns";

const LinkedDevices = () => {
    const { linkedDevices, getLinkedDevices, unlinkDevice, isFetchingDevices } = useAuthStore();

    useEffect(() => {
        getLinkedDevices();
    }, [getLinkedDevices]);

    const getDeviceIcon = (deviceName) => {
        const name = deviceName.toLowerCase();
        if (name.includes("windows") || name.includes("linux") || name.includes("mac")) return <Laptop className="size-5" />;
        if (name.includes("android") || name.includes("iphone")) return <Smartphone className="size-5" />;
        return <Monitor className="size-5" />;
    };

    if (isFetchingDevices && linkedDevices.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-4">
                <div className="size-8 border-2 border-[#00a884] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-zinc-400">Loading linked devices...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Linked Devices</h4>
                <span className="text-xs text-[#00a884] font-medium">{linkedDevices.length} / 4</span>
            </div>

            {linkedDevices.length === 0 ? (
                <div className="p-6 bg-white/5 rounded-2xl border border-white/5 text-center">
                    <p className="text-sm text-zinc-500">No other devices linked to this account.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {linkedDevices.map((device) => (
                        <div
                            key={device.deviceId}
                            className="p-4 bg-white/[0.03] hover:bg-white/[0.05] border border-white/5 rounded-2xl flex items-center gap-4 transition-all group"
                        >
                            <div className="p-3 bg-zinc-800 rounded-xl text-zinc-400 group-hover:text-[#00a884] transition-colors">
                                {getDeviceIcon(device.deviceName)}
                            </div>

                            <div className="flex-1 min-w-0">
                                <h5 className="text-[#e9edef] font-medium truncate">{device.deviceName}</h5>
                                <div className="flex items-center gap-2 text-xs text-zinc-500">
                                    <Clock className="size-3" />
                                    <span>Last active: {formatDistanceToNow(new Date(device.lastActiveAt), { addSuffix: true })}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => unlinkDevice(device.deviceId)}
                                className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                title="Log out"
                            >
                                <Trash2 className="size-5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-center gap-2 px-1 opacity-50">
                <ShieldCheck className="size-3 text-[#00a884]" />
                <p className="text-[10px] text-zinc-500">Your sessions are private and encrypted.</p>
            </div>
        </div>
    );
};

export default LinkedDevices;
