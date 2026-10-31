import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function IntroAnimation({ onComplete }) {
  const [stage, setStage] = useState(0); // 0: logo emerges in center, 1: logo slides left + text reveals right, 2: tagline
  const [isExiting, setIsExiting] = useState(false);

  // Exact rule: All CAPS in Green, all small in Black
  const titleCharacters = [
    { char: 'N', isCap: true },
    { char: 'E', isCap: true },
    { char: 'h', isCap: false },
    { char: 'A', isCap: true },
    { char: 'I', isCap: true },
    { char: 'r', isCap: false },
    { char: 'o', isCap: false },
    { char: '.', isCap: false },
    { char: 'F', isCap: true },
    { char: 'S', isCap: true },
  ];

  useEffect(() => {
    // Stage 0: Logo emerges in the middle
    // Stage 1 (700ms): Logo slides left and text reveals to the right
    const t1 = setTimeout(() => setStage(1), 700);

    // Stage 2 (1500ms): Tagline smoothly fades in
    const t2 = setTimeout(() => setStage(2), 1500);

    // Stage 3 (3300ms): Smooth transition into the workstation
    const t3 = setTimeout(() => handleFinish(), 3300);

    const handleKeyDown = (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        handleFinish();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleFinish = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      onComplete?.();
    }, 450);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.065,
        delayChildren: 0.1,
      },
    },
  };

  const letterVariants = {
    hidden: {
      opacity: 0,
      y: 14,
      scale: 0.88,
      filter: 'blur(5px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1], // Smooth organic deceleration
      },
    },
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02, filter: 'blur(6px)' }}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          onClick={handleFinish}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#ffffff] text-black cursor-pointer select-none overflow-hidden"
        >
          {/* Main Stage Lockup */}
          <div className="relative z-10 flex flex-col items-center">

            {/* Row Lockup: Logo + Text */}
            <motion.div
              layout
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center justify-center"
            >
              {/* Logo: Emerges in center, slides left when stage >= 1 */}
              <motion.div
                layout
                initial={{ scale: 0.2, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  transition: {
                    type: 'spring',
                    stiffness: 260,
                    damping: 20,
                    duration: 0.6
                  }
                }}
                className="w-14 h-14 sm:w-20 sm:h-20 md:w-28 md:h-28 bg-[#ffffff] flex items-center justify-center p-1 shrink-0"
              >
                <img
                  src="/logo.png"
                  alt="NEhAIro Logo"
                  className="w-full h-full object-contain"
                />
              </motion.div>

              {/* Text: Unfolds to the right in a smooth line */}
              <AnimatePresence>
                {stage >= 1 && (
                  <motion.div
                    initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                    animate={{
                      opacity: 1,
                      width: 'auto',
                      marginLeft: 12,
                      transition: {
                        duration: 0.5,
                        ease: [0.22, 1, 0.36, 1]
                      }
                    }}
                    exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                    className="overflow-hidden flex items-center whitespace-nowrap"
                  >
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="flex items-center space-x-0.5 md:space-x-1 font-mono tracking-tight text-2xl sm:text-4xl md:text-6xl font-black select-none"
                    >
                      {titleCharacters.map((item, idx) => {
                        // Caps in Green (#16a34a), small in Black (#000000)
                        const textColor = item.isCap ? 'text-[#16a34a]' : 'text-[#000000]';

                        return (
                          <motion.span
                            key={idx}
                            variants={letterVariants}
                            className={`inline-block font-mono ${textColor}`}
                          >
                            {item.char}
                          </motion.span>
                        );
                      })}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Tagline: Exact formatting "Dive into the world of Remote Automation" */}
            {stage >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="mt-6 text-center font-mono"
              >
                <p className="text-sm md:text-base text-[#475569] font-medium tracking-wide">
                  Dive into the world of Remote Automation
                </p>
              </motion.div>
            )}

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
