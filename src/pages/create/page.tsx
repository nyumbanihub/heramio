import { useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import TopBar from "@/components/feature/TopBar";
import { useAppData } from "@/store/AppDataProvider";
import { DEFAULT_AVATAR } from "@/lib/dataApi";

const postTypes = [
  { key: "photo", label: "Photo", icon: "ri-image-line" },
  { key: "video", label: "Video", icon: "ri-video-line" },
  { key: "text", label: "Text", icon: "ri-text" },
];

export default function Create() {
  const { me, createPost } = useAppData();
  const fileRef = useRef<HTMLInputElement>(null);
  const [type, setType] = useState("photo");
  const [file, setFile] = useState<File | null>(null);
  const [aspect, setAspect] = useState<"square" | "portrait">("square");
  const [previewUrl, setPreviewUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [location, setLocation] = useState("");
  const [privacy, setPrivacy] = useState("Public");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [published, setPublished] = useState(false);

  const pickFile = (key: string) => {
    setType(key);
    if (key !== "text") {
      fileRef.current?.click();
    } else {
      setFile(null);
      setPreviewUrl("");
    }
  };

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    const url = URL.createObjectURL(selected);
    setPreviewUrl(url);
    const img = new Image();
    img.onload = () => setAspect(img.naturalHeight > img.naturalWidth ? "portrait" : "square");
    img.src = url;
  };

  const publish = async (e: FormEvent) => {
    e.preventDefault();
    if (type !== "text" && !file) {
      setError("Add a photo or video, or switch to a text post.");
      return;
    }
    setBusy(true);
    setError("");
    const extra = hashtags.trim();
    const ok = await createPost({
      file: type === "text" ? null : file,
      caption: extra ? `${caption.trim()} ${extra}`.trim() : caption.trim(),
      location: location.trim(),
      aspect: type === "text" ? "square" : aspect,
    });
    setBusy(false);
    if (!ok) {
      setError("We couldn't publish your post. Please try again.");
      return;
    }
    setPublished(true);
  };

  const reset = () => {
    setPublished(false);
    setFile(null);
    setPreviewUrl("");
    setCaption("");
    setHashtags("");
    setLocation("");
    setType("photo");
    setError("");
  };

  if (published) {
    return (
      <>
        <TopBar title="Create" />
        <div className="mx-auto flex w-full max-w-[600px] flex-col items-center px-4 py-24 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary-600">
            <i className="ri-check-line text-3xl" />
          </span>
          <h2 className="mt-5 font-heading text-2xl font-semibold text-foreground-950">
            Your post is live
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-foreground-600">
            It's now visible in the feed to your verified followers. Thanks for keeping Heramio safe
            and genuine.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-7 whitespace-nowrap rounded-md bg-primary-500 px-6 py-3 text-sm font-semibold text-background-50"
          >
            Share something else
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar title="Create" />

      <form onSubmit={publish} className="mx-auto w-full max-w-[600px] px-4 py-4 lg:border-x lg:border-background-200/70">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 p-[2px]">
            <img
              src={me?.avatar ?? DEFAULT_AVATAR}
              alt={me?.name ?? "You"}
              className="h-full w-full rounded-full object-cover object-top"
            />
          </span>
          <div>
            <p className="flex items-center gap-1 text-sm font-semibold text-foreground-950">
              {me?.username ?? "you"}
              {me?.verified ? <i className="ri-verified-badge-fill text-primary-500" /> : null}
            </p>
            <p className="text-xs text-foreground-500">Posting to your followers</p>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          {postTypes.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => pickFile(option.key)}
              className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                type === option.key
                  ? "border-primary-400 bg-primary-50 text-primary-700"
                  : "border-background-200 bg-background-100/60 text-foreground-700"
              }`}
            >
              <i className={`${option.icon} text-lg`} />
              {option.label}
            </button>
          ))}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept={type === "video" ? "video/*" : "image/*"}
          onChange={onFile}
          className="hidden"
        />

        {type !== "text" ? (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="mt-4 flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-background-300 bg-background-100/60"
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Selected preview"
                className="h-full w-full object-cover object-top"
              />
            ) : (
              <span className="flex flex-col items-center gap-2 text-foreground-500">
                <i className={`${type === "video" ? "ri-video-upload-line" : "ri-image-add-line"} text-3xl`} />
                <span className="text-sm">
                  {type === "video" ? "Select a video to upload" : "Select a photo to upload"}
                </span>
              </span>
            )}
          </button>
        ) : (
          <div className="mt-4 rounded-xl bg-gradient-to-br from-primary-100 to-accent-100 p-6">
            <p className="font-heading text-lg font-semibold text-foreground-900">
              Share a thought
            </p>
            <p className="mt-1 text-sm text-foreground-600">A text post is great for updates.</p>
          </div>
        )}

        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value.slice(0, 500))}
          rows={3}
          placeholder="What's happening?"
          className="mt-4 w-full resize-none rounded-xl border border-background-200 bg-background-100/60 p-3.5 text-sm text-foreground-900 placeholder:text-foreground-400 focus:border-primary-400 focus:outline-none"
        />
        <p className="mt-1 text-right text-xs text-foreground-400">{caption.length}/500</p>

        <div className="mt-3 space-y-3">
          <div className="flex items-center gap-2 rounded-lg border border-background-200 bg-background-100/60 px-3 py-2.5">
            <i className="ri-hashtag text-lg text-foreground-500" />
            <input
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="Add hashtags (e.g. #coffee #travel)"
              className="w-full bg-transparent text-sm text-foreground-900 placeholder:text-foreground-400 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-background-200 bg-background-100/60 px-3 py-2.5">
            <i className="ri-map-pin-line text-lg text-foreground-500" />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Add a city-level location"
              className="w-full bg-transparent text-sm text-foreground-900 placeholder:text-foreground-400 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-background-200 bg-background-100/60 px-3 py-2.5">
            <i className="ri-lock-line text-lg text-foreground-500" />
            <span className="text-sm text-foreground-700">Who can see this?</span>
            <select
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value)}
              className="ml-auto bg-transparent text-sm font-medium text-foreground-900 focus:outline-none"
            >
              <option>Public</option>
              <option>Followers</option>
              <option>Matches only</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-lg bg-secondary-50 p-3">
          <i className="ri-shield-check-line mt-0.5 text-secondary-600" />
          <p className="text-xs leading-relaxed text-secondary-900">
            Make sure your content follows the Heramio Community Guidelines. We never expose your
            exact location.
          </p>
        </div>

        {error ? (
          <div className="mt-4 flex items-start gap-2 rounded-md border border-primary-200 bg-primary-50 px-3 py-2.5 text-sm text-primary-800">
            <i className="ri-error-warning-line mt-0.5" />
            <span>{error}</span>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={busy || (!caption.trim() && type === "text")}
          className="mt-5 flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-6 py-3.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600 disabled:opacity-40"
        >
          {busy ? (
            <>
              <i className="ri-loader-4-line animate-spin text-base" />
              Publishing...
            </>
          ) : (
            "Publish"
          )}
        </button>
      </form>
    </>
  );
}