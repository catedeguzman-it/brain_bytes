import dynamic from 'next/dynamic';
const Dashboard = dynamic(() => import('../components/ProfileDashboard'), { ssr: false });

export default function DashboardPage() {
  return <Dashboard />;
}
