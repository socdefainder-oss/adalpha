import { hashSync } from "bcryptjs";
import {
  Attendance,
  Asset,
  Course,
  EventItem,
  Group,
  GroupMember,
  HelpArticle,
  HelpTicket,
  KidProfile,
  MediaItem,
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

const kidSamuel: KidProfile = {
  id: uid("kid"),
  fullName: "Samuel Costa",
  birthDate: "2018-03-12",
  guardianName: "Carlos Costa",
  guardianPhone: "11999991111",
  classroom: "Sala Jardim 2",
  allergies: "Intolerancia a lactose",
  checkInAuthorized: true,
  notes: "Entregar apenas para os pais",
  createdAt,
  updatedAt: createdAt,
};

const cursoDiscipulado: Course = {
  id: uid("crs"),
  title: "Fundamentos da Fe",
  category: "Discipulado",
  teacherName: "Pr. Marcos",
  room: "Sala 3",
  workloadHours: 24,
  startDate: new Date().toISOString(),
  endDate: null,
  active: true,
  material: "Apostila do aluno",
  enrolledCount: 18,
  createdAt,
  updatedAt: createdAt,
};

const assetProjetor: Asset = {
  id: uid("ast"),
  itemName: "Projetor Epson",
  category: "Audio Visual",
  location: "Templo Principal",
  acquisitionDate: "2024-02-10",
  acquisitionValue: 4200,
  condition: "Bom",
  responsible: "Equipe Midia",
  serialNumber: "EP-23931-BR",
  notes: "Usado nos cultos e eventos especiais",
  createdAt,
  updatedAt: createdAt,
};

const mediaCulto: MediaItem = {
  id: uid("mid"),
  title: "Culto de Domingo - Transmissao",
  category: "Live",
  platform: "YouTube",
  publishDate: createdAt,
  responsible: "Equipe Midia",
  status: "Publicado",
  url: "https://youtube.com/@igreja",
  notes: "Gravar tambem cortes para redes sociais",
  createdAt,
  updatedAt: createdAt,
};

const helpArticle: HelpArticle = {
  id: uid("hlp"),
  title: "Como cadastrar novos membros",
  category: "Cadastros",
  content: "Acesse o menu Pessoas, preencha o formulario completo e confirme os dados de contato e status do membro.",
  contactEmail: "suporte@igreja.local",
  createdAt,
};

const helpTicket: HelpTicket = {
  id: uid("tkt"),
  subject: "Ajuste no acesso do lider de ministerio",
  category: "Permissoes",
  message: "Liberar acesso do lider ao cadastro de escalas e acompanhamento da equipe.",
  requesterName: "Secretaria",
  requesterEmail: "secretaria@igreja.local",
  priority: "Media",
  status: "Aberto",
  createdAt,
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
  kids: KidProfile[];
  courses: Course[];
  assets: Asset[];
  mediaItems: MediaItem[];
  helpArticles: HelpArticle[];
  helpTickets: HelpTicket[];
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
  kids: [kidSamuel],
  courses: [cursoDiscipulado],
  assets: [assetProjetor],
  mediaItems: [mediaCulto],
  helpArticles: [helpArticle],
  helpTickets: [helpTicket],
};

export function createId(prefix: string) {
  return uid(prefix);
}
