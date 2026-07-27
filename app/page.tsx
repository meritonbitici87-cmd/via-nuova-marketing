export default function Home() {
  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Pizzeria KI-Marketing</h1>
      <p className="mb-4 text-gray-600">
        Willkommen. Gehe zum Dashboard, um generierte Inhalte zu sehen und
        freizugeben.
      </p>
      <a
        href="/dashboard"
        className="inline-block bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700"
      >
        Zum Dashboard
      </a>
    </main>
  );
}
