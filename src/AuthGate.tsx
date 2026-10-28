import { useEffect, useState } from "react";
import App from "./App";
import { supabase } from "./lib/supabase";

export type UserProfile = {
  id: string;
  username: string | null;
  display_name: string | null;
  role: "admin_master" | "adm";
  is_active: boolean;
};

export default function AuthGate() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadProfile() {
    if (!supabase) { setLoading(false); return; }
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) { setProfile(null); setLoading(false); return; }
    const { data, error: profileError } = await supabase
      .from("profiles").select("id, username, display_name, role, is_active")
      .eq("id", sessionData.session.user.id).maybeSingle();
    if (profileError || !data || !data.is_active) {
      await supabase.auth.signOut();
      setProfile(null);
      setError(profileError?.message || "Sua conta está inativa ou não possui perfil autorizado.");
    } else {
      setProfile(data as UserProfile);
      setError("");
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    void loadProfile();
    const { data: listener } = supabase.auth.onAuthStateChange(() => { void loadProfile(); });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true); setError("");
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (signInError) { setError("Não foi possível entrar. Confira o e-mail e a senha."); setBusy(false); return; }
    await loadProfile();
    setBusy(false);
  }

  async function signOut() {
    if (supabase) await supabase.auth.signOut();
    setProfile(null);
  }

  if (loading) return <div className="auth-screen"><div className="auth-card">Verificando sessão segura…</div></div>;
  if (!supabase) return <div className="auth-screen"><div className="auth-card"><div className="brand-mark">CM</div><h1>Configuração necessária</h1><p>Configure <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> nas variáveis de ambiente do deploy para ativar o login.</p></div></div>;
  if (!profile) return <div className="auth-screen"><form className="auth-card" onSubmit={signIn}><div className="brand-mark">CM</div><span className="eyebrow">CHEGA MAIS GAMES</span><h1>Acesso administrativo</h1><p>Entre com as credenciais da sua conta autorizada.</p><label>E-mail<input type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="Seu e-mail de acesso"/></label><label>Senha<input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Sua senha"/></label>{error&&<p className="auth-error">{error}</p>}<button className="button button-primary" type="submit" disabled={busy}>{busy?"Entrando…":"Entrar"}</button></form></div>;
  return <App profile={profile} onSignOut={signOut} />;
}
