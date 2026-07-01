/** Judul section dengan garis kuning dekoratif di kiri-kanan (center). */
export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center gap-3 mb-8">
      <span className="h-[3px] w-8 rounded-full" style={{ background: '#ffed4a' }} />
      <h2 className="text-lg md:text-xl font-bold uppercase tracking-wider text-slate-800 text-center">
        {children}
      </h2>
      <span className="h-[3px] w-8 rounded-full" style={{ background: '#ffed4a' }} />
    </div>
  );
}
