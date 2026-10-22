import { Helmet } from "react-helmet-async";

// 👇 Replace with your real domain (no trailing slash)
const SITE_URL = "https://yourdomain.com";
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

export default function Seo({ title, description, path, image = DEFAULT_IMAGE, noindex = false, jsonLd }: SeoProps) {
  const url = `${SITE_URL}${path === "/" ? "" : path}` || SITE_URL;
  const fullTitle = path === "/" ? title : `${title} | ${SITE_NAME}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large"} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
}

// Titles and descriptions for each of your routes
export const PAGES = {
  home: {
    path: "/",
    title: "SECURE-VOTE | Secure Online Student Elections",
    description: "SECURE-VOTE is a secure, transparent election platform. Meet the candidates, vote with confidence and follow verified live results.",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      description: "Secure online student elections with live, verified results.",
    },
  },
  results: {
    path: "/results",
    title: "Live Election Results",
    description: "Follow live election results: turnout, coalition standings and candidate tallies for every position, updated in real time.",
  },
  download: {
    path: "/download",
    title: "Download the SECURE-VOTE App",
    description: "Download the SECURE-VOTE mobile app to view candidates, read manifestos and vote securely from your phone.",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "MobileApplication",
      name: SITE_NAME,
      operatingSystem: "Android, iOS",
      applicationCategory: "UtilitiesApplication",
    },
  },
  about: {
    path: "/about",
    title: "About SECURE-VOTE",
    description: "Learn how SECURE-VOTE keeps student elections fair, secure and transparent from candidate registration to final results.",
  },
  contact: {
    path: "/contact",
    title: "Contact Us",
    description: "Have a question or need help with SECURE-VOTE? Get in touch with the team.",
  },
  developer: {
    path: "/developer",
    title: "Meet the Developer",
    description: "Meet the developer behind SECURE-VOTE, the secure student election platform.",
  },
  login: {
    path: "/login",
    title: "Login",
    description: "Sign in to SECURE-VOTE to take part in the election.",
    noindex: true, // keep the login page out of search results
  },
} as const;