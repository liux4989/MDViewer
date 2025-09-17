/**
 * TOC Container Component
 * Pure presentation component that renders the appropriate TOC view
 * Uses split stores for mode and TOC data
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useToc } from '../stores/TocContext';
import { useTocModeSelectors } from '../stores/TocModeContext';
import TocPreviewView from './TocPreviewView';
import TocDetailView from './TocDetailView';

/**
 * Props for TocContainer component
 */
export interface TocContainerProps {
  /** Whether the floating TOC is visible */
  visible?: boolean;
}

/**
 * TOC Container Component
 * Pure presentation component that renders the appropriate TOC view
 * Uses split stores for mode and TOC data
 */
export function TocContainer({ visible = true }: TocContainerProps) {
  const toc = useToc();
  const modeSelectors = useTocModeSelectors();
  const isPreviewMode = modeSelectors.isPreviewMode();

  if (!visible) {
    return null;
  }

  // Animation variants for scale up with slide effect
  const containerVariants = {
    initial: {
      scale: 0.9,
      opacity: 0.7,
      x: 15  // Slight movement from right to left
    },
    animate: {
      scale: 1.05,  // Slightly larger for emphasis
      opacity: 1,
      x: 0
    },
    exit: {
      scale: 0.9,
      opacity: 0.7,
      x: 15
    }
  };

  // Render floating TOC directly (plugin handles positioning)
  // For preview mode, render without container to look more like built-in editor component
  // For detail mode, use container styling for proper floating appearance
  return (
    <AnimatePresence mode="wait">
      {isPreviewMode ? (
        <motion.div
          key="preview"
          variants={containerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{
            duration: 0.25,
            ease: [0.55, 0.06, 0.68, 0.19] // Smooth easeIn
          }}
        >
          <TocPreviewView
            headings={toc.headings}
            activeHeadingId={toc.activeHeadingId}
            className="toc-preview-floating"
          />
        </motion.div>
      ) : (
        <motion.div
          key="detail"
          className="toc-floating-container"
          variants={containerVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{
            duration: 0.25,
            ease: [0.55, 0.06, 0.68, 0.19] // Smooth easeIn
          }}
        >
          <TocDetailView
            headings={toc.headings}
            activeHeadingId={toc.activeHeadingId}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default TocContainer;

