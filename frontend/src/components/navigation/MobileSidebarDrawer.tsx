import { useEffect } from 'react';
import { X } from 'lucide-react';
import { DesktopSidebar } from './DesktopSidebar';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function MobileSidebarDrawer({ open, onClose }: Props) {
  // Lock scroll + Esc to close
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-[70] lg:hidden"
        onClick={onClose}
      />
      <aside
        className="fixed top-0 bottom-0 left-0 z-[80] w-[260px] bg-white shadow-2xl lg:hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-md text-ink-muted hover:bg-brand-light z-10"
        >
          <X className="w-4 h-4 mx-auto" />
        </button>
        <div className="h-full" onClick={onClose}>
          <DesktopSidebar />
        </div>
      </aside>
    </>
  );
}
