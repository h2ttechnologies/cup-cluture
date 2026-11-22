import type { Metadata } from "next";
import "./globals.css";
import "./experience.css";
import { StoreProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: { default: "Cup Culture — Just what you needed.", template: "%s | Cup Culture" },
  description: "Good food, refreshing sips and little moments that make your day better. Find your Cup Culture favourite.",
  metadataBase: new URL("https://cupculture.in"),
  openGraph: { title: "Cup Culture — Just what you needed.", description: "Good food, refreshing sips and little moments that make your day better.", type: "website" },
};

// Runs before first paint: the intro plays once per browser session.
// Later page loads in the same session get "cc-seen", which hides the intro instantly.
const introScript = `try{var d=document.documentElement;if(location.pathname!=="/"){d.classList.add("cc-seen")}else if(sessionStorage.getItem("cc-intro")){d.classList.add("cc-seen")}else{sessionStorage.setItem("cc-intro","1");d.dataset.introStart=String(performance.now())}}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-IN" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: introScript }}/></head><body><StoreProvider>{children}</StoreProvider></body></html>;
}
