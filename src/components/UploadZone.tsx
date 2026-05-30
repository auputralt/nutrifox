"use client";

import { useCallback, useRef, useState, useEffect } from "react";

interface Props {
  onFile: (file: File, preview: string) => void;
}

export default function UploadZone({ onFile }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const facingModeRef = useRef<"environment" | "user">("environment");

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert("File too large. Maximum 10 MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        onFile(file, e.target?.result as string);
      };
      reader.readAsDataURL(file);
    },
    [onFile]
  );

  // Capture frame from webcam video as a File
  const captureWebcamFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = video.videoWidth;
    canvas.height = video.height;

    // Mirror if front camera (laptop face cam)
    const isFront = facingModeRef.current === "user";
    if (isFront) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], "webcam-capture.jpg", {
          type: "image/jpeg",
          lastModified: Date.now(),
        });
        const url = URL.createObjectURL(blob);
        const reader = new FileReader();
        reader.onload = (e) => {
          URL.revokeObjectURL(url);
          onFile(file, e.target?.result as string);
        };
        reader.readAsDataURL(blob);
      },
      "image/jpeg",
      0.92
    );
  }, [onFile]);

  // Stop webcam stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    facingModeRef.current = "environment";
  }, []);

  // Start webcam — tries rear camera, then front camera, then native fallback
  const startWebcam = useCallback(async () => {
    try {
      let stream: MediaStream | null = null;
      const constraints: Array<{
        video: MediaTrackConstraints;
      }> = [
        {
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        },
        {
          video: {
            facingMode: { ideal: "user" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        },
      ];

      for (const c of constraints) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(c);
          // Track which facing mode succeeded
          const track = stream.getVideoTracks()[0];
          const settings = track?.getSettings?.();
          facingModeRef.current =
            ((settings?.facingMode as string) || "environment") as "user" | "environment";
          break;
        } catch {
          continue; // Try next constraint
        }
      }

      if (!stream) throw new Error("No camera available");

      streamRef.current = stream;
      setCameraActive(true);
    } catch (err) {
      // getUserMedia not available (no HTTPS, permission denied, no camera)
      console.log("getUserMedia unavailable, falling back to native camera:", err);
      cameraInputRef.current?.click();
    }
  }, []);

  // Attach stream to video element when camera activates
  useEffect(() => {
    const video = videoRef.current;
    if (video && streamRef.current) {
      video.srcObject = streamRef.current;
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [cameraActive]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      setTimeout(() => {
        e.target.value = "";
      }, 300);
    },
    [handleFile]
  );

  const handleTakePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Always try getUserMedia first (works on laptop + mobile)
    startWebcam();
  };

  // Webcam video preview
  const webcamPreview = cameraActive && streamRef.current && (
    <div className="w-full mt-4 rounded-xl overflow-hidden bg-black animate-scale-in">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-auto max-h-[300px] object-contain"
        style={{
          transform: facingModeRef.current === "user" ? "scaleX(-1)" : "none",
        }}
      />
      <div className="flex items-center justify-center gap-3 py-3 bg-black/80">
        <button
          onClick={(e) => {
            e.stopPropagation();
            captureWebcamFrame();
          }}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent-glow active:scale-[0.97] transition-all min-h-[44px]"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M14.31 8l5.74 9.42M17.66 8l-5.74 9.42M6.34 15.66l5.74-9.42" />
          </svg>
          Capture
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            stopCamera();
          }}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-white/20 text-white text-sm font-medium rounded-xl hover:bg-white/30 active:scale-[0.97] transition-all min-h-[44px]"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div
      className={`upload-zone p-6 md:p-12 flex flex-col items-center justify-center text-center cursor-pointer min-h-[200px] ${
        dragOver ? "drag-over" : ""
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={() => setDragOver(false)}
      onClick={() => {
        if (!cameraActive) fileInputRef.current?.click();
      }}
    >
      {/* Hidden file input — no capture, always shows file picker */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Hidden native camera input — fallback if getUserMedia fails */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        className="hidden"
        onChange={handleInputChange}
      />

      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-accent-soft flex items-center justify-center mb-5">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#2d5a3d"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      </div>

      {/* Text */}
      <p className="font-display text-lg font-medium text-txt mb-1">
        Drop a food photo here
      </p>
      <p className="text-sm text-txt-muted mb-6">
        JPG, PNG, or WEBP — up to 10 MB
      </p>

      {/* Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-xs">
        <button
          type="button"
          onClick={handleTakePhoto}
          className="inline-flex items-center gap-2 px-5 py-3 bg-accent text-white text-sm font-medium rounded-xl hover:bg-accent-glow active:scale-[0.97] transition-all min-h-[44px]"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          {cameraActive ? "Retake" : "Take Photo"}
        </button>

        <span className="text-xs text-txt-muted">or</span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          className="inline-flex items-center gap-2 px-5 py-3 bg-bg-subtle text-txt-secondary text-sm font-medium rounded-xl hover:bg-black/[0.06] active:scale-[0.97] transition-all min-h-[44px]"
        >
          Browse Files
        </button>
      </div>

      {/* Webcam live preview */}
      {webcamPreview}
    </div>
  );
}
