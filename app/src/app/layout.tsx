import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/assets/styles/reset.css";
import "@/assets/styles/globals.css";
import Providers from "@/components/Providers";
import Nav from "@/components/Nav";
import { verifyIsAdmin } from "@/actions/admin";
import { getMyElo } from "@/actions/leaderboard";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mind Knight",
  description: "A companion tool for Mindnight",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isAdmin = await verifyIsAdmin();
  // const elo = await getMyElo();
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <Nav isAdmin={isAdmin} />
          {children}
        </Providers>
      </body>
    </html>
  );
}


//https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
// export const runtime = 'nodejs'
// export const dynamic = 'force-static'
// export const revalidate = 5
// export const fetchCache = 'force-cache'


//NextJS Polyfills
//https://nextjs.org/docs/architecture/supported-browsers#server-side-polyfills

//https://www.youtube.com/watch?v=gSSsZReIFRk (app router guide)
//https://www.youtube.com/watch?v=VBlSe8tvg4U (cacheing in more detail)
//https://www.youtube.com/watch?v=RBM03RihZVs (antipatterns)