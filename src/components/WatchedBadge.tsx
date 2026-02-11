import { Check } from "lucide-react";

const WatchedBadge = () => (
  <div className="absolute top-1 right-1 z-10 bg-success rounded-full p-1 shadow-md">
    <Check className="w-2.5 h-2.5 text-success-foreground" />
  </div>
);

export default WatchedBadge;
