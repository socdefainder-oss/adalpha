import { hashSync } from "bcryptjs";
import {
  Attendance,
  EventItem,
  Group,
  GroupMember,
  Member,
  MemberStatus,
  Ministry,
  MinistryMember,
  Role,
  Transaction,
  TransactionType,
  User,
} from "../types/domain";

function nowIso() {
  return new Date().toISOString();
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

const createdAt = nowIso();

const adminUser: User = {
  id: uid("usr"),
  name: "Administrador",
  email: "admin@appigreja.com",
  password: hashSync("admin123", 10),
  role: Role.ADMIN,
  createdAt,
};

const memberAna: Member = {
  id: uid("mem"),
  fullName: "Ana Silva",
  email: "ana.silva@exemplo.com",
  phone: "11999990001",
  gender: "F",
  birthDate: null,
  maritalStatus: null,
  address: null,
  city: "Sao Paulo",
  state: "SP",
  zipCode: null,
  status: MemberStatus.ATIVO,
  baptized: false,
  convertedAt: null,
  createdAt,
  updatedAt: createdAt,
};

const memberJoao: Member = {
  id: uid("mem"),
  fullName: "Joao Santos",
  email: "joao.santos@exemplo.com",
  phone: "11999990002",
  gender: "M",
  birthDate: null,
  maritalStatus: null,
  address: null,
  city: "Sao Paulo",
  state: "SP",
  zipCode: null,
  status: MemberStatus.ATIVO,
  baptized: false,
  convertedAt: null,
  createdAt,
  updatedAt: createdAt,
};

const louvor: Ministry = {
  id: uid("min"),
  name: "Louvor",
  description: "Ministerio de musica e adoracao",
  leaderId: null,
  createdAt,
  updatedAt: createdAt,
};

const conexaoJovem: Group = {
  id: uid("grp"),
  name: "Conexao Jovem",
  category: "Jovens",
  leaderName: "Lider Jovem",
  meetingDay: "Sabado",
  meetingTime: "19:30",
  active: true,
  createdAt,
  updatedAt: createdAt,
};

export const store: {
  users: User[];
  members: Member[];
  ministries: Ministry[];
  ministryMembers: MinistryMember[];
  groups: Group[];
  groupMembers: GroupMember[];
  attendances: Attendance[];
  events: EventItem[];
  transactions: Transaction[];
} = {
  users: [adminUser],
  members: [memberAna, memberJoao],
  ministries: [louvor],
  ministryMembers: [
    {
      id: uid("mlk"),
      ministryId: louvor.id,
      memberId: memberAna.id,
      role: "Vocal",
      joinedAt: createdAt,
    },
  ],
  groups: [conexaoJovem],
  groupMembers: [
    {
      id: uid("glk"),
      groupId: conexaoJovem.id,
      memberId: memberJoao.id,
      joinedAt: createdAt,
    },
  ],
  attendances: [],
  events: [
    {
      id: uid("evt"),
      title: "Culto de Domingo",
      description: null,
      eventDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      location: "Templo Sede",
      category: "Culto",
      createdAt,
      updatedAt: createdAt,
    },
  ],
  transactions: [
    {
      id: uid("trx"),
      title: "Dizimos e ofertas",
      description: null,
      amount: 5500,
      date: createdAt,
      type: TransactionType.ENTRADA,
      category: "Contribuicoes",
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: uid("trx"),
      title: "Conta de energia",
      description: null,
      amount: 1200,
      date: createdAt,
      type: TransactionType.SAIDA,
      category: "Despesas fixas",
      createdAt,
      updatedAt: createdAt,
    },
  ],
};

export function createId(prefix: string) {
  return uid(prefix);
}
