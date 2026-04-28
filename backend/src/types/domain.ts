export enum Role {
  ADMIN = "ADMIN",
  PASTOR = "PASTOR",
  LIDER = "LIDER",
  TESOUREIRO = "TESOUREIRO",
  SECRETARIA = "SECRETARIA",
}

export enum MemberStatus {
  ATIVO = "ATIVO",
  INATIVO = "INATIVO",
  VISITANTE = "VISITANTE",
}

export enum TransactionType {
  ENTRADA = "ENTRADA",
  SAIDA = "SAIDA",
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  createdAt: string;
}

export interface Member {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  gender: string | null;
  birthDate: string | null;
  maritalStatus: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  status: MemberStatus;
  baptized: boolean;
  convertedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Ministry {
  id: string;
  name: string;
  description: string | null;
  leaderId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MinistryMember {
  id: string;
  ministryId: string;
  memberId: string;
  role: string | null;
  joinedAt: string;
}

export interface Group {
  id: string;
  name: string;
  category: string;
  leaderName: string | null;
  meetingDay: string | null;
  meetingTime: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GroupMember {
  id: string;
  groupId: string;
  memberId: string;
  joinedAt: string;
}

export interface Attendance {
  id: string;
  groupId: string;
  meetingDate: string;
  present: number;
  visitors: number;
  notes: string | null;
}

export interface EventItem {
  id: string;
  title: string;
  description: string | null;
  eventDate: string;
  location: string | null;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  date: string;
  type: TransactionType;
  category: string;
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
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
