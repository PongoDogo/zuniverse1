import { Check } from "lucide-react";
import { motion } from "framer-motion";

const WatchedBadge = () => (
  <motion.div 
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    className="absolute top-1 right-1 z-10 bg-success rounded-full p-1 shadow-md status-breathing"
    style={{ color: 'hsl(var(--success))' }}
  >
    <Check className="w-2.5 h-2.5 text-success-foreground" />
  </motion.div>
);

export default WatchedBadge;
