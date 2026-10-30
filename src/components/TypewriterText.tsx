"use client";

import { useEffect, useState } from "react";

type TypewriterTextProps = {
  text: string;
  onStart: () => void;
  onComplete: () => void;
};

const CHARACTER_INTERVAL_MS = 28;

export default function TypewriterText({ text, onStart, onComplete }: TypewriterTextProps) {
  const [visibleCharacters, setVisibleCharacters] = useState(0);
  const characters = Array.from(text);
  const isTyping = visibleCharacters < characters.length;

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let interval: number | undefined;
    let position = 0;

    function finish() {
      window.clearInterval(interval);
      setVisibleCharacters(Array.from(text).length);
      onComplete();
    }

    function handleMotionChange() {
      if (motionPreference.matches) finish();
    }

    onStart();
    if (motionPreference.matches || !text) {
      finish();
    } else {
      const length = Array.from(text).length;
      interval = window.setInterval(() => {
        position += 1;
        setVisibleCharacters(position);
        if (position >= length) {
          window.clearInterval(interval);
          onComplete();
        }
      }, CHARACTER_INTERVAL_MS);
    }
    motionPreference.addEventListener("change", handleMotionChange);
    return () => {
      window.clearInterval(interval);
      motionPreference.removeEventListener("change", handleMotionChange);
    };
  }, [text, onStart, onComplete]);

  return (
    <span className="relative block">
      <span className="invisible" aria-hidden="true">{text}</span>
      <span className="sr-only">{text}</span>
      <span className="absolute inset-0" aria-hidden="true">
        {characters.slice(0, visibleCharacters).join("")}
        {isTyping && <span className="chatbot-typing-cursor ml-0.5 inline-block h-3 w-0.5 translate-y-0.5 bg-emerald-400" />}
      </span>
    </span>
  );
}
