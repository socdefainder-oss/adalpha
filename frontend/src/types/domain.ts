export type UserRole = "ADMIN" | "PASTOR" | "LIDER" | "TESOUREIRO" | "SECRETARIA";

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
}

export interface Member {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  gender: string | null;
  status: "ATIVO" | "INATIVO" | "VISITANTE";
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  category: string;
  active: boolean;
}

export interface Ministry {
  id: string;
  name: string;
  description: string | null;
}

export interface EventItem {
  id: string;
  title: string;
  eventDate: string;
  location: string | null;
  category: string;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: string;
  type: "ENTRADA" | "SAIDA";
  category: string;
}

export interface KidProfile {
  id: string;
  fullName: string;
  birthDate: string;
  guardianName: string;
  guardianPhone: string;
  classroom: string;
  allergies: string | null;
  checkInAuthorized: boolean;
  notes: string | null;
}

export interface Course {
  id: string;
  title: string;
  category: string;
  teacherName: string;
  room: string | null;
  workloadHours: number;
  startDate: string;
  endDate: string | null;
  active: boolean;
  material: string | null;
  enrolledCount: number;
}

export interface Asset {
  id: string;
  itemName: string;
  category: string;
  location: string;
  acquisitionDate: string;
  acquisitionValue: number;
  condition: string;
  responsible: string | null;
  serialNumber: string | null;
  notes: string | null;
}

export interface MediaItem {
  id: string;
  title: string;
  category: string;
  platform: string;
  publishDate: string;
  responsible: string;
  status: string;
  url: string | null;
  notes: string | null;
}

export interface HelpArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  contactEmail: string | null;
  createdAt: string;
}

export interface HelpTicket {
  id: string;
  subject: string;
  category: string;
  message: string;
  requesterName: string;
  requesterEmail: string;
  priority: string;
  status: string;
  createdAt: string;
}

export interface DashboardData {
  people: {
    total: number;
    men: number;
    women: number;
  };
  modules: {
    kids: number;
    courses: number;
    assets: number;
    media: number;
    helpTickets: number;
  };
  recentMembers: Array<{
    id: string;
    fullName: string;
    createdAt: string;
    status: "ATIVO" | "INATIVO" | "VISITANTE";
  }>;
  groups: {
    stats: {
      total: number;
      active: number;
      inactive: number;
    };
    categories: Array<{
      id: string;
      name: string;
      category: string;
      members: number;
    }>;
  };
  ministries: Array<{
    id: string;
    name: string;
    members: number;
  }>;
  finance: {
    income: number;
    expense: number;
    balance: number;
  };
  events: EventItem[];
}
