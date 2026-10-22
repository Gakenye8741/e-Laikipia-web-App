import { Helmet } from "react-helmet-async";

// 👇 Production domain and asset defaults
const SITE_URL = "https://securevote.gakenye-ndiritu.co.ke";
const SITE_NAME = "SECURE-VOTE";
const DEFAULT_IMAGE = `${SITE_URL}/logosecure.jpeg`; // 1200x630 image in /public

type SeoProps = {
  title: string;
  description: string;
  path: string;          // e.g. "/results"
  image?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown>;
};

export default function Seo({
  title,
  description,
  path,
  image = DEFAULT_IMAGE,
  noindex = false,
  jsonLd,
}: SeoProps) {
  const url = `${SITE_URL}${path === "/" ? "" : path}` || SITE_URL;
  const fullTitle = path === "/" ? title : `${title} | ${SITE_NAME}`;

  return (
    <Helmet>
      {/* Standard Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta
        name="robots"
        content={noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large"}
      />
      <link rel="canonical" href={url} />

      {/* OpenGraph / Facebook / LinkedIn Meta Tags */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="SECURE-VOTE Platform Preview" />

      {/* Twitter / X Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD Structured Data Injection */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
}

/* ------------------------------ Page Definitions ------------------------------ */

export const PAGES = {
  home: {
    path: "/",
    title: "SECURE-VOTE | Secure E-Voting for Universities & Higher Institutions",
    description: "SECURE-VOTE is a transparent, blockchain-anchored e-voting platform for universities and higher education institutions. Cast votes securely, view candidate manifestos, and track verified live results.",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      description: "Decentralized e-voting platform for student elections across universities and colleges.",
      author: {
        "@type": "Person",
        name: "Gakenye Ndiritu",
        url: "https://gakenye-ndiritu.co.ke",
        sameAs: [
          "https://github.com/Gakenye8741",
          "https://www.instagram.com/_code.d_by_gakenye_"
        ]
      }
    },
  },
  results: {
    path: "/results",
    title: "Live Election Results",
    description: "Follow live campus election results: voter turnout, coalition standings, and position-by-position candidate tallies, updated in real time.",
  },
  download: {
    path: "/download",
    title: "Download the SECURE-VOTE App",
    description: "Download the SECURE-VOTE mobile app to view candidates, read manifestos, and vote securely from your phone anywhere.",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "MobileApplication",
      name: SITE_NAME,
      operatingSystem: "Android, iOS",
      applicationCategory: "UtilitiesApplication",
      downloadUrl: `${SITE_URL}/download`,
      author: {
        "@type": "Person",
        name: "Gakenye Ndiritu",
        url: "https://gakenye-ndiritu.co.ke"
      }
    },
  },
  about: {
    path: "/about",
    title: "About SECURE-VOTE",
    description: "Learn how SECURE-VOTE empowers higher learning institutions with tamper-proof elections using Ethereum Sepolia blockchain verification and AES-256 encryption.",
  },
  contact: {
    path: "/contact",
    title: "Contact Us",
    description: "Have a question or looking to deploy SECURE-VOTE at your institution? Get in touch with our team.",
  },
  developer: {
    path: "/developer",
    title: "Meet the Developer",
    description: "Meet Gakenye Ndiritu, the lead software engineer behind SECURE-VOTE, the decentralized student election platform.",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Gakenye Ndiritu",
      jobTitle: "Lead Software Engineer",
      worksFor: {
        "@type": "Organization",
        name: "Stack Group"
      },
      url: "https://gakenye-ndiritu.co.ke",
      sameAs: [
        "https://github.com/Gakenye8741",
        "https://www.instagram.com/_code.d_by_gakenye_"
      ]
    }
  },
  login: {
    path: "/login",
    title: "Login",
    description: "Sign in to SECURE-VOTE to participate in the election.",
    noindex: true, // keeps admin/auth routes out of search engine indexes
  },
} as const;