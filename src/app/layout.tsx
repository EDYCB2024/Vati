import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Vati — Asistente de Autogestión y Servicio Técnico",
  description:
    "Chatbot guiado de autogestión y backoffice para servicio técnico, desinstalación, reconexión y gestiones comerciales.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${plusJakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-surface text-on-surface flex flex-col selection:bg-primary-fixed selection:text-on-primary-fixed">
        {children}
      </body>
    </html>
  );
}
