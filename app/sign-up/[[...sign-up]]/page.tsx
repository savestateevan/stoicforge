import { SignUp } from '@clerk/nextjs'
import { Metadata } from 'next';


export const metadata: Metadata = {
  title: 'Create Your StoicForge Account',
  description:
    'Start chatting with Marcus Aurelius & Seneca in minutes – no card required.',
};

export default function Page() {
  return (
    <div className="flex justify-center py-24">
      <SignUp />
    </div>
  )
}
