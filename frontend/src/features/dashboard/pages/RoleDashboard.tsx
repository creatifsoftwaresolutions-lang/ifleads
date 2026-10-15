import { useAuth } from '@/app/providers/auth-provider';
import DashboardHome from './DashboardHome';
import BDEDashboard from './BDEDashboard';
import BDMDashboard from './BDMDashboard';
import CEODashboard from './CEODashboard';

export default function RoleDashboard() {
  const { user } = useAuth();
  if (!user) return null;

  switch (user.role) {
    case 'ADMIN':      return <DashboardHome />;
    case 'CEO':        return <CEODashboard />;
    case 'BDM':        return <BDMDashboard />;
    case 'SALES_HEAD': return <BDMDashboard />;
    case 'BDE':        return <BDEDashboard />;
    default:           return <DashboardHome />;
  }
}
