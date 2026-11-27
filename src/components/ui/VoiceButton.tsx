"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import clsx from "clsx";

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
}

declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

type VoiceMode = "whisper" | "webspeech" | "none";

export function VoiceButton({
  onTranscript,
  className,
}: VoiceButtonProps) {
  const [mode, setMode] = useState<VoiceMode>("none");
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const autoStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recognitionRef = useRef<any>(null);

  // Detect browser voice capabilities — prefer universal MediaRecorder + Groq Whisper
  useEffect(() => {
    if (typeof window === "undefined") return;

    const hasMediaRecorder =
      typeof navigator !== "undefined" &&
      !!navigator.mediaDevices?.getUserMedia &&
      typeof window.MediaRecorder !== "undefined";

    if (hasMediaRecorder) {
      setMode("whisper");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setMode("webspeech");
      return;
    }

    setMode("none");
  }, []);

  useEffect(() => {
    if (!errorMsg) return;
    const t = setTimeout(() => setErrorMsg(null), 4000);
    return () => clearTimeout(t);
  }, [errorMsg]);

  useEffect(() => {
    return () => {
      if (autoStopTimerRef.current) clearTimeout(autoStopTimerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const stopMediaTracks = () => {
    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current);
      autoStopTimerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const transcribeAudioBlob = async (blob: Blob) => {
    setIsTranscribing(true);
    setErrorMsg(null);
    try {
      const formData = new FormData();
      formData.append("file", blob, "recording.webm");
      formData.append("lang", "en-US");

      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Transcription failed");
      }

      if (data.text && data.text.trim()) {
        onTranscript(data.text.trim());
      } else {
        setErrorMsg("No speech detected");
      }
    } catch (err) {
      console.warn("Whisper transcription error:", err);
      setErrorMsg("Could not transcribe audio");
    } finally {
      setIsTranscribing(false);
    }
  };

  const toggleWhisperRecording = async () => {
    if (isTranscribing) return;

    if (isListening) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    setErrorMsg(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      audioChunksRef.current = [];

      const preferredTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/ogg",
        "audio/mp4",
      ];
      const chosenMime = preferredTypes.find(
        (type) => typeof MediaRecorder.isTypeSupported === "function" && MediaRecorder.isTypeSupported(type)
      );

      const recorder = chosenMime
        ? new MediaRecorder(stream, { mimeType: chosenMime })
        : new MediaRecorder(stream);

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        stopMediaTracks();
        setIsListening(false);
        const mimeType = recorder.mimeType || chosenMime || "audio/webm";
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        audioChunksRef.current = [];

        if (audioBlob.size > 0) {
          void transcribeAudioBlob(audioBlob);
        }
      };

      recorder.onerror = () => {
        stopMediaTracks();
        setIsListening(false);
        setErrorMsg("Recording error");
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsListening(true);

      autoStopTimerRef.current = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.stop();
        }
      }, 30000);
    } catch (err) {
      stopMediaTracks();
      setIsListening(false);
      console.warn("Microphone access error:", err);
      setErrorMsg("Allow microphone access");
    }
  };

  const toggleWebSpeechListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) onTranscript(transcript);
      };
      recognition.onerror = () => {
        setIsListening(false);
        setErrorMsg("Voice input failed");
      };
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleMicClick = () => {
    if (mode === "whisper") {
      void toggleWhisperRecording();
    } else if (mode === "webspeech") {
      toggleWebSpeechListening();
    }
  };

  if (mode === "none") {
    return null;
  }

  return (
    <div className={clsx("relative inline-flex items-center", className)}>
      <button
        type="button"
        onClick={handleMicClick}
        disabled={isTranscribing}
        aria-label={
          isTranscribing
            ? "Transcribing voice"
            : isListening
            ? "Stop recording"
            : "Start voice input"
        }
        title={
          isTranscribing
            ? "Transcribing with Groq Whisper..."
            : isListening
            ? "Recording... Click to stop & transcribe"
            : "Voice dictation (Click to start, click again to stop)"
        }
        className={clsx(
          "min-w-[44px] min-h-[44px] p-2.5 rounded-xl transition-all flex items-center justify-center shrink-0 shadow-2xs",
          isTranscribing
            ? "bg-teal-100 text-teal-700 border border-teal-300 cursor-wait"
            : isListening
            ? "bg-red-500 text-white animate-pulse ring-4 ring-red-100"
            : "bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200"
        )}
      >
        {isTranscribing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isListening ? (
          <Square className="w-4 h-4 fill-current" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </button>

      {errorMsg && (
        <span className="absolute -top-9 left-0 whitespace-nowrap text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-lg shadow-sm z-20">
          {errorMsg}
        </span>
      )}
    </div>
  );
}
