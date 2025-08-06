"use client";

import { useState, useEffect } from "react";

interface TypingAnimationProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  onTextUpdate?: () => void;
}

export default function TypingAnimation({
  text,
  speed = 30,
  onComplete,
  onTextUpdate,
}: TypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Reset when text changes
    setDisplayedText("");
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(text.slice(0, currentIndex + 1));
        setCurrentIndex((prev) => prev + 1);
        onTextUpdate?.(); // 텍스트가 업데이트될 때마다 호출
      }, speed);

      return () => clearTimeout(timer);
    } else if (onComplete && currentIndex >= text.length && text.length > 0) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete, onTextUpdate]);

  return (
    <span>
      {displayedText}
      {currentIndex < text.length && <span className="animate-pulse">|</span>}
    </span>
  );
}
