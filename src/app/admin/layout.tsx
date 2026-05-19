import Link from "next/link";

import AdminGuard from "@/modules/core/auth/components/AdminGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <AdminGuard>

      <div className="flex min-h-screen">

        {/* SIDEBAR */}

        <aside className="w-72 border-r bg-white">

          <div className="border-b p-6">

            <h1 className="text-2xl font-bold">
              TYD Portal
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Admin Dashboard
            </p>
          </div>

          <nav className="flex flex-col p-4">

            <Link
              href="/admin"
              className="rounded-xl px-4 py-3 hover:bg-slate-100"
            >
              Dashboard
            </Link>

            <Link
              href="/admin/science/poster-voting/campaigns"
              className="rounded-xl px-4 py-3 hover:bg-slate-100"
            >
              Campaigns
            </Link>

            <Link
              href="/admin/science/poster-voting/posters"
              className="rounded-xl px-4 py-3 hover:bg-slate-100"
            >
              Posters
            </Link>
          </nav>
        </aside>

        {/* CONTENT */}

        <main className="flex-1 bg-slate-50 p-8">
          {children}
        </main>
      </div>

    </AdminGuard>
  );
}