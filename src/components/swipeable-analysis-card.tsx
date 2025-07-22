
"use client";

import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { AnalysisCard } from './analysis-card';
import type { Analysis } from '@/lib/types';
import { useState } from 'react';

interface SwipeableAnalysisCardProps {
  analysis: Analysis;
  onSwipe: (direction: 'right' | 'left') => void;
  isTopCard: boolean;
}

const swipeThreshold = 50;

export function SwipeableAnalysisCard({ analysis, onSwipe, isTopCard }: SwipeableAnalysisCardProps) {
  const x = useMotionValue(0);
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | null>(null);

  // Rotate the card as it's dragged
  const rotate = useTransform(x, [-150, 0, 150], [-20, 0, 20]);
  
  // Opacity of the "Approve" / "Archive" overlays
  const approveOpacity = useTransform(x, [0, swipeThreshold], [0, 1]);
  const archiveOpacity = useTransform(x, [0, -swipeThreshold], [0, 1]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > swipeThreshold) {
      onSwipe('right');
    } else if (info.offset.x < -swipeThreshold) {
      onSwipe('left');
    }
  };

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setDragDirection(info.offset.x > 0 ? 'right' : 'left');
  };

  return (
    <motion.div
      className="absolute w-full max-w-lg cursor-grab"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      style={{ x, rotate }}
      animate={{
          y: isTopCard ? 0 : -20,
          scale: isTopCard ? 1 : 0.9,
          zIndex: isTopCard ? 10 : 1,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      exit={{ x: dragDirection === 'right' ? 300 : -300, opacity: 0, scale: 0.5, transition: { duration: 0.3 } }}
    >
        <div className="relative">
            <motion.div 
                style={{ opacity: approveOpacity }}
                className="absolute inset-0 bg-green-500/20 rounded-lg border-2 border-green-500 flex items-center justify-center font-bold text-green-400"
            >
                APPROVE
            </motion.div>
            <motion.div 
                style={{ opacity: archiveOpacity }}
                className="absolute inset-0 bg-red-500/20 rounded-lg border-2 border-red-500 flex items-center justify-center font-bold text-red-400"
            >
                ARCHIVE
            </motion.div>
            <AnalysisCard analysis={analysis} />
        </div>
    </motion.div>
  );
}
