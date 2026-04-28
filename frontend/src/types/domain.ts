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

export interface DashboardData {
  people: {
    total: number;
    men: number;
    women: number;
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
