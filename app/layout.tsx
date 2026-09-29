import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata={title:{default:"YaadBody",template:"%s | YaadBody"},description:"Flavor-first meal prep, party trays, and catering built for real life.",metadataBase:new URL("https://yaadbody.vercel.app")};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}