import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { role: true },
  });

  if (!user || !user.isActive) {
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar user={user} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
