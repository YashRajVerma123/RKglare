
'use client';
import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

interface CounterProps {
  to: number;
  duration?: number;
  suffix?: string;
}

const Counter = ({ to, duration = 2, suffix = '' }: CounterProps) => {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (!inView) return;

    let start = 0;
    const end = to;
    const increment = end / (duration * 60); // 60 fps

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(Math.ceil(start));
      }
    }, 16); // ~60fps

    return () => clearInterval(timer);
  }, [inView, to, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
};

export default Counter;
