import type { ReactNode } from "react";
import Starfield from "./Starfield";
import HangingStars from "./HangingStars";

/** Login болон Pass хуудасны нийтлэг оддын дэвсгэр */
export default function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative isolate flex min-h-[100svh] items-center justify-center overflow-hidden px-5 pb-16 pt-32">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_80%_60%_at_50%_115%,rgba(83,109,255,0.35),transparent_65%)]" />
      <div className="absolute inset-0 -z-10">
        <Starfield />
      </div>
      <HangingStars />
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </main>
  );
}
