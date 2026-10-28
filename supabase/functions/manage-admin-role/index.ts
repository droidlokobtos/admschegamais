import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PACOCA_ID = "550e96d4-a39d-43d9-b35a-0c4774d4f1b3";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function response(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return response(405, { error: "Método não permitido." });

  const authorization = req.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return response(401, { error: "Sessão autenticada obrigatória." });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !anonKey) {
    return response(500, { error: "Configuração do Supabase incompleta." });
  }

  const supabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return response(401, { error: "Sessão inválida ou expirada." });

  let body: { targetId?: string; action?: string };
  try {
    body = await req.json();
  } catch {
    return response(400, { error: "Corpo JSON inválido." });
  }
  const targetId = body.targetId;
  const action = body.action;
  if (!targetId || !["promote", "demote", "deactivate"].includes(action ?? "")) {
    return response(400, { error: "Informe targetId e uma ação válida." });
  }
  if (targetId === userData.user.id && action !== "promote") {
    return response(403, { error: "Não é permitido alterar o próprio acesso por esta ação." });
  }

  const { data: actor, error: actorError } = await supabase
    .from("profiles").select("id, role, is_active").eq("id", userData.user.id).maybeSingle();
  if (actorError || !actor || actor.is_active !== true || actor.role !== "admin_master") {
    return response(403, { error: "Apenas um Admin Master ativo pode gerenciar acessos." });
  }

  const { data: target, error: targetError } = await supabase
    .from("profiles").select("id, role, is_active").eq("id", targetId).maybeSingle();
  if (targetError || !target) return response(404, { error: "Conta de destino não encontrada." });

  if (action === "promote") {
    if (target.role === "admin_master") return response(409, { error: "A conta já é Admin Master." });
    const { error } = await supabase.from("profiles").update({ role: "admin_master" }).eq("id", targetId);
    if (error) return response(error.code === "42501" ? 403 : 400, { error: "Não foi possível promover a conta.", detail: error.message });
    return response(200, { success: true, action, targetId });
  }

  if (target.role === "admin_master" && userData.user.id !== PACOCA_ID) {
    return response(403, { error: "Somente ADM Paçoca pode rebaixar ou desligar outro Admin Master." });
  }

  if (action === "demote") {
    if (target.role !== "admin_master") return response(409, { error: "A conta não é Admin Master." });
    const { error } = await supabase.from("profiles").update({ role: "adm" }).eq("id", targetId);
    if (error) return response(error.code === "42501" ? 403 : 400, { error: "Não foi possível rebaixar a conta.", detail: error.message });
    return response(200, { success: true, action, targetId, historyPreserved: true });
  }

  if (target.is_active === false) return response(409, { error: "A conta já está desligada." });
  const { error } = await supabase.from("profiles").update({ is_active: false }).eq("id", targetId);
  if (error) return response(error.code === "42501" ? 403 : 400, { error: "Não foi possível desligar a conta.", detail: error.message });
  return response(200, { success: true, action, targetId, historyPreserved: true });
});
