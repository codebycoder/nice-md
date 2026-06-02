import type { TocItem } from '../types';

interface TocSidebarProps {
  items: TocItem[];
  activeId: string;
  collapsed: boolean;
  onJump: (id: string) => void;
  reminder?: string;
}

export function TocSidebar({
  items,
  activeId,
  collapsed,
  onJump,
  reminder,
}: TocSidebarProps) {
  return (
    <aside
      className={[
        'sticky top-28 h-[calc(100vh-8rem)] overflow-hidden rounded-[2rem] border border-black/5 bg-white/75 p-4 shadow-panel backdrop-blur-lg transition-all dark:border-white/10 dark:bg-slate-950/70',
        collapsed ? 'w-0 min-w-0 border-transparent p-0 opacity-0' : 'w-full lg:w-[290px]',
      ].join(' ')}
      aria-hidden={collapsed}
    >
      {!collapsed && (
        <div className="flex h-full flex-col">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              فهرست محتوا
            </h2>
            <p className="mt-1 text-xs leading-6 text-slate-500 dark:text-slate-400">
              {reminder ?? 'برای رفتن سریع روی هر بخش کلیک کنید.'}
            </p>
          </div>

          <div className="overflow-y-auto pr-1">
            {items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-black/10 p-4 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
                هنوز سرفصلی برای نمایش وجود ندارد.
              </div>
            ) : (
              <nav className="space-y-1">
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onJump(item.id)}
                    className={[
                      'block w-full rounded-2xl px-3 py-2 text-right text-sm transition',
                      activeId === item.id
                        ? 'bg-accent-500 text-white'
                        : 'text-slate-600 hover:bg-stone-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white',
                    ].join(' ')}
                    style={{ paddingRight: `${item.level * 0.65}rem` }}
                  >
                    {item.text}
                  </button>
                ))}
              </nav>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
