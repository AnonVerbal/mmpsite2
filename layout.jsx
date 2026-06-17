import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://mmpincorporadora.com.br"),
  title: "MMP Construtora e Incorporadora | Apartamentos em São Pedro da Aldeia",
  description:
    "Há mais de 12 anos construindo residenciais de alto padrão na Região dos Lagos. Conheça o Residencial Marcellus IV — apartamentos de 1 a 3 dormitórios na área nobre do Nova São Pedro.",
  keywords: [
    "apartamento São Pedro da Aldeia",
    "imóveis Região dos Lagos",
    "Marcellus IV",
    "construtora São Pedro da Aldeia",
    "apartamento na planta",
  ],
  authors: [{ name: "MMP Construtora e Incorporadora" }],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://mmpincorporadora.com.br",
    siteName: "MMP Construtora e Incorporadora",
    title: "MMP Construtora e Incorporadora | Região dos Lagos",
    description:
      "Residenciais de alto padrão em São Pedro da Aldeia. Conheça o Marcellus IV.",
    images: [
      {
        url: "https://mmpincorporadora.com.br/wp-content/uploads/2024/05/AnyConv.com__marcelus-IV.webp",
        width: 1200,
        height: 630,
        alt: "Residencial Marcellus IV",
      },
    ],
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: "#103A41",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "MMP Construtora e Incorporadora",
  description:
    "Construtora e incorporadora de imóveis de alto padrão na Região dos Lagos.",
  url: "https://mmpincorporadora.com.br",
  telephone: "+55-22-97401-4736",
  email: "Pedro.comercial@mmpincorporadora.com",
  areaServed: "São Pedro da Aldeia e Região dos Lagos - RJ",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Av. Hum, Lote 01, Quadra 13 - Nova São Pedro",
    addressLocality: "São Pedro da Aldeia",
    addressRegion: "RJ",
    postalCode: "28940-840",
    addressCountry: "BR",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Manrope:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
