import dynamic from 'next/dynamic';
const UserProfile = dynamic(() => import('../components/UserProfile'), { ssr: false });

export default function ProfilePage() {
  return (
    <div>
      <UserProfile />
    </div>
  );
}
