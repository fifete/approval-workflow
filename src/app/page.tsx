import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "~/server/auth";

export default async function Home() {
  const session = await getServerAuthSession();
  if (session?.user) {
    redirect("/home");
  }

  return (
    <main className="flex min-h-screen">
      <div className="flex-1 bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white flex items-center justify-center">
        {/* Removed "Create T3" text */}
      </div>
      <div className="flex-1 flex flex-col items-center justify-center bg-white text-black">
        <h2 className="text-4xl font-bold">Manager</h2>
        <Link
          href="/api/auth/signin"
          className="mt-4 rounded-full bg-blue-500 px-10 py-3 font-semibold text-white transition hover:bg-blue-600"
        >
          Sign in
        </Link>
      </div>
    </main>
  );
}
