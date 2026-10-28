import { useMemo, useState } from "react";
import { supabase } from "./lib/supabase";
import { TeamAccessPanel } from "./TeamAccessPanel";
import type { UserProfile } from "./AuthGate";
import {
  Activity, ArrowDownRight, ArrowUpRight, Bell, CalendarDays, Check,
  ChevronDown, ClipboardList, Clock3, FileCheck2, FilePlus2, Filter,
  LayoutDashboard, LogOut, Menu, Plus, Search, ShieldCheck, Users, X
} from "lucide-react";

type Report = {
  id: string;
  adm: string;
  date: string;
  shift: string;
  level: string;
  status: "Enviado" | "Em análise" | "Aprovado";
  start: string;
  end: string;
  room: string;
  visits: string;
  events: string;
  occurrences: string;
  teamwork: string;
  notes: string;
};

const initialReports: Report[] = [
  { id: "CMG-1048", adm: "ADM Paçoca", date: "17/10/2026", shift: "Noite", level: "Nível 2", status: "Em análise", start: "19:00", end: "22:00", room: "Sala oficial", visits: "3 salas visitadas", events: "Acompanhamento de dinâmica", occurrences: "Nenhuma informada", teamwork: "Apoio aos ADMs do turno", notes: "Relatório demonstrativo." },
  { id: "CMG-1047", adm: "ADM Júlia", date: "17/10/2026", shift: "Tarde", level: "Nível 2", status: "Enviado", start: "15:00", end: "18:00", room: "Sala oficial", visits: "2 salas visitadas", events: "Organização da sala", occurrences: "Horário de saída pendente de conferência", teamwork: "Alinhamento com a equipe", notes: "Relatório demonstrativo." },
  { id: "CMG-1046", adm: "ADM Nando", date: "16/10/2026", shift: "Noite", level: "Nível 1", status: "Aprovado", start: "20:00", end: "23:00", room: "Sala oficial", visits: "1 sala visitada", events: "Suporte à equipe", occurrences: "Nenhuma informada", teamwork: "Suporte durante o turno", notes: "Relatório demonstrativo." },
];

const today = "2026-10-17";

