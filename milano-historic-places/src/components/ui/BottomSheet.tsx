import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import type { Place } from '../types';

type Props = {
  place: Place;
  onClose: () => void;
};

export default function BottomSheet({ place, onClose }: Props) {
  const sheetVariants = {
    hidden: { y: '100%' },
    visible: { y: 0 }
  };
  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.y > window.innerHeight * 0.25) onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black" onClick={onClose}
      />
      <motion.div
        drag="y" dragConstraints={{ top: 0, bottom: 0 }} onDragEnd={handleDragEnd}
        variants={sheetVariants} initial="hidden" animate="visible" exit="hidden"
        transition={{ type: 'spring', stiffness: 300, damping: 35 }}
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-white p-4 shadow-lg"
        style={{ height: '70vh' }}
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-neutral-300" />
        <h2 className="mb-2 text-lg font-semibold">{place.title}</h2>
        <img
          src={place.image} alt={place.title}
          className="mb-2 h-40 w-full rounded-lg object-cover"
        />
        <p className="text-sm text-neutral-700">{place.teaser}</p>
        <button
          onClick={onClose}
          className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm text-white"
        >Chiudi</button>
      </motion.div>
    </AnimatePresence>
  );
}