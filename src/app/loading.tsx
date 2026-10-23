import { TypewriterLoader } from "@/components/ui/typewriter-loader";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0d1417] flex items-center justify-center p-4">
      <TypewriterLoader
        message="Loading SPLit..."
        subMessage="Preparing expenses, balances and instant settle-ups"
        size="lg"
      />
    </div>
  );
}
