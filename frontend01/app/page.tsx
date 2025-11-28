'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import CanvasBackground from '@/components/CanvasBackground';

export default function LandingPage() {
  return (
    <CanvasBackground>
      {/* Content */}
      <main className="flex flex-col items-center justify-center h-full px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 mb-8">
            Experience the future of <br className="hidden md:block" />
            campus management.
          </h1>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Link
              href="/login"
              className="group relative inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full font-medium text-lg transition-all hover:bg-gray-200 hover:scale-105 active:scale-95"
            >
              <span>Login</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />

              {/* Button Glow Effect */}
              <div className="absolute inset-0 rounded-full bg-white/50 blur-lg opacity-0 group-hover:opacity-50 transition-opacity" />
            </Link>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer / Branding */}
      <footer className="absolute bottom-8 w-full text-center text-white/20 text-sm font-light tracking-widest uppercase">
        Void07 System
      </footer>
    </CanvasBackground>
  );
}
