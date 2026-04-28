"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api";
import {
  Asset,
  AuthResponse,
  Course,
  DashboardData,
  EventItem,
  Group,
  HelpArticle,
  HelpTicket,
  KidProfile,
  MediaItem,
  Member,
  Ministry,
  Transaction,
  UserRole,
} from "@/types/domain";

type Tab =
  | "Visão Geral"
  | "Pessoas"
  | "Departamentos"
  | "Grupos"
  | "Kids"
  | "Ensino"
  | "Financeiro"
  | "Patrimonio"
  | "Agenda"
  | "Midias"
  | "Ajuda";

const tabs: Tab[] = [
  "Visão Geral",
  "Pessoas",
  "Departamentos",
  "Grupos",
  "Kids",
  "Ensino",
  "Financeiro",
  "Patrimonio",
  "Agenda",
  "Midias",
  "Ajuda",
];

const panelStyle =
  "rounded-2xl border border-[color:var(--border)] bg-[color:var(--panel-strong)] shadow-[0_12px_24px_rgba(41,64,86,0.07)]";

function money(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function datePt(value: string) {
  return new Date(value).toLocaleDateString("pt-BR");
}

function dateTimePt(value: string) {
  return new Date(value).toLocaleString("pt-BR");
}

function SectionCard({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <article className={`${panelStyle} p-6 ${className}`}>
      <h3 className="mb-4 text-2xl font-bold">{title}</h3>
      {children}
    </article>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`w-full rounded-lg border border-[color:var(--border)] px-3 py-2 ${props.className || ""}`} />;
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`w-full rounded-lg border border-[color:var(--border)] px-3 py-2 ${props.className || ""}`} />;
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`w-full rounded-lg border border-[color:var(--border)] px-3 py-2 ${props.className || ""}`} />;
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("Visão Geral");
  const [token, setToken] = useState("");
  const [userName, setUserName] = useState("");
  const [role, setRole] = useState<UserRole | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [kids, setKids] = useState<KidProfile[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [helpArticles, setHelpArticles] = useState<HelpArticle[]>([]);
  const [helpTickets, setHelpTickets] = useState<HelpTicket[]>([]);

  const [email, setEmail] = useState("admin@appigreja.com");
  const [password, setPassword] = useState("admin123");

  useEffect(() => {
    const saved = localStorage.getItem("app_igreja_token");
    const savedUser = localStorage.getItem("app_igreja_user");
    if (saved) {
      setToken(saved);
    }
    if (savedUser) {
      const user = JSON.parse(savedUser) as { name: string; role: UserRole };
      setUserName(user.name);
      setRole(user.role);
    }
  }, []);

  async function loadData(currentToken: string) {
    setLoading(true);
    setError("");
    try {
      const [overview, memberData, groupData, ministryData, eventData, txData, kidsData, coursesData, assetsData, mediaData, helpData] =
        await Promise.all([
          apiRequest<DashboardData>("/dashboard/overview", {}, currentToken),
          apiRequest<Member[]>("/members", {}, currentToken),
          apiRequest<Group[]>("/groups", {}, currentToken),
          apiRequest<Ministry[]>("/ministries", {}, currentToken),
          apiRequest<EventItem[]>("/events", {}, currentToken),
          apiRequest<Transaction[]>("/finance/transactions", {}, currentToken),
          apiRequest<KidProfile[]>("/kids", {}, currentToken),
          apiRequest<Course[]>("/teaching/courses", {}, currentToken),
          apiRequest<Asset[]>("/assets", {}, currentToken),
          apiRequest<MediaItem[]>("/media", {}, currentToken),
          apiRequest<{ articles: HelpArticle[]; tickets: HelpTicket[] }>("/help", {}, currentToken),
        ]);

      setDashboard(overview);
      setMembers(memberData);
      setGroups(groupData);
      setMinistries(ministryData);
      setEvents(eventData);
      setTransactions(txData);
      setKids(kidsData);
      setCourses(coursesData);
      setAssets(assetsData);
      setMediaItems(mediaData);
      setHelpArticles(helpData.articles);
      setHelpTickets(helpData.tickets);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar dados");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      void loadData(token);
    }
  }, [token]);

  const percentages = useMemo(() => {
    const total = dashboard?.people.total || 0;
    if (!total) {
      return { men: 0, women: 0 };
    }
    return {
      men: Math.round(((dashboard?.people.men || 0) / total) * 100),
      women: Math.round(((dashboard?.people.women || 0) / total) * 100),
    };
  }, [dashboard]);

  const financeSummary = useMemo(() => {
    return transactions.reduce(
      (acc, transaction) => {
        if (transaction.type === "ENTRADA") {
          acc.income += transaction.amount;
        } else {
          acc.expense += transaction.amount;
        }
        return acc;
      },
      { income: 0, expense: 0 },
    );
  }, [transactions]);

  async function login(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      setToken(data.token);
      setUserName(data.user.name);
      setRole(data.user.role);
      localStorage.setItem("app_igreja_token", data.token);
      localStorage.setItem("app_igreja_user", JSON.stringify({ name: data.user.name, role: data.user.role }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro no login");
    } finally {
      setLoading(false);
    }
  }

  async function submitSimple(path: string, payload: object) {
    if (!token) {
      return;
    }

    setError("");
    try {
      await apiRequest(path, {
        method: "POST",
        body: JSON.stringify(payload),
      }, token);
      await loadData(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    }
  }

  if (!token) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center p-6">
        <section className={`${panelStyle} grid w-full max-w-4xl overflow-hidden md:grid-cols-[1.1fr_1fr]`}>
          <div className="bg-gradient-to-br from-[#0b5f9e] to-[#0d79c2] p-10 text-white">
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-100">APP Igreja</p>
            <h1 className="mt-5 text-4xl font-bold">Gestão total da igreja em um único painel</h1>
            <p className="mt-5 text-lg text-cyan-50">
              Cadastros, departamentos, ensino, patrimônio, mídias, agenda e apoio operacional centralizados.
            </p>
          </div>
          <form onSubmit={login} className="space-y-4 p-10">
            <h2 className="text-3xl font-bold text-[color:var(--foreground)]">Entrar</h2>
            <p className="text-sm text-[color:var(--muted)]">Use o usuário seed inicial para começar.</p>
            <label className="block text-sm font-semibold">Email</label>
            <TextInput value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@appigreja.com" />
            <label className="block text-sm font-semibold">Senha</label>
            <TextInput type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="******" />
            {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <button disabled={loading} className="mt-2 w-full rounded-xl bg-[color:var(--accent)] px-5 py-3 text-lg font-semibold text-white disabled:opacity-60">
              {loading ? "Entrando..." : "Acessar painel"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-5 md:px-7">
      <header className="sticky top-0 z-20 mb-5 rounded-2xl border border-[#0a4a7b] bg-[#0b5f9e] px-4 py-3 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">APP Igreja</h1>
            <p className="text-sm text-cyan-100">Bem-vindo, {userName} ({role})</p>
          </div>
          <button
            className="rounded-lg bg-white/20 px-4 py-2 text-sm"
            onClick={() => {
              localStorage.removeItem("app_igreja_token");
              localStorage.removeItem("app_igreja_user");
              setToken("");
            }}
          >
            Sair
          </button>
        </div>
      </header>

      <nav className="mb-5 flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
              tab === item
                ? "border-[color:var(--brand)] bg-[color:var(--brand)] text-white"
                : "border-[color:var(--border)] bg-[color:var(--panel-strong)] text-[color:var(--foreground)]"
            }`}
          >
            {item}
          </button>
        ))}
      </nav>

      {error && <p className="mb-3 rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}
      {loading && <p className="mb-3 rounded-lg bg-blue-50 p-3 text-blue-700">Atualizando dados...</p>}

      {tab === "Visão Geral" && dashboard && (
        <section className="grid gap-4 lg:grid-cols-4">
          <SectionCard title="Pessoas">
            <p className="text-3xl font-bold">{dashboard.people.total}</p>
            <p className="mt-2 text-sm text-[color:var(--muted)]">Homens: {percentages.men}% | Mulheres: {percentages.women}%</p>
          </SectionCard>
          <SectionCard title="Kids">
            <p className="text-3xl font-bold">{dashboard.modules.kids}</p>
            <p className="mt-2 text-sm text-[color:var(--muted)]">Crianças cadastradas e prontas para check-in.</p>
          </SectionCard>
          <SectionCard title="Ensino">
            <p className="text-3xl font-bold">{dashboard.modules.courses}</p>
            <p className="mt-2 text-sm text-[color:var(--muted)]">Cursos e turmas em acompanhamento.</p>
          </SectionCard>
          <SectionCard title="Patrimonio">
            <p className="text-3xl font-bold">{dashboard.modules.assets}</p>
            <p className="mt-2 text-sm text-[color:var(--muted)]">Itens patrimoniais registrados.</p>
          </SectionCard>
          <SectionCard title="Financeiro" className="lg:col-span-2">
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <p className="text-sm text-[color:var(--muted)]">Entradas</p>
                <p className="text-2xl font-bold text-emerald-600">{money(dashboard.finance.income)}</p>
              </div>
              <div>
                <p className="text-sm text-[color:var(--muted)]">Saídas</p>
                <p className="text-2xl font-bold text-rose-600">{money(dashboard.finance.expense)}</p>
              </div>
              <div>
                <p className="text-sm text-[color:var(--muted)]">Saldo</p>
                <p className="text-2xl font-bold">{money(dashboard.finance.balance)}</p>
              </div>
            </div>
          </SectionCard>
          <SectionCard title="Midias">
            <p className="text-3xl font-bold">{dashboard.modules.media}</p>
            <p className="mt-2 text-sm text-[color:var(--muted)]">Publicações, lives e peças em gestão.</p>
          </SectionCard>
          <SectionCard title="Ajuda">
            <p className="text-3xl font-bold">{dashboard.modules.helpTickets}</p>
            <p className="mt-2 text-sm text-[color:var(--muted)]">Chamados abertos aguardando retorno.</p>
          </SectionCard>
          <SectionCard title="Cadastros Recentes" className="lg:col-span-2">
            <div className="space-y-2">
              {dashboard.recentMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between rounded-lg border border-[color:var(--border)] px-3 py-2">
                  <span className="font-semibold">{member.fullName}</span>
                  <span className="text-sm text-[color:var(--muted)]">{member.status}</span>
                </div>
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Próximos Eventos" className="lg:col-span-2">
            <div className="space-y-2">
              {dashboard.events.map((eventItem) => (
                <div key={eventItem.id} className="rounded-lg border border-[color:var(--border)] px-3 py-2">
                  <p className="font-semibold">{eventItem.title}</p>
                  <p className="text-sm text-[color:var(--muted)]">{dateTimePt(eventItem.eventDate)} | {eventItem.location || "Sem local"}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </section>
      )}

      {tab === "Pessoas" && (
        <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <SectionCard title="Cadastro de pessoas">
            <div className="max-h-[64vh] space-y-2 overflow-y-auto pr-1">
              {members.map((member) => (
                <div key={member.id} className="rounded-lg border border-[color:var(--border)] px-3 py-2">
                  <p className="font-semibold">{member.fullName}</p>
                  <p className="text-sm text-[color:var(--muted)]">{member.email || "Sem email"} | {member.phone || "Sem telefone"}</p>
                  <p className="text-sm text-[color:var(--muted)]">Status: {member.status}</p>
                </div>
              ))}
            </div>
          </SectionCard>
          <form
            className={`${panelStyle} space-y-3 p-6`}
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              void submitSimple("/members", {
                fullName: String(form.get("fullName") || ""),
                email: String(form.get("email") || ""),
                phone: String(form.get("phone") || ""),
                gender: String(form.get("gender") || ""),
                maritalStatus: String(form.get("maritalStatus") || ""),
                city: String(form.get("city") || ""),
                state: String(form.get("state") || ""),
                address: String(form.get("address") || ""),
                baptized: form.get("baptized") === "on",
              });
              e.currentTarget.reset();
            }}
          >
            <h3 className="text-xl font-bold">Novo membro</h3>
            <TextInput required name="fullName" placeholder="Nome completo" />
            <TextInput name="email" placeholder="Email" />
            <TextInput name="phone" placeholder="Telefone" />
            <Select name="gender">
              <option value="">Gênero</option>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
            </Select>
            <TextInput name="maritalStatus" placeholder="Estado civil" />
            <TextInput name="city" placeholder="Cidade" />
            <TextInput name="state" placeholder="Estado" />
            <TextInput name="address" placeholder="Endereço" />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="baptized" /> Batizado</label>
            <button className="w-full rounded-lg bg-[color:var(--success)] px-4 py-2 font-semibold text-white">Salvar membro</button>
          </form>
        </section>
      )}

      {tab === "Departamentos" && (
        <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <SectionCard title="Departamentos e ministérios">
            <div className="space-y-2">
              {ministries.map((ministry) => (
                <div key={ministry.id} className="rounded-lg border border-[color:var(--border)] px-3 py-2">
                  <p className="font-semibold">{ministry.name}</p>
                  <p className="text-sm text-[color:var(--muted)]">{ministry.description || "Sem descrição"}</p>
                </div>
              ))}
            </div>
          </SectionCard>
          <form
            className={`${panelStyle} space-y-3 p-6`}
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              void submitSimple("/ministries", {
                name: String(form.get("name") || ""),
                description: String(form.get("description") || ""),
              });
              e.currentTarget.reset();
            }}
          >
            <h3 className="text-xl font-bold">Novo departamento</h3>
            <TextInput required name="name" placeholder="Nome do ministério" />
            <TextArea name="description" placeholder="Responsabilidades, rotina, líder principal, escalas e observações" rows={5} />
            <button className="w-full rounded-lg bg-[color:var(--success)] px-4 py-2 font-semibold text-white">Salvar departamento</button>
          </form>
        </section>
      )}

      {tab === "Grupos" && (
        <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <SectionCard title="Grupos e células">
            <p className="mb-2">Total: <strong>{groups.length}</strong></p>
            <p className="mb-2">Ativos: <strong>{groups.filter((group) => group.active).length}</strong></p>
            <p className="mb-4">Inativos: <strong>{groups.filter((group) => !group.active).length}</strong></p>
            <div className="space-y-2">
              {groups.map((group) => (
                <div key={group.id} className="rounded-lg border border-[color:var(--border)] px-3 py-2">
                  <p className="font-semibold">{group.name}</p>
                  <p className="text-sm text-[color:var(--muted)]">{group.category} | {group.active ? "Ativo" : "Inativo"}</p>
                </div>
              ))}
            </div>
          </SectionCard>
          <form
            className={`${panelStyle} space-y-3 p-6`}
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              void submitSimple("/groups", {
                name: String(form.get("name") || ""),
                category: String(form.get("category") || ""),
                leaderName: String(form.get("leaderName") || ""),
                meetingDay: String(form.get("meetingDay") || ""),
                meetingTime: String(form.get("meetingTime") || ""),
                active: form.get("active") === "on",
              });
              e.currentTarget.reset();
            }}
          >
            <h3 className="text-xl font-bold">Novo grupo</h3>
            <TextInput required name="name" placeholder="Nome do grupo" />
            <TextInput required name="category" placeholder="Categoria" />
            <TextInput name="leaderName" placeholder="Líder" />
            <TextInput name="meetingDay" placeholder="Dia da reunião" />
            <TextInput name="meetingTime" placeholder="Horário" />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked /> Grupo ativo</label>
            <button className="w-full rounded-lg bg-[color:var(--success)] px-4 py-2 font-semibold text-white">Salvar grupo</button>
          </form>
        </section>
      )}

      {tab === "Kids" && (
        <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <SectionCard title="Kids e check-in infantil">
            <div className="space-y-2">
              {kids.map((kid) => (
                <div key={kid.id} className="rounded-lg border border-[color:var(--border)] px-3 py-2">
                  <p className="font-semibold">{kid.fullName}</p>
                  <p className="text-sm text-[color:var(--muted)]">Responsável: {kid.guardianName} | Sala: {kid.classroom}</p>
                  <p className="text-sm text-[color:var(--muted)]">Alergias: {kid.allergies || "Nenhuma informada"}</p>
                </div>
              ))}
            </div>
          </SectionCard>
          <form className={`${panelStyle} space-y-3 p-6`} onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            void submitSimple("/kids", {
              fullName: String(form.get("fullName") || ""),
              birthDate: String(form.get("birthDate") || ""),
              guardianName: String(form.get("guardianName") || ""),
              guardianPhone: String(form.get("guardianPhone") || ""),
              classroom: String(form.get("classroom") || ""),
              allergies: String(form.get("allergies") || ""),
              checkInAuthorized: form.get("checkInAuthorized") === "on",
              notes: String(form.get("notes") || ""),
            });
            e.currentTarget.reset();
          }}>
            <h3 className="text-xl font-bold">Nova criança</h3>
            <TextInput required name="fullName" placeholder="Nome completo" />
            <TextInput required name="birthDate" type="date" />
            <TextInput required name="guardianName" placeholder="Responsável" />
            <TextInput required name="guardianPhone" placeholder="Telefone do responsável" />
            <TextInput required name="classroom" placeholder="Sala / classe" />
            <TextInput name="allergies" placeholder="Alergias" />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="checkInAuthorized" defaultChecked /> Autorizado para check-in</label>
            <TextArea name="notes" placeholder="Observações de segurança, saída e cuidados" rows={4} />
            <button className="w-full rounded-lg bg-[color:var(--success)] px-4 py-2 font-semibold text-white">Salvar criança</button>
          </form>
        </section>
      )}

      {tab === "Ensino" && (
        <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <SectionCard title="Cursos, turmas e trilhas de ensino">
            <div className="space-y-2">
              {courses.map((course) => (
                <div key={course.id} className="rounded-lg border border-[color:var(--border)] px-3 py-2">
                  <p className="font-semibold">{course.title}</p>
                  <p className="text-sm text-[color:var(--muted)]">{course.category} | Professor: {course.teacherName}</p>
                  <p className="text-sm text-[color:var(--muted)]">Carga horária: {course.workloadHours}h | Matriculados: {course.enrolledCount}</p>
                </div>
              ))}
            </div>
          </SectionCard>
          <form className={`${panelStyle} space-y-3 p-6`} onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            void submitSimple("/teaching/courses", {
              title: String(form.get("title") || ""),
              category: String(form.get("category") || ""),
              teacherName: String(form.get("teacherName") || ""),
              room: String(form.get("room") || ""),
              workloadHours: Number(form.get("workloadHours") || 0),
              startDate: String(form.get("startDate") || ""),
              endDate: String(form.get("endDate") || ""),
              active: form.get("active") === "on",
              material: String(form.get("material") || ""),
              enrolledCount: Number(form.get("enrolledCount") || 0),
            });
            e.currentTarget.reset();
          }}>
            <h3 className="text-xl font-bold">Novo curso</h3>
            <TextInput required name="title" placeholder="Título do curso" />
            <TextInput required name="category" placeholder="Categoria" />
            <TextInput required name="teacherName" placeholder="Professor responsável" />
            <TextInput name="room" placeholder="Sala" />
            <TextInput required name="workloadHours" type="number" min="1" placeholder="Carga horária" />
            <TextInput required name="startDate" type="date" />
            <TextInput name="endDate" type="date" />
            <TextInput name="enrolledCount" type="number" min="0" placeholder="Quantidade de alunos" />
            <TextInput name="material" placeholder="Material didático" />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked /> Curso ativo</label>
            <button className="w-full rounded-lg bg-[color:var(--success)] px-4 py-2 font-semibold text-white">Salvar curso</button>
          </form>
        </section>
      )}

      {tab === "Financeiro" && (
        <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <SectionCard title="Lançamentos financeiros">
            <div className="mb-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-lg bg-emerald-50 p-3"><p className="text-sm">Entradas</p><p className="text-xl font-bold">{money(financeSummary.income)}</p></div>
              <div className="rounded-lg bg-rose-50 p-3"><p className="text-sm">Saídas</p><p className="text-xl font-bold">{money(financeSummary.expense)}</p></div>
              <div className="rounded-lg bg-slate-100 p-3"><p className="text-sm">Saldo</p><p className="text-xl font-bold">{money(financeSummary.income - financeSummary.expense)}</p></div>
            </div>
            <div className="space-y-2">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="rounded-lg border border-[color:var(--border)] px-3 py-2">
                  <p className="font-semibold">{transaction.title}</p>
                  <p className="text-sm text-[color:var(--muted)]">{transaction.type} | {money(transaction.amount)} | {transaction.category}</p>
                </div>
              ))}
            </div>
          </SectionCard>
          <form className={`${panelStyle} space-y-3 p-6`} onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            void submitSimple("/finance/transactions", {
              title: String(form.get("title") || ""),
              category: String(form.get("category") || ""),
              type: String(form.get("type") || "ENTRADA"),
              amount: Number(form.get("amount") || 0),
              date: new Date(String(form.get("date") || new Date().toISOString())).toISOString(),
              description: String(form.get("description") || ""),
            });
            e.currentTarget.reset();
          }}>
            <h3 className="text-xl font-bold">Novo lançamento</h3>
            <TextInput required name="title" placeholder="Título" />
            <TextInput required name="category" placeholder="Categoria" />
            <TextInput required name="amount" type="number" step="0.01" placeholder="Valor" />
            <TextInput required name="date" type="datetime-local" />
            <Select name="type">
              <option value="ENTRADA">Entrada</option>
              <option value="SAIDA">Saída</option>
            </Select>
            <TextArea name="description" placeholder="Descrição" rows={4} />
            <button className="w-full rounded-lg bg-[color:var(--success)] px-4 py-2 font-semibold text-white">Salvar lançamento</button>
          </form>
        </section>
      )}

      {tab === "Patrimonio" && (
        <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <SectionCard title="Patrimônio e inventário">
            <div className="space-y-2">
              {assets.map((asset) => (
                <div key={asset.id} className="rounded-lg border border-[color:var(--border)] px-3 py-2">
                  <p className="font-semibold">{asset.itemName}</p>
                  <p className="text-sm text-[color:var(--muted)]">{asset.category} | {asset.location} | {asset.condition}</p>
                  <p className="text-sm text-[color:var(--muted)]">Valor: {money(asset.acquisitionValue)}</p>
                </div>
              ))}
            </div>
          </SectionCard>
          <form className={`${panelStyle} space-y-3 p-6`} onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            void submitSimple("/assets", {
              itemName: String(form.get("itemName") || ""),
              category: String(form.get("category") || ""),
              location: String(form.get("location") || ""),
              acquisitionDate: String(form.get("acquisitionDate") || ""),
              acquisitionValue: Number(form.get("acquisitionValue") || 0),
              condition: String(form.get("condition") || ""),
              responsible: String(form.get("responsible") || ""),
              serialNumber: String(form.get("serialNumber") || ""),
              notes: String(form.get("notes") || ""),
            });
            e.currentTarget.reset();
          }}>
            <h3 className="text-xl font-bold">Novo item patrimonial</h3>
            <TextInput required name="itemName" placeholder="Nome do item" />
            <TextInput required name="category" placeholder="Categoria" />
            <TextInput required name="location" placeholder="Localização" />
            <TextInput required name="acquisitionDate" type="date" />
            <TextInput required name="acquisitionValue" type="number" step="0.01" placeholder="Valor de aquisição" />
            <TextInput required name="condition" placeholder="Estado de conservação" />
            <TextInput name="responsible" placeholder="Responsável" />
            <TextInput name="serialNumber" placeholder="Número de série / patrimônio" />
            <TextArea name="notes" placeholder="Observações" rows={4} />
            <button className="w-full rounded-lg bg-[color:var(--success)] px-4 py-2 font-semibold text-white">Salvar item</button>
          </form>
        </section>
      )}

      {tab === "Agenda" && (
        <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <SectionCard title="Agenda e calendário ministerial">
            <div className="space-y-2">
              {events.map((eventItem) => (
                <div key={eventItem.id} className="rounded-lg border border-[color:var(--border)] px-3 py-2">
                  <p className="font-semibold">{eventItem.title}</p>
                  <p className="text-sm text-[color:var(--muted)]">{dateTimePt(eventItem.eventDate)} | {eventItem.category} | {eventItem.location || "Sem local"}</p>
                </div>
              ))}
            </div>
          </SectionCard>
          <form className={`${panelStyle} space-y-3 p-6`} onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            void submitSimple("/events", {
              title: String(form.get("title") || ""),
              category: String(form.get("category") || ""),
              location: String(form.get("location") || ""),
              description: String(form.get("description") || ""),
              eventDate: new Date(String(form.get("eventDate") || new Date().toISOString())).toISOString(),
            });
            e.currentTarget.reset();
          }}>
            <h3 className="text-xl font-bold">Novo evento</h3>
            <TextInput required name="title" placeholder="Título" />
            <TextInput required name="category" placeholder="Categoria" />
            <TextInput required name="eventDate" type="datetime-local" />
            <TextInput name="location" placeholder="Local" />
            <TextArea name="description" placeholder="Descrição" rows={4} />
            <button className="w-full rounded-lg bg-[color:var(--success)] px-4 py-2 font-semibold text-white">Salvar evento</button>
          </form>
        </section>
      )}

      {tab === "Midias" && (
        <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <SectionCard title="Produção e publicações de mídia">
            <div className="space-y-2">
              {mediaItems.map((item) => (
                <div key={item.id} className="rounded-lg border border-[color:var(--border)] px-3 py-2">
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-[color:var(--muted)]">{item.category} | {item.platform} | {item.status}</p>
                  <p className="text-sm text-[color:var(--muted)]">Responsável: {item.responsible}</p>
                </div>
              ))}
            </div>
          </SectionCard>
          <form className={`${panelStyle} space-y-3 p-6`} onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            void submitSimple("/media", {
              title: String(form.get("title") || ""),
              category: String(form.get("category") || ""),
              platform: String(form.get("platform") || ""),
              publishDate: String(form.get("publishDate") || ""),
              responsible: String(form.get("responsible") || ""),
              status: String(form.get("status") || ""),
              url: String(form.get("url") || ""),
              notes: String(form.get("notes") || ""),
            });
            e.currentTarget.reset();
          }}>
            <h3 className="text-xl font-bold">Novo item de mídia</h3>
            <TextInput required name="title" placeholder="Título" />
            <TextInput required name="category" placeholder="Tipo: foto, vídeo, live, design..." />
            <TextInput required name="platform" placeholder="Plataforma" />
            <TextInput required name="publishDate" type="date" />
            <TextInput required name="responsible" placeholder="Responsável" />
            <TextInput required name="status" placeholder="Status" />
            <TextInput name="url" placeholder="URL pública" />
            <TextArea name="notes" placeholder="Observações editoriais" rows={4} />
            <button className="w-full rounded-lg bg-[color:var(--success)] px-4 py-2 font-semibold text-white">Salvar mídia</button>
          </form>
        </section>
      )}

      {tab === "Ajuda" && (
        <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr]">
          <SectionCard title="Central de ajuda">
            <div className="space-y-3">
              {helpArticles.map((article) => (
                <div key={article.id} className="rounded-lg border border-[color:var(--border)] px-3 py-3">
                  <p className="font-semibold">{article.title}</p>
                  <p className="text-sm text-[color:var(--muted)]">{article.category}</p>
                  <p className="mt-2 text-sm text-[color:var(--foreground)]">{article.content}</p>
                  {article.contactEmail && <p className="mt-2 text-sm text-[color:var(--muted)]">Contato: {article.contactEmail}</p>}
                </div>
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Chamados abertos">
            <div className="space-y-2">
              {helpTickets.map((ticket) => (
                <div key={ticket.id} className="rounded-lg border border-[color:var(--border)] px-3 py-2">
                  <p className="font-semibold">{ticket.subject}</p>
                  <p className="text-sm text-[color:var(--muted)]">{ticket.category} | {ticket.priority} | {ticket.status}</p>
                  <p className="text-sm text-[color:var(--muted)]">{ticket.requesterName}</p>
                </div>
              ))}
            </div>
          </SectionCard>
          <form className={`${panelStyle} space-y-3 p-6`} onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            void submitSimple("/help/tickets", {
              subject: String(form.get("subject") || ""),
              category: String(form.get("category") || ""),
              message: String(form.get("message") || ""),
              requesterName: String(form.get("requesterName") || userName),
              requesterEmail: String(form.get("requesterEmail") || ""),
              priority: String(form.get("priority") || ""),
            });
            e.currentTarget.reset();
          }}>
            <h3 className="text-xl font-bold">Abrir chamado</h3>
            <TextInput required name="subject" placeholder="Assunto" />
            <TextInput required name="category" placeholder="Categoria" />
            <TextInput required name="requesterName" defaultValue={userName} placeholder="Solicitante" />
            <TextInput required name="requesterEmail" placeholder="Email" />
            <Select name="priority" required>
              <option value="">Prioridade</option>
              <option value="Baixa">Baixa</option>
              <option value="Media">Média</option>
              <option value="Alta">Alta</option>
            </Select>
            <TextArea required name="message" placeholder="Descreva a necessidade com contexto e impacto" rows={6} />
            <button className="w-full rounded-lg bg-[color:var(--success)] px-4 py-2 font-semibold text-white">Enviar chamado</button>
          </form>
        </section>
      )}
    </main>
  );
}
