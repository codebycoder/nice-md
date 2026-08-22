interface EmptyStateProps {
  hasPersistedFileMeta: boolean;
  lastFileName?: string;
  onOpenFile: () => void;
}

export function EmptyState({
  hasPersistedFileMeta,
  lastFileName,
  onOpenFile,
}: EmptyStateProps) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center rounded-[2rem] border border-dashed border-black/10 bg-white/70 px-8 py-16 text-center shadow-panel backdrop-blur dark:border-white/10 dark:bg-slate-950/60">
      <div className="mb-5 rounded-full bg-accent-500/10 px-4 py-2 text-sm font-semibold text-accent-600 dark:text-accent-300">
        Persian Markdown Reader
      </div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
        فایل Markdown یا Word خودتان را باز کنید
      </h2>
      <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300">
        این برنامه برای خواندن مستندات فارسی با ترکیب متن راست به چپ و
        اصطلاحات فنی انگلیسی بهینه شده است. فایل Markdown (.md) یا Word (.docx)
        را با دکمه بالا یا drag & drop باز کنید.
      </p>
      {hasPersistedFileMeta && lastFileName ? (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          آخرین فایل شناخته شده: {lastFileName}. به دلیل محدودیت مرورگر، برای
          بازخوانی کامل ممکن است لازم باشد دوباره آن را انتخاب کنید.
        </p>
      ) : null}
      <button
        type="button"
        onClick={onOpenFile}
        className="mt-8 rounded-2xl bg-accent-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-600"
      >
        انتخاب فایل
      </button>
    </div>
  );
}
