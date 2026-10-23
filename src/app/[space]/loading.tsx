import { TypewriterLoader } from "@/components/ui/typewriter-loader";

export default function SpaceLoading() {
  return (
    <div className="min-h-screen bg-[#0d1417] flex items-center justify-center p-4">
      <TypewriterLoader
        message="Loading Ledger Space..."
        subMessage="Retrieving balances, member contributions and history"
        size="lg"
      />
    </div>
  );
}
