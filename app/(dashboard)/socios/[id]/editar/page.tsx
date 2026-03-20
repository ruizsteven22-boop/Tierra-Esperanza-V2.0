import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import EditMemberForm from './EditMemberForm';

export default async function EditMemberPage({
  params,
}: {
  params: { id: string };
}) {
  const member = await prisma.member.findUnique({
    where: { id: params.id },
    include: {
      familyMembers: true
    }
  });

  if (!member) {
    notFound();
  }

  return <EditMemberForm member={member} />;
}
