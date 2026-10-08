import { useEffect, useRef, useState, type ChangeEvent } from "react";

interface SelfieCaptureProps {
  onCaptured: (blob: Blob) => void;
  busy: boolean;
  disabled?: boolean;
}

export default function SelfieCapture({ onCaptured, busy, disabled = false }: SelfieCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const startCamera = async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setReady(true);
    } catch {
      setError("We couldn't access your camera. Allow camera access, or upload a photo instead.");
      setReady(false);
    }
  };

  useEffect(() => {
    startCamera();
    return () => stopStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 480;
    canvas.height = video.videoHeight || 640;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        stopStream();
        setReady(false);
        setPreview(blob);
        setPreviewUrl(URL.createObjectURL(blob));
      },
      "image/jpeg",
      0.9,
    );
  };

  const retake = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreview(null);
    setPreviewUrl("");
    startCamera();
  };

  const onFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    stopStream();
    setReady(false);
    setError("");
    setPreview(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  return (
    <div className="space-y-4">
      <div className="relative mx-auto aspect-[3/4] w-full max-w-[300px] overflow-hidden rounded-2xl border border-background-300 bg-foreground-950">
        {previewUrl ? (
          <img src={previewUrl} alt="Your selfie preview" className="h-full w-full object-cover object-top" />
        ) : (
          <video
            ref={videoRef}
            muted
            playsInline
            autoPlay
            className="h-full w-full scale-x-[-1] object-cover"
          />
        )}

        {!previewUrl && !ready && !error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-background-50">
            <i className="ri-loader-4-line animate-spin text-3xl" />
            <span className="text-xs">Starting camera...</span>
          </div>
        ) : null}

        {previewUrl ? (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-secondary-500 px-2.5 py-1 text-[11px] font-semibold text-background-50">
            <i className="ri-checkbox-circle-fill" />
            Looks good
          </span>
        ) : null}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {error ? (
        <div className="flex items-start gap-2 rounded-md border border-primary-200 bg-primary-50 px-3 py-2.5 text-sm text-primary-800">
          <i className="ri-error-warning-line mt-0.5" />
          <span>{error}</span>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        {preview ? (
          <>
            <button
              type="button"
              onClick={retake}
              disabled={busy}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border border-background-300 px-4 py-3 text-sm font-semibold text-foreground-800 disabled:opacity-60"
            >
              <i className="ri-refresh-line" />
              Retake
            </button>
            <button
              type="button"
              onClick={() => preview && onCaptured(preview)}
              disabled={busy || disabled}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-4 py-3 text-sm font-semibold text-background-50 transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <i className={busy ? "ri-loader-4-line animate-spin text-lg" : "ri-shield-check-line text-lg"} />
              {busy ? "Verifying..." : "Confirm selfie"}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={capture}
            disabled={!ready || busy}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-4 py-3 text-sm font-semibold text-background-50 transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <i className="ri-camera-lens-line text-lg" />
            Take selfie
          </button>
        )}
      </div>

      <label className="flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md border border-dashed border-background-300 px-4 py-2.5 text-xs font-medium text-foreground-600">
        <i className="ri-upload-2-line" />
        Or upload a photo instead
        <input type="file" accept="image/*" capture="user" onChange={onFile} className="hidden" />
      </label>
    </div>
  );
}