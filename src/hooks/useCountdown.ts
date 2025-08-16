import { useState, useEffect, useCallback } from 'react';

interface UseCountdownOptions {
  onComplete?: () => void;
  autoStart?: boolean;
}

interface UseCountdownReturn {
  timeLeft: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
  setTime: (seconds: number) => void;
}

export const useCountdown = (
  initialTime: number,
  options: UseCountdownOptions = {}
): UseCountdownReturn => {
  const { onComplete, autoStart = false } = options;
  
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [initialTimeState, setInitialTimeState] = useState(initialTime);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setTimeLeft(initialTimeState);
    setIsRunning(false);
  }, [initialTimeState]);

  const setTime = useCallback((seconds: number) => {
    setInitialTimeState(seconds);
    setTimeLeft(seconds);
    setIsRunning(false);
  }, []);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          setIsRunning(false);
          onComplete?.();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, timeLeft, onComplete]);

  // Update initial time when prop changes
  useEffect(() => {
    setInitialTimeState(initialTime);
    setTimeLeft(initialTime);
  }, [initialTime]);

  return {
    timeLeft,
    isRunning,
    start,
    pause,
    reset,
    setTime,
  };
};

export default useCountdown;