function App() {
  const [role, setRole] = useState<"master" | "adm">("master");
  const [active, setActive] = useState("Visão geral");
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<Report | null>(null);
  const [notice, setNotice] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [form, setForm] = useState({
    date: today, shift: "Noite", level: "Nível 2", start: "", end: "",
    room: "", visits: "", events: "", occurrences: "", teamwork: "", notes: ""
  });

  const visibleReports = useMemo(() => reports.filter((r) => {
    const matchesSearch = [r.adm, r.id, r.shift, r.level].join(" ").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "Todos" || r.status === statusFilter;
    const matchesRole = role === "master" || r.adm === "Meu relatório";
    return matchesSearch && matchesStatus && matchesRole;
  }), [reports, search, statusFilter, role]);

  const pending = reports.filter((r) => r.status !== "Aprovado").length;
  const approved = reports.filter((r) => r.status === "Aprovado").length;
  const todayCount = reports.filter((r) => r.date === "17/10/2026").length;

  function saveReport() {
    if (!form.start || !form.end || !form.room.trim()) {
      setNotice("Preencha os horários e a sala oficial antes de enviar.");
      return;
    }
    const report: Report = {
      id: `CMG-${1050 + reports.length}`, adm: role === "master" ? "ADM Paçoca" : "Meu relatório",
      date: new Date(form.date + "T12:00:00").toLocaleDateString("pt-BR"),
      shift: form.shift, level: form.level, status: "Enviado", start: form.start, end: form.end,
      room: form.room, visits: form.visits || "Não informado", events: form.events || "Não informado",
      occurrences: form.occurrences || "Nenhuma informada", teamwork: form.teamwork || "Não informado",
      notes: form.notes || "Sem observações."
    };
    setReports((prev) => [report, ...prev]);
    setShowForm(false);
    setForm({ date: today, shift: "Noite", level: "Nível 2", start: "", end: "", room: "", visits: "", events: "", occurrences: "", teamwork: "", notes: "" });
    setNotice("Relatório adicionado à demonstração. Os dados ainda não são persistidos em um servidor.");
  }

  function changeStatus(id: string, status: Report["status"]) {
    setReports((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
    setSelected((prev) => prev?.id === id ? { ...prev, status } : prev);
    setNotice(`Status atualizado para “${status}” nesta demonstração.`);
  }

  const navItems = role === "master"
    ? [{ label: "Visão geral", icon: LayoutDashboard }, { label: "Relatórios", icon: ClipboardList }, { label: "Relatório geral", icon: FileCheck2 }, { label: "Equipe", icon: Users }]
    : [{ label: "Meu painel", icon: LayoutDashboard }, { label: "Meus relatórios", icon: ClipboardList }, { label: "Novo relatório", icon: FilePlus2 }];

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">CM</div>
          <div><strong>Chega Mais</strong><span>ADMIN CENTRAL</span></div>
          <button className="icon-button close-nav" onClick={() => setMobileNav(false)} aria-label="Fechar menu"><X size={18}/></button>
        </div>
        <div className="workspace-label">ESPAÇO DE TRABALHO</div>
        <div className="role-switch">
          <div className="role-avatar">{role === "master" ? <ShieldCheck size={18}/> : <Users size={18}/>}</div>
          <div className="role-copy"><strong>{role === "master" ? "ADM Master" : "Área do ADM"}</strong><span>{role === "master" ? "Acesso de gestão" : "Acesso individual"}</span></div>
          <ChevronDown size={16} className="muted-icon"/>
        </div>
        <nav className="navigation">
          <span className="nav-caption">MENU PRINCIPAL</span>
          {navItems.map(({ label, icon: Icon }) => (
            <button key={label} className={`nav-item ${active === label ? "nav-active" : ""}`} onClick={() => { setActive(label); setMobileNav(false); if (label === "Novo relatório") setShowForm(true); }}>
              <Icon size={18}/><span>{label}</span>{label === "Relatórios" && pending > 0 && <span className="nav-count">{pending}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card"><div className="help-icon"><Activity size={17}/></div><strong>Central de operações</strong><p>Organização e acompanhamento dos turnos em um só lugar.</p></div>
          <div className="profile-row"><div className="profile-avatar">{role === "master" ? "P" : "A"}</div><div className="profile-info"><strong>{role === "master" ? "ADM Paçoca" : "ADM da equipe"}</strong><span>{role === "master" ? "Administrador master" : "Administrador"}</span></div><LogOut size={16} className="muted-icon"/></div>
        </div>
      </aside>

      {mobileNav && <button className="mobile-scrim" aria-label="Fechar menu" onClick={() => setMobileNav(false)}/>}
      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left"><button className="icon-button menu-toggle" onClick={() => setMobileNav(true)} aria-label="Abrir menu"><Menu size={20}/></button><div className="breadcrumb">Chega Mais Games <span>/</span> <strong>{active}</strong></div></div>
          <div className="topbar-actions">
            <div className="demo-label"><span className="demo-dot"/> Ambiente de demonstração</div>
            <button className="icon-button notification-button" aria-label="Notificações"><Bell size={19}/><i/></button>
            <div className="top-avatar">{role === "master" ? "P" : "A"}</div>
          </div>
        </header>

        <div className="page-content">
          <div className="welcome-row">
            <div><div className="eyebrow"><CalendarDays size={14}/> SÁBADO, 17 DE OUTUBRO DE 2026</div><h1>{active === "Visão geral" || active === "Meu painel" ? "Visão geral" : active}</h1><p className="page-subtitle">{role === "master" ? "Acompanhe os relatórios e a rotina administrativa da equipe." : "Registre seu turno e acompanhe seus relatórios enviados."}</p></div>
            <div className="welcome-actions">
              <button className="button button-secondary" onClick={onSignOut}><LogOut size={16}/> Sair</button>
              <button className="button button-primary" onClick={() => setShowForm(true)}><Plus size={17}/> Novo relatório</button>
            </div>
          </div>

          <div className="prototype-banner"><div className="banner-symbol"><ShieldCheck size={18}/></div><div><strong>Sessão autenticada</strong><p>Conta: {profile.display_name || profile.username || profile.id}. O gerenciamento de acessos usa validação no servidor. Os relatórios desta tela ainda são demonstrativos.</p></div></div>

          {notice && <div className="toast-message"><Check size={16}/><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Fechar aviso"><X size={15}/></button></div>}

          {active === "Relatório geral" ? (
            <section className="panel report-summary-panel">
              <div className="panel-heading"><div><h2>Consolidado da equipe</h2><p>Resumo automático a partir dos relatórios registrados nesta demonstração.</p></div><button className="button button-secondary" onClick={() => setNotice("A exportação PDF será implementada em uma próxima etapa.")}>Exportar relatório</button></div>
              <div className="summary-grid"><div><span>Relatórios registrados</span><strong>{reports.length}</strong></div><div><span>Aprovados</span><strong>{approved}</strong></div><div><span>Pendentes de revisão</span><strong>{pending}</strong></div></div>
              <h3 className="section-title">Resumo por registro</h3>
              {reports.map(r => <div className="consolidated-row" key={r.id}><div><strong>{r.adm}</strong><span>{r.date} · {r.shift} · {r.start}–{r.end}</span></div><StatusBadge status={r.status}/></div>)}
              <div className="summary-note">Este consolidado reúne apenas o conteúdo preenchido. Informações ausentes não são presumidas.</div>
            </section>
          ) : active === "Equipe" ? (
            <section className="panel"><div className="panel-heading"><div><h2>Equipe administrativa</h2><p>Gerencie os níveis de acesso da equipe.</p></div></div><div className="team-list">{[{name:"ADM Paçoca",role:"admin_master"},{name:"ADM Júlia",role:"adm"},{name:"ADM Nando",role:"adm"}].map((member)=><div className="team-row" key={member.name}><div className="team-avatar">{member.name.charAt(member.name.lastIndexOf(" ") + 1)}</div><div className="team-person"><strong>{member.name}</strong><span>{member.role==="admin_master"?"Administrador master":"Administrador"}</span></div><span className="team-access">{member.role==="admin_master"?"Master":"ADM"}</span>{member.name!=="ADM Paçoca"&&<button className="button button-secondary button-small" onClick={()=>setNotice(member.role==="admin_master"?"Rebaixamento disponível somente para ADM Paçoca. A ação será conectada ao banco na próxima etapa.":"Promoção para Admin Master disponível para Admin Masters. A ação será conectada ao banco na próxima etapa.")}>{member.role==="admin_master"?"Rebaixar para ADM":"Promover a Master"}</button>}</div>)}</div><p className="footnote">Demonstração visual: os botões ainda não alteram contas reais. As permissões efetivas devem ser validadas pelo Supabase.</p></section>
          ) : (
            <>
              <section className="stats-grid">
                <StatCard label="Relatórios registrados" value={String(reports.length).padStart(2,"0")} detail="No ambiente de demonstração" icon={<ClipboardList size={19}/>} tone="blue" trend="up"/>
                <StatCard label="Aguardando revisão" value={String(pending).padStart(2,"0")} detail="Precisam de conferência" icon={<Clock3 size={19}/>} tone="amber" trend="down"/>
                <StatCard label="Aprovados" value={String(approved).padStart(2,"0")} detail="Revisados pelo Master" icon={<FileCheck2 size={19}/>} tone="green" trend="up"/>
                <StatCard label="Registros de hoje" value={String(todayCount).padStart(2,"0")} detail="Data demonstrativa" icon={<CalendarDays size={19}/>} tone="purple" trend="up"/>
              </section>

              <section className="panel reports-panel">
                <div className="panel-heading"><div><h2>{role === "master" ? "Relatórios recentes" : "Meus relatórios"}</h2><p>{role === "master" ? "Consulte, confira e atualize o status de cada envio." : "Acompanhe os relatórios que você registrou."}</p></div><button className="button button-secondary button-small" onClick={() => setNotice("Filtros adicionais serão disponibilizados na versão conectada.")}><Filter size={15}/> Filtros</button></div>
                <div className="table-toolbar"><div className="search-field"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por ADM, código ou turno..."/></div><select className="status-select" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option>Todos</option><option>Enviado</option><option>Em análise</option><option>Aprovado</option></select></div>
                <div className="table-wrap"><table><thead><tr><th>IDENTIFICAÇÃO</th><th>DATA / TURNO</th><th>HORÁRIO</th><th>STATUS</th><th></th></tr></thead><tbody>
                  {visibleReports.map(r=><tr key={r.id}><td><div className="report-ident"><div className="report-icon"><ClipboardList size={17}/></div><div><strong>{r.adm}</strong><span>{r.id} · {r.level}</span></div></div></td><td><strong>{r.date}</strong><span className="cell-sub">{r.shift}</span></td><td><strong>{r.start} – {r.end}</strong><span className="cell-sub">{r.room}</span></td><td><StatusBadge status={r.status}/></td><td><button className="text-action" onClick={()=>setSelected(r)}>Ver detalhes <ArrowUpRight size={14}/></button></td></tr>)}
                  {visibleReports.length===0&&<tr><td colSpan={5} className="empty-state">Nenhum relatório encontrado com esses filtros.</td></tr>}
                </tbody></table></div>
                <div className="table-footer"><span>Exibindo {visibleReports.length} de {reports.length} relatórios demonstrativos</span><span className="footer-live"><span/> Atualização local</span></div>
              </section>
            </>
          )}
          <footer className="page-footer"><span>ADM Central <b>·</b> Chega Mais Games</span><span>Construído para organizar. Feito para facilitar.</span></footer>
        </div>
      </main>

      {showForm && <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setShowForm(false)}}><section className="modal form-modal"><div className="modal-heading"><div><span className="eyebrow">REGISTRO DE TURNO</span><h2>Novo relatório</h2><p>Preencha as informações do seu turno.</p></div><button className="icon-button" onClick={()=>setShowForm(false)} aria-label="Fechar"><X size={19}/></button></div><div className="form-grid">
        <label>Data do relatório<input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></label>
        <label>Turno<select value={form.shift} onChange={e=>setForm({...form,shift:e.target.value})}><option>Manhã</option><option>Tarde</option><option>Noite</option><option>Madrugada</option></select></label>
        <label>Nível ADM<select value={form.level} onChange={e=>setForm({...form,level:e.target.value})}><option>Nível 1</option><option>Nível 2</option><option>Nível 3</option><option>Gerência</option></select></label>
        <label>Sala oficial<input value={form.room} onChange={e=>setForm({...form,room:e.target.value})} placeholder="Ex.: Sala principal"/></label>
        <label>Horário de entrada<input type="time" value={form.start} onChange={e=>setForm({...form,start:e.target.value})}/></label>
        <label>Horário de saída<input type="time" value={form.end} onChange={e=>setForm({...form,end:e.target.value})}/></label>
        <label className="full-field">Visitas às salas e clãs<textarea value={form.visits} onChange={e=>setForm({...form,visits:e.target.value})} placeholder="Registre as visitas realizadas..."/></label>
        <label className="full-field">Eventos e movimentações<textarea value={form.events} onChange={e=>setForm({...form,events:e.target.value})} placeholder="Eventos acompanhados ou organizados..."/></label>
        <label className="full-field">Ocorrências<textarea value={form.occurrences} onChange={e=>setForm({...form,occurrences:e.target.value})} placeholder="Ocorrências confirmadas ou pendências..."/></label>
        <label className="full-field">Trabalho em equipe<textarea value={form.teamwork} onChange={e=>setForm({...form,teamwork:e.target.value})} placeholder="Apoio e alinhamentos realizados..."/></label>
        <label className="full-field">Sugestões e observações<textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Informações adicionais..."/></label>
      </div><div className="modal-footer"><span>Campos com dados ausentes não serão inventados.</span><button className="button button-secondary" onClick={()=>setShowForm(false)}>Cancelar</button><button className="button button-primary" onClick={saveReport}><Check size={16}/> Enviar relatório</button></div></section></div>}

      {selected && <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setSelected(null)}}><section className="modal detail-modal"><div className="modal-heading"><div><span className="eyebrow">{selected.id}</span><h2>{selected.adm}</h2><p>{selected.date} · {selected.shift} · {selected.level}</p></div><button className="icon-button" onClick={()=>setSelected(null)} aria-label="Fechar"><X size={19}/></button></div><StatusBadge status={selected.status}/><div className="detail-grid">{[["Horário",`${selected.start} – ${selected.end}`],["Sala oficial",selected.room],["Visitas às salas e clãs",selected.visits],["Eventos e movimentações",selected.events],["Ocorrências",selected.occurrences],["Trabalho em equipe",selected.teamwork],["Observações",selected.notes]].map(([k,v])=><div className="detail-field" key={k}><span>{k}</span><p>{v}</p></div>)}</div>{role==="master"&&<div className="review-actions"><span>Revisão do Master</span><div><button className="button button-secondary" onClick={()=>changeStatus(selected.id,"Em análise")}>Em análise</button><button className="button button-primary" onClick={()=>changeStatus(selected.id,"Aprovado")}><Check size={15}/> Aprovar</button></div></div>}</section></div>}
    </div>
  );
}

function StatCard({label,value,detail,icon,tone,trend}:{label:string;value:string;detail:string;icon:React.ReactNode;tone:string;trend:"up"|"down"}) {
  return <div className="stat-card"><div className="stat-top"><span>{label}</span><div className={`stat-icon ${tone}`}>{icon}</div></div><div className="stat-value">{value}</div><div className="stat-detail"><span className={trend==="up"?"trend-up":"trend-down"}>{trend==="up"?<ArrowUpRight size={14}/>:<ArrowDownRight size={14}/>}</span>{detail}</div></div>;
}

function StatusBadge({status}:{status:Report["status"]}) {
  const cls = status === "Aprovado" ? "approved" : status === "Em análise" ? "review" : "submitted";
  return <span className={`status-badge ${cls}`}><i/>{status}</span>;
}

export default App;