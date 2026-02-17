import {
  LuLayoutDashboard,
  LuBuilding2,
  LuBriefcase,
  LuPackage,
  LuQrCode,
  LuFileText,
  LuSend,
  LuChartBar,
  LuSettings,
} from "react-icons/lu";
import { FaRegCheckCircle } from "react-icons/fa";

export const crmSidebarMenu = [
  {
    title: "Dashboard",
    path: "/crm/dashboard",
    icon: LuLayoutDashboard,
  },
  {
    title: "Client Management",
    path: "/crm/clients",
    icon: LuBuilding2,
  },
  {
    title: "Job Management",
    path: "/crm/jobs",
    icon: LuBriefcase,
  },
  {
    title: "Job Approvals",
    path: "/crm/job-approvals",
    icon: FaRegCheckCircle,
  },
  {
    title: "Package Management",
    path: "/crm/packages",
    icon: LuPackage,
  },
  {
    title: "QR Management",
    path: "/qr-generation",
    icon: LuQrCode,
  },
  {
    title: "Applications",
    path: "/crm/applications",
    icon: LuFileText,
  },
  {
    title: "Notifications",
    path: "/crm/notifications",
    icon: LuSend,
  },
  {
    title: "Analytics",
    path: "/crm/analytics",
    icon: LuChartBar,
  },
  {
    title: "Settings",
    path: "/crm/settings",
    icon: LuSettings,
  },
];
