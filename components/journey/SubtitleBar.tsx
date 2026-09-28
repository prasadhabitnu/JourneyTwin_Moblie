interface Props {
  text: string;
  visible: boolean;
}

/**
 * Live subtitle bar — sits at the bottom of the viewport while Nu is
 * narrating. Center-aligned, semi-transparent slate background so it works
 * over any hero content.
 */
export default function SubtitleBar({ text, visible }: Props) {
  if (!visible || !text) return null;
  return (
    <div className="fixed left-0 right-0 bottom-24 pointer-events-none z-30 flex justify-center px-6">
      <div className="max-w-3xl w-full px-5 py-3 rounded-2xl bg-slate-900/90 text-white shadow-xl backdrop-blur">
        <div className="flex items-start gap-2">
          <span className="text-emerald-300 text-[10px] font-black uppercase tracking-wider mt-1 shrink-0">
            Nu
          </span>
          <p className="text-sm md:text-base leading-relaxed">{text}</p>
        </div>
      </div>
    </div>
  );
}
