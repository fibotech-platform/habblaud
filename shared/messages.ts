// Mensagens pelo escritório (POST /api/messages): o que o servidor, o demo e a página têm em comum.
// Código puro: sem APIs de Node nem de DOM.
import { maskSecrets, truncate, type ActivityDescription } from './activity';
import { tr } from './i18n';

/** Tamanho máximo de uma mensagem (caracteres). */
export const MESSAGE_MAX = 20_000;
/** `Activity.tool` da atividade "Mensagem pelo Habblaud" (não é uma ferramenta do agente: é o seu texto entrando). */
export const MESSAGE_TOOL = 'HabblaudMessage';
/** Detalhe da atividade: o começo do texto, mascarado e cortado (o texto inteiro vai só para a sessão). */
const DETAIL_MAX = 300;

/**
 * Atividade "Mensagem pelo Habblaud" de uma mensagem entregue à sessão (entrou nela ou na fila dela: não quer dizer
 * que o agente já leu). `from` = nome do agente que mandou (declarado por ele, não verificado): "Mensagem de Bruno".
 */
export function describeMessage(text: string, from?: string): ActivityDescription & { tool: string } {
  const detail = truncate(maskSecrets(text.slice(0, DETAIL_MAX * 4)), DETAIL_MAX);
  const title = from ? tr('Mensagem de {0}', [from]) : tr('Mensagem pelo Habblaud');
  return { kind: 'communicate', icon: '✉️', text: title, tool: MESSAGE_TOOL, ...(detail ? { detail } : {}) };
}

/**
 * Cabeçalho do texto entregue quando a mensagem vem de outro agente: quem recebe sabe que não foi você que digitou.
 * O remetente é declarado por quem mandou (o Habblaud não tem como verificar).
 */
export function senderHeader(name: string, provider: string | undefined): string {
  return tr('[Mensagem de {0} ({1}), outro agente do Habblaud — remetente declarado, não verificado]', [name, provider === 'codex' ? 'Codex' : 'Claude Code']);
}
