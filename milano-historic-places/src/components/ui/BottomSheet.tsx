import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import type { Place } from '../types';

type Props = {
  place: Place;
  onClose: () => void;
};

export default function BottomSheet({ place, onClose }: Props) {
  const variants = {
    hidden: { y: '100%' },
    visible: { y: 0 }
  };
  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.y > window.innerHeight * 0.3) onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-lg bg-white p-4 shadow-lg"
        style={{ height: '60vh' }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        onDragEnd={handleDragEnd}
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={variants}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="w-12 h-1.5 bg-gray-300 rounded mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">{place.title}</h2>
        <img
          src={place.image}
          alt={place.title}
          className="w-full h-40 object-cover rounded mb-2"
        />
        <p className="text-gray-700">{place.teaser}</p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Chiudi
        </button>
      </motion.div>
    </AnimatePresence>
  );
}