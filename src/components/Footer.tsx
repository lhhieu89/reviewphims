import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} Review Phim. All right reserved.</p>
        </div>
      </div>
    </footer>
  );
}
