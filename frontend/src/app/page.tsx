"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api";
import {
  AuthResponse,
  DashboardData,
  EventItem,
  Group,
  Member,
  Ministry,
  Transaction,
  UserRole,
} from "@/types/domain";

type Tab = "Visao geral" | "Pessoas" | "Departamentos" | "Grupos" | "Agenda" | "Financeiro";

function money(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

const panelStyle =
  "rounded-2xl border border-[color:var(--border)] bg-[color:var(--panel-strong)] shadow-[0_12px_24px_rgba(41,64,86,0.07)]";

export default function Home() {
  const [tab, setTab] = useState<Tab>("Visao geral");
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
      const [overview, memberData, groupData, ministryData, eventData, txData] = await Promise.all([
        apiRequest<DashboardData>("/dashboard/overview", {}, currentToken),
        apiRequest<Member[]>("/members", {}, currentToken),
        apiRequest<Group[]>("/groups", {}, currentToken),
        apiRequest<Ministry[]>("/ministries", {}, currentToken),
        apiRequest<EventItem[]>("/events", {}, currentToken),
        apiRequest<Transaction[]>("/finance/transactions", {}, currentToken),
      ]);

      setDashboard(overview);
      setMembers(memberData);
      setGroups(groupData);
      setMinistries(ministryData);
      setEvents(eventData);
      setTransactions(txData);
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
    if (!token) return;
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
            <h1 className="mt-5 text-4xl font-bold">Gestao completa da igreja em um unico painel</h1>
            <p className="mt-5 text-lg text-cyan-50">
              Cadastros, ministerios, grupos, agenda e financeiro com seguranca e controle por perfil.
            </p>
          </div>
          <form onSubmit={login} className="space-y-4 p-10">
            <h2 className="text-3xl font-bold text-[color:var(--foreground)]">Entrar</h2>
            <p className="text-sm text-[color:var(--muted)]">Use o usuario seed inicial para começar.</p>
            <label className="block text-sm font-semibold">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[color:var(--border)] px-4 py-3 outline-none focus:border-[color:var(--brand)]"
              placeholder="admin@appigreja.com"
            />
            <label className="block text-sm font-semibold">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[color:var(--border)] px-4 py-3 outline-none focus:border-[color:var(--brand)]"
              placeholder="******"
            />
            {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <button
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-[color:var(--accent)] px-5 py-3 text-lg font-semibold text-white disabled:opacity-60"
            >
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
            <h1 className="text-2xl font-bold">Teste Igreja</h1>
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

      <nav className="mb-5 grid grid-cols-2 gap-2 md:grid-cols-6">
        {["Visao geral", "Pessoas", "Departamentos", "Grupos", "Agenda", "Financeiro"].map((item) => (
          <button
            key={item}
            onClick={() => setTab(item as Tab)}
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

      {tab === "Visao geral" && dashboard && (
        <section className="grid gap-4 lg:grid-cols-3">
          <article className={`${panelStyle} p-6`}>
            <h3 className="text-3xl font-bold">{dashboard.people.total}</h3>
            <p className="text-lg text-[color:var(--muted)]">Total de pessoas</p>
          </article>
          <article className={`${panelStyle} p-6`}>
            <h3 className="text-3xl font-bold">{percentages.men}%</h3>
            <p className="text-lg text-[color:var(--muted)]">Total de homens</p>
          </article>
          <article className={`${panelStyle} p-6`}>
            <h3 className="text-3xl font-bold">{percentages.women}%</h3>
            <p className="text-lg text-[color:var(--muted)]">Total de mulheres</p>
          </article>
          <article className={`${panelStyle} p-6 lg:col-span-2`}>
            <h3 className="mb-3 text-2xl font-bold">Cadastros recentes</h3>
            <div className="space-y-2">
              {dashboard.recentMembers.length === 0 && <p className="text-[color:var(--muted)]">Nenhum cadastro recente.</p>}
              {dashboard.recentMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between rounded-lg border border-[color:var(--border)] px-3 py-2">
                  <span className="font-semibold">{member.fullName}</span>
                  <span className="text-sm text-[color:var(--muted)]">{member.status}</span>
                </div>
              ))}
            </div>
          </article>
          <article className={`${panelStyle} p-6`}>
            <h3 className="mb-3 text-2xl font-bold">Financeiro</h3>
            <p>Entradas: <strong>{money(dashboard.finance.income)}</strong></p>
            <p>Saidas: <strong>{money(dashboard.finance.expense)}</strong></p>
            <p>Saldo: <strong>{money(dashboard.finance.balance)}</strong></p>
          </article>
        </section>
      )}

      {tab === "Pessoas" && (
        <section className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <article className={`${panelStyle} p-6`}>
            <h3 className="mb-4 text-2xl font-bold">Membros</h3>
            <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
              {members.map((member) => (
                <div key={member.id} className="rounded-lg border border-[color:var(--border)] px-3 py-2">
                  <p className="font-semibold">{member.fullName}</p>
                  <p className="text-sm text-[color:var(--muted)]">{member.email || "Sem email"} | {member.phone || "Sem telefone"}</p>
                </div>
              ))}
            </div>
          </article>
          <form
            className={`${panelStyle} space-y-3 p-6`}
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              void submitSimple("/members", {
                fullName: form.get("fullName"),
                email: form.get("email"),
                phone: form.get("phone"),
                gender: form.get("gender"),
              });
              e.currentTarget.reset();
            }}
          >
            <h3 className="text-xl font-bold">Novo membro</h3>
            <input required name="fullName" placeholder="Nome completo" className="w-full rounded-lg border border-[color:var(--border)] px-3 py-2" />
            <input name="email" placeholder="Email" className="w-full rounded-lg border border-[color:var(--border)] px-3 py-2" />
            <input name="phone" placeholder="Telefone" className="w-full rounded-lg border border-[color:var(--border)] px-3 py-2" />
            <select name="gender" className="w-full rounded-lg border border-[color:var(--border)] px-3 py-2">
              <option value="">Genero</option>
              <option value="M">Masculino</option>
              <option value="F">Feminino</option>
            </select>
            <button className="w-full rounded-lg bg-[color:var(--success)] px-4 py-2 font-semibold text-white">Salvar membro</button>
          </form>
        </section>
      )}

      {tab === "Departamentos" && (
        <section className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <article className={`${panelStyle} p-6`}>
            <h3 className="mb-4 text-2xl font-bold">Ministerios</h3>
            <div className="space-y-2">
              {ministries.map((ministry) => (
                <div key={ministry.id} className="rounded-lg border border-[color:var(--border)] px-3 py-2">
                  <p className="font-semibold">{ministry.name}</p>
                  <p className="text-sm text-[color:var(--muted)]">{ministry.description || "Sem descricao"}</p>
                </div>
              ))}
            </div>
          </article>
          <form
            className={`${panelStyle} space-y-3 p-6`}
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              void submitSimple("/ministries", {
                name: form.get("name"),
                description: form.get("description"),
              });
              e.currentTarget.reset();
            }}
          >
            <h3 className="text-xl font-bold">Novo ministerio</h3>
            <input required name="name" placeholder="Nome" className="w-full rounded-lg border border-[color:var(--border)] px-3 py-2" />
            <textarea name="description" placeholder="Descricao" className="w-full rounded-lg border border-[color:var(--border)] px-3 py-2" />
            <button className="w-full rounded-lg bg-[color:var(--success)] px-4 py-2 font-semibold text-white">Salvar ministerio</button>
          </form>
        </section>
      )}

      {tab === "Grupos" && (
        <section className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <article className={`${panelStyle} p-6`}>
            <h3 className="mb-4 text-2xl font-bold">Situacao dos grupos</h3>
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
          </article>
          <form
            className={`${panelStyle} space-y-3 p-6`}
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              void submitSimple("/groups", {
                name: form.get("name"),
                category: form.get("category"),
                leaderName: form.get("leaderName"),
                meetingDay: form.get("meetingDay"),
                meetingTime: form.get("meetingTime"),
                active: form.get("active") === "on",
              });
              e.currentTarget.reset();
            }}
          >
            <h3 className="text-xl font-bold">Novo grupo</h3>
            <input required name="name" placeholder="Nome do grupo" className="w-full rounded-lg border border-[color:var(--border)] px-3 py-2" />
            <input required name="category" placeholder="Categoria" className="w-full rounded-lg border border-[color:var(--border)] px-3 py-2" />
            <input name="leaderName" placeholder="Lider" className="w-full rounded-lg border border-[color:var(--border)] px-3 py-2" />
            <input name="meetingDay" placeholder="Dia da reuniao" className="w-full rounded-lg border border-[color:var(--border)] px-3 py-2" />
            <input name="meetingTime" placeholder="Horario" className="w-full rounded-lg border border-[color:var(--border)] px-3 py-2" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="active" defaultChecked /> Grupo ativo
            </label>
            <button className="w-full rounded-lg bg-[color:var(--success)] px-4 py-2 font-semibold text-white">Salvar grupo</button>
          </form>
        </section>
      )}

      {tab === "Agenda" && (
        <section className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <article className={`${panelStyle} p-6`}>
            <h3 className="mb-4 text-2xl font-bold">Agenda da igreja</h3>
            <div className="space-y-2">
              {events.map((eventItem) => (
                <div key={eventItem.id} className="rounded-lg border border-[color:var(--border)] px-3 py-2">
                  <p className="font-semibold">{eventItem.title}</p>
                  <p className="text-sm text-[color:var(--muted)]">
                    {new Date(eventItem.eventDate).toLocaleString("pt-BR")} | {eventItem.category} | {eventItem.location || "Sem local"}
                  </p>
                </div>
              ))}
            </div>
          </article>
          <form
            className={`${panelStyle} space-y-3 p-6`}
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              const eventDate = form.get("eventDate");
              void submitSimple("/events", {
                title: form.get("title"),
                category: form.get("category"),
                location: form.get("location"),
                description: form.get("description"),
                eventDate: new Date(String(eventDate)).toISOString(),
              });
              e.currentTarget.reset();
            }}
          >
            <h3 className="text-xl font-bold">Novo evento</h3>
            <input required name="title" placeholder="Titulo" className="w-full rounded-lg border border-[color:var(--border)] px-3 py-2" />
            <input required name="category" placeholder="Categoria" className="w-full rounded-lg border border-[color:var(--border)] px-3 py-2" />
            <input required name="eventDate" type="datetime-local" className="w-full rounded-lg border border-[color:var(--border)] px-3 py-2" />
            <input name="location" placeholder="Local" className="w-full rounded-lg border border-[color:var(--border)] px-3 py-2" />
            <textarea name="description" placeholder="Descricao" className="w-full rounded-lg border border-[color:var(--border)] px-3 py-2" />
            <button className="w-full rounded-lg bg-[color:var(--success)] px-4 py-2 font-semibold text-white">Salvar evento</button>
          </form>
        </section>
      )}

      {tab === "Financeiro" && (
        <section className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <article className={`${panelStyle} p-6`}>
            <h3 className="mb-4 text-2xl font-bold">Lancamentos financeiros</h3>
            <div className="space-y-2">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="rounded-lg border border-[color:var(--border)] px-3 py-2">
                  <p className="font-semibold">{transaction.title}</p>
                  <p className="text-sm text-[color:var(--muted)]">
                    {transaction.type} | {money(transaction.amount)} | {transaction.category}
                  </p>
                </div>
              ))}
            </div>
          </article>
          <form
            className={`${panelStyle} space-y-3 p-6`}
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              const amount = Number(form.get("amount") || 0);
              void submitSimple("/finance/transactions", {
                title: form.get("title"),
                category: form.get("category"),
                type: form.get("type"),
                amount,
                date: new Date(String(form.get("date"))).toISOString(),
                description: form.get("description"),
              });
              e.currentTarget.reset();
            }}
          >
            <h3 className="text-xl font-bold">Novo lancamento</h3>
            <input required name="title" placeholder="Titulo" className="w-full rounded-lg border border-[color:var(--border)] px-3 py-2" />
            <input required name="category" placeholder="Categoria" className="w-full rounded-lg border border-[color:var(--border)] px-3 py-2" />
            <input required name="amount" type="number" step="0.01" placeholder="Valor" className="w-full rounded-lg border border-[color:var(--border)] px-3 py-2" />
            <input required name="date" type="datetime-local" className="w-full rounded-lg border border-[color:var(--border)] px-3 py-2" />
            <select name="type" className="w-full rounded-lg border border-[color:var(--border)] px-3 py-2">
              <option value="ENTRADA">Entrada</option>
              <option value="SAIDA">Saida</option>
            </select>
            <textarea name="description" placeholder="Descricao" className="w-full rounded-lg border border-[color:var(--border)] px-3 py-2" />
            <button className="w-full rounded-lg bg-[color:var(--success)] px-4 py-2 font-semibold text-white">Salvar lancamento</button>
          </form>
        </section>
      )}
    </main>
  );
}
