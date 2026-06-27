"use client";
import { motion } from "framer-motion";

interface FloatingBean {
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  rotation: number;
}

const BEANS: FloatingBean[] = [
  { x: 8, y: 12, size: 28, delay: 0, duration: 5.5, rotation: 15 },
  { x: 82, y: 8, size: 20, delay: 0.8, duration: 6.5, rotation: -20 },
  { x: 15, y: 78, size: 24, delay: 1.4, duration: 5, rotation: 35 },
  { x: 75, y: 72, size: 32, delay: 0.3, duration: 7, rotation: -10 },
  { x: 50, y: 5, size: 18, delay: 1.8, duration: 4.5, rotation: 45 },
  { x: 90, y: 42, size: 22, delay: 0.6, duration: 6, rotation: -30 },
  { x: 5, y: 48, size: 16, delay: 2.1, duration: 5.8, rotation: 25 },
  { x: 60, y: 90, size: 26, delay: 1.1, duration: 6.2, rotation: -15 },
  { x: 35, y: 85, size: 14, delay: 2.5, duration: 4.8, rotation: 50 },
  { x: 92, y: 20, size: 18, delay: 0.4, duration: 7.2, rotation: -40 },
];

function BeanShape({ size, rotation, opacity = 0.12 }: { size: number; rotation: number; opacity?: number }) {
  return (
    <svg width={size} height={size * 0.78} viewBox="0 0 40 31" fill="none">
      <ellipse cx="20" cy="15.5" rx="18" ry="13.5" fill="#2C1810" fillOpacity={opacity} />
      <path
        d="M4 14 Q20 8 36 14"
        stroke="#2C1810"
        strokeOpacity={opacity * 1.5}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

interface FloatingBeansProps {
  dark?: boolean;
}

export default function FloatingBeans({ dark = false }: FloatingBeansProps) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {BEANS.map((bean, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${bean.x}%`,
            top: `${bean.y}%`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: bean.delay * 0.5, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <motion.div
            animate={{
              y: [0, -10, -4, -12, 0],
              rotate: [bean.rotation, bean.rotation + 5, bean.rotation - 2, bean.rotation + 3, bean.rotation],
            }}
            transition={{
              duration: bean.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: bean.delay,
            }}
          >
            <BeanShape
              size={bean.size}
              rotation={bean.rotation}
              opacity={dark ? 0.15 : 0.1}
            />
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
