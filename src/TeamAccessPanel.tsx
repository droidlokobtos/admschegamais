import { useCallback, useEffect, useState } from "react";
import { RefreshCw, ShieldCheck, Users } from "lucide-react";
import { supabase } from "./lib/supabase";
import type { UserProfile } from "./AuthGate";

type Member = { id: string; username: string | null; display_name: string | null; role: "admin_master" | "adm"; is_active: boolean };
export function TeamAccessPanel({ profile, onNotice }: { profile: UserProfile; onNotice: (message: string) => void }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true); setError("");
    const { data, error: queryError } = await supabase.from("profiles")
      .select("id, username, display_name, role, is_active")
      .order("display_name", { ascending: true });
    if (queryError) setError("Não foi possível carregar a equipe. Confira as permissões de leitura no Supabase.");
    else setMembers((data || []) as Member[]);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function performAction(member: Member, action: "promote" | "demote" | "deactivate") {
    if (!supabase) return;
    const verb = action === "promote" ? "promover" : action === "demote" ? "rebaixar" : "desligar";
    if (!window.confirm("Confirma " + verb + " " + (member.display_name || member.username || "esta conta") + "?")) return;
    setBusyId(member.id); setError("");
    const { data, error: invokeError } = await supabase.functions.invoke("manage-admin-role", {
      body: { targetId: member.id, action },
    });
    if (invokeError || data?.error) {
      setError(data?.error || "A operação falhou. Verifique sua sessão e as permissões.");
    } else {
      onNotice(action === "promote" ? "ADM promovido a Admin Master." : action === "demote" ? "Admin Master rebaixado para ADM. O histórico foi preservado." : "Conta desligada. O histórico foi preservado.");
      await load();
    }
    setBusyId("");
  }

  const isPacoca = profile.id === "550e96d4-a39d-43d9-b35a-0c4774d4f1b3";
  return <section className="panel"><div className="panel-heading"><div><h2>Equipe administrativa</h2><p>Contas reais do Supabase e ações validadas no servidor.</p></div><button className="button button-secondary button-small" onClick={()=>void load()} disabled={loading}><RefreshCw size={15}/> Atualizar</button></div>
    {!isPacoca && <p className="footnote"><ShieldCheck size={14}/> Você pode promover ADMs. Apenas Paçoca pode rebaixar ou desligar contas Master.</p>}
    {error && <p className="auth-error">{error}</p>}
    {loading ? <p>Carregando equipe…</p> : members.length === 0 ? <p>Nenhum perfil encontrado.</p> : <div className="team-list">{members.map(member => {
      const name = member.display_name || member.username || member.id;
      const isSelf = member.id === profile.id;
      const canDemote = isPacoca && !isSelf && member.role === "admin_master";
      const canDeactivate = isPacoca && !isSelf && member.is_active;
      const canPromote = profile.role === "admin_master" && member.role === "adm" && !isSelf && member.is_active;
      return <div className="team-row" key={member.id}><div className="team-avatar">{name.charAt(0).toUpperCase()}</div><div className="team-person"><strong>{name}{isSelf?" (você)":""}</strong><span>{member.username ? "@"+member.username+" · " : ""}{member.role==="admin_master"?"Administrador Master":"ADM"} · {member.is_active?"Ativo":"Desligado"}</span></div><span className="team-access">{member.role==="admin_master"?"Master":"ADM"}</span>
      {canPromote && <button className="button button-secondary button-small" disabled={busyId===member.id} onClick={()=>void performAction(member,"promote")}>{busyId===member.id?"Aguarde…":"Promover a Master"}</button>}
      {canDemote && <button className="button button-secondary button-small" disabled={busyId===member.id} onClick={()=>void performAction(member,"demote")}>{busyId===member.id?"Aguarde…":"Rebaixar para ADM"}</button>}
      {canDeactivate && <button className="button button-secondary button-small" disabled={busyId===member.id} onClick={()=>void performAction(member,"deactivate")}>{busyId===member.id?"Aguarde…":"Desligar conta"}</button>}
      </div>;
    })}</div>}
    <p className="footnote">Rebaixar ou desligar não apaga relatórios. A operação é registrada na auditoria administrativa.</p>
  </section>;
}
