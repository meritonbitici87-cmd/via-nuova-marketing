import "./globals.css";

export const metadata = {
  title: "Pizzeria KI-Marketing",
  description: "Content-Automation für lokale Pizzeria",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
