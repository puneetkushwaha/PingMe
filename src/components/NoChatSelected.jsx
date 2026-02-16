import { MessageSquare, Lock } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-[#222e35] border-l border-[var(--wa-header-bg)]">
      <div className="max-w-md text-center space-y-6">
        {/* Icon Display */}
        <div className="flex justify-center gap-4 mb-4">
          <div className="relative">
            <div className="animate-pulse">
              <MessageSquare className="size-24 text-[#41525d]" />
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <h2 className="text-3xl font-light text-[#e9edef] mt-10">PingMe Web</h2>
        <p className="text-[#8696a0] text-sm mt-4 leading-6">
          Send and receive messages without keeping your phone online.<br />
          Use PingMe on up to 4 linked devices and 1 phone.
        </p>

        <div className="mt-12 flex items-center justify-center gap-2 text-[#667781] text-xs absolute bottom-10">
          <Lock className="size-3" /> End-to-end encrypted
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;
