export interface KeyboardShortcutGroup {
  id: string;
  title: string;
  items: { keys: string; label: string }[];
}

export const KEYBOARD_SHORTCUT_GROUPS: KeyboardShortcutGroup[] = [
  {
    id: 'file',
    title: 'فایل',
    items: [
      { keys: 'Ctrl/Cmd + O', label: 'باز کردن فایل (تب جدید اگر تب فعال دارد)' },
      { keys: 'Ctrl/Cmd + Shift + O', label: 'باز کردن فایل در تب جدید' },
      { keys: 'Ctrl/Cmd + R', label: 'بارگذاری دوباره فایل' },
      { keys: 'Ctrl/Cmd + W', label: 'بستن تب فعال' },
    ],
  },
  {
    id: 'tabs',
    title: 'تب‌ها',
    items: [
      { keys: 'Ctrl/Cmd + Tab', label: 'تب بعدی' },
      { keys: 'Ctrl/Cmd + Shift + Tab', label: 'تب قبلی' },
    ],
  },
  {
    id: 'find',
    title: 'جستجو',
    items: [
      { keys: 'Ctrl/Cmd + F', label: 'باز کردن نوار جستجو' },
      { keys: 'Ctrl/Cmd + G', label: 'نتیجه بعدی' },
      { keys: 'Ctrl/Cmd + Shift + G', label: 'نتیجه قبلی' },
      { keys: 'Enter', label: 'نتیجه بعدی (در حالت جستجو)' },
      { keys: 'Shift + Enter', label: 'نتیجه قبلی (در حالت جستجو)' },
      { keys: 'Esc', label: 'بستن نوار جستجو' },
    ],
  },
  {
    id: 'view',
    title: 'نمایش',
    items: [
      { keys: 'T', label: 'تغییر حالت روشن / تیره' },
      { keys: 'B', label: 'نمایش / پنهان کردن فهرست' },
      { keys: 'F', label: 'تمام‌صفحه' },
      { keys: '?', label: 'نمایش میانبرها' },
    ],
  },
];
