export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-serif font-medium mb-4 text-brand-cream">Via Nuova</h1>
        <p className="mb-6 text-brand-cream/60">
          Willkommen. Gehe zum Dashboard, um generierte Inhalte zu sehen und
          freizugeben.
        </p>
        <a
          href="/dashboard"
          className="inline-block bg-brand-turquoise text-brand-bg font-semibold px-5 py-2.5 rounded-xl hover:brightness-110 transition"
        >
          Zum Dashboard
        </a>
      </div>
    </main>
  );
}
