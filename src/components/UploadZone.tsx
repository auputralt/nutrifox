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
  }, []);

  // Switch camera (rear ↔ front) — mobile devices
  const switchCamera = useCallback(async () => {
    // Stop current stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    // Toggle facing mode
    const next = facingModeRef.current === "environment" ? "user" : "environment";
    facingModeRef.current = next;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: next },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      // Update facing mode from actual track
      const reported = stream.getVideoTracks()[0]?.getSettings?.()?.facingMode;
      if (reported === "user" || reported === "environment") {
        facingModeRef.current = reported;
      }
    } catch {
      // Switch failed, revert
      facingModeRef.current = next === "environment" ? "user" : "environment";
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingModeRef.current },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
        streamRef.current = stream;
      } catch {
        stopCamera();
      }
    }
  }, [stopCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
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

      for (let i = 0; i < constraints.length; i++) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints[i]);
          // Determine facing mode: index 0 = environment, index 1 = user
          // Browser-reported facingMode unreliable on laptops — use constraint index
          const reported = stream.getVideoTracks()[0]?.getSettings?.()?.facingMode;
          if (reported === "user" || reported === "environment") {
            facingModeRef.current = reported;
          } else {
            facingModeRef.current = i === 0 ? "environment" : "user";
          }
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
    // No cleanup here — stopCamera() handles stream teardown.
    // A cleanup that stops tracks would kill the stream startWebcam just created
    // because React runs the previous effect's cleanup before the new effect.
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
        {/* Switch camera — useful on phones with multiple cameras */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            switchCamera();
          }}
          className="inline-flex items-center justify-center w-10 h-10 bg-white/20 text-white rounded-xl hover:bg-white/30 active:scale-[0.95] transition-all"
          title="Switch camera"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 16v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4" />
            <path d="M16 10l4 4-4 4" />
            <path d="M4 8V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
            <path d="M8 14l-4-4 4-4" />
          </svg>
        </button>
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
