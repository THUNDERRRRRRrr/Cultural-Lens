import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';

const Timeline = ({ events }) => {
  if (!events || events.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-primary">
        <Calendar size={20} />
        Historical Timeline
      </h3>
      <div className="relative border-l-2 border-primary/30 ml-3">
        {events.map((item, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
            className="mb-8 pl-6 relative"
          >
            {/* Timeline Dot */}
            <div className="absolute w-4 h-4 bg-background border-2 border-secondary rounded-full -left-[9px] top-1 shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
            
            <div className="bg-white/5 border border-gray-700/50 rounded-xl p-4 backdrop-blur-sm">
              <span className="text-secondary font-bold text-lg block mb-1">{item.year}</span>
              <p className="text-gray-300 text-sm">{item.event}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;
