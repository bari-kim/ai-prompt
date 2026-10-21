export function HomeGallery({ children, label }: { children: React.ReactNode; label: string }) {
  return <main className="gallery home-gallery" aria-label={label}>{children}</main>;
}
