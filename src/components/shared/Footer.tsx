export default function Footer() {
  return (
    <footer className="bg-card/50 border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-6 text-center text-foreground/60">
        <p>&copy; {new Date().getFullYear()} Austin Clean Sweep. All rights reserved.</p>
        <p className="text-sm">Your partner for a cleaner Austin.</p>
      </div>
    </footer>
  );
}
