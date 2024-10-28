// src/app/about/page.tsx
import Link from "next/link";
import { MainNav } from "./components/main-nav";
import { UserNav } from "./components/user-nav";

export default function About() {
  return (
    <div className="hidden flex-col md:flex">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <MainNav className="mx-6" />
          <div className="ml-auto flex items-center space-x-4">
            <UserNav />
          </div>
        </div>
      </div>
    </div>

    // <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
    //   <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
    //     <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
    //       About <span className="text-[hsl(280,100%,70%)]">Us</span>
    //     </h1>
    //     <p className="text-2xl text-white">
    //       This is the about page.
    //     </p>
    //     <Link href="/" className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20">
    //       Go back to Home
    //     </Link>
    //   </div>
    // </main>
  );
}