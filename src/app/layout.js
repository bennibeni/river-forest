import "./globals.css";
export const metadata = {
  title: "River · Il puzzle e la foresta",
  description:
    "Un puzzle di attraversamento e un laboratorio per capire la Random Forest.",
};
export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
