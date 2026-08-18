import "./globals.css";

export const metadata = {
  title: "Bluebird Prospect Board",
  description: "Shared sales intelligence board for Bluebird Workforce Solutions",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Fraunces:opsz,wght@9..144,500;9..144,600&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
