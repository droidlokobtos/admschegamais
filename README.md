# ADM Chega Mais Games

Aplicação web em desenvolvimento para registro, revisão e consolidação de relatórios administrativos da equipe.

## Aplicação web

- Front-end inicial em React + TypeScript + Vite.
- Área visual de ADM Master para consultar relatórios, revisar status e ver o relatório consolidado.
- Formulário inicial de relatório individual com data, turno, nível, horários, sala oficial, visitas, eventos, ocorrências, trabalho em equipe e observações.
- Alternância de visualização entre Master e ADM disponível apenas como demonstração visual.
- **Importante:** nesta etapa, os registros são mantidos apenas no estado da página. Autenticação individual, banco de dados persistente, permissões reais, exportação e consolidação de dados de produção ainda precisam ser implementados.

Repositório de referência para os procedimentos administrativos da equipe Chega Mais Games.

## Objetivo

Manter regras, fluxos de trabalho, modelos e regulamentos organizados para apoiar a rotina da equipe. Este repositório registra os procedimentos acordados; ele não substitui a decisão final da liderança.

## Responsabilidades e fluxo de RH

### ADM Paçoca — liderança

- Lidera a equipe de ADMs.
- Mantém a decisão final sobre as ocorrências e encaminhamentos.

### RH — comando `/rh`

- Confere as presenças e os horários informados pelos ADMs, usando os dados enviados junto aos relatórios.
- Identifica faltas, horários ausentes e divergências entre os dados.
- Registra somente o que os dados permitem confirmar; não presume motivos ou justificativas.
- Encaminha as ocorrências identificadas à gerente de avisos, Júlia (`/Ju`).
- Produz relatórios diários limpos, simplificados e resumidos, conforme o modelo vigente.

### Júlia — comando `/Ju`

- Recebe as ocorrências verificadas pelo RH.
- Redige o aviso formal para que a liderança possa copiar e enviar.
- Não substitui a conferência dos dados feita pelo RH nem a decisão final da liderança.

### Fluxo resumido

1. Receber os relatórios e os horários informados.
2. Conferir presença e horários com base nos dados disponíveis.
3. Separar fatos confirmados de dados ausentes ou divergentes.
4. Preparar um resumo diário objetivo.
5. Encaminhar as ocorrências à Júlia (`/Ju`).
6. A liderança revisa e decide o encaminhamento final.

## Padrão dos relatórios

- Ser claro, curto e organizado.
- Informar somente ocorrências relevantes.
- Diferenciar falta confirmada, horário divergente e informação não fornecida.
- Não inventar horários, presenças, justificativas ou causas.
- Deixar a redação do comunicado formal para Júlia (`/Ju`).

## Eventos e regulamentos

Regulamentos de eventos devem documentar, quando aplicável:

- nome e objetivo da dinâmica;
- organização e condução;
- regras de participação;
- pontuação e critério de vitória;
- penalidades, desempates e duração;
- premiações;
- data e horário;
- procedimento para dúvidas ou casos não previstos.

Cada evento deve manter seu próprio regulamento para evitar misturar regras de dinâmicas diferentes.

## Permissões de Admin Master

Estas regras foram definidas pela liderança e devem ser aplicadas na implementação de autenticação e autorização:

- Um Admin Master pode promover um ADM comum para Admin Master.
- Somente o ADM Paçoca pode desligar, remover ou revogar o nível Admin Master de outro usuário que já seja Admin Master.
- Outros Admin Masters não podem remover, rebaixar ou revogar o acesso Master de Paçoca nem de qualquer outro Admin Master.
- A promoção de um ADM não concede a ele o privilégio exclusivo de desligar outros Admin Masters.
- O sistema deve identificar Paçoca por um identificador de usuário estável e protegido no servidor; não basta comparar o nome exibido na interface.
- As verificações devem ser feitas no backend/banco de dados para impedir que chamadas diretas à API contornem a interface.
- Toda promoção ou tentativa de remover/rebaixar um Admin Master deve gerar registro de auditoria com autor, alvo, data/hora e resultado.

**Estado atual:** a regra de proteção contra rebaixamento/desligamento de Admin Masters foi aplicada no banco Supabase `Chega Mais Games` por meio do trigger `protect_admin_master_account_changes`, e a migration correspondente foi versionada neste repositório. A promoção continua permitida aos Admin Masters conforme as permissões existentes. O teste funcional com sessões de usuários diferentes e a trilha de auditoria de alterações ainda precisam ser concluídos.

## Como manter este repositório

- Atualizar a documentação quando uma regra for confirmada ou alterada pela liderança.
- Registrar mudanças com mensagens de commit descritivas.
- Não incluir senhas, tokens, dados pessoais desnecessários ou informações privadas dos membros.
- Tratar os documentos como referência operacional, não como autorização automática para aplicar punições ou enviar comunicados.

## Limite da integração com o ChatGPT

Este repositório pode guardar o contexto operacional e os documentos produzidos. Isso não significa que todas as conversas futuras serão sincronizadas automaticamente com o GitHub. Novas decisões e alterações precisam ser solicitadas ou registradas explicitamente para que a documentação seja atualizada.
