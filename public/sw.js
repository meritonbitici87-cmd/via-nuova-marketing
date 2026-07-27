// Minimaler Service Worker - wird nur gebraucht, damit Android/Chrome die App als
// "installierbar" erkennt (Voraussetzung für "Zum Startbildschirm hinzufügen" mit
// eigenem Fenster). Cached bewusst nichts, da das Dashboard immer aktuelle Daten
// aus der Datenbank zeigen soll, kein Offline-Modus gewünscht ist.
self.addEventListener("fetch", () => {});
