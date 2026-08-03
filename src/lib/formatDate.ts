/**
 * Padrão de datas do Barbear.IA (todos os perfis):
 * - Exibição: DD/MM/YYYY
 * - Data+hora: DD/MM/YYYY HH:mm
 * - Valores de formulário/API: YYYY-MM-DD (ISO local, sem deslocar fuso)
 */

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Converte string/Date para DD/MM/YYYY.
 * Strings `YYYY-MM-DD` (com ou sem hora) são parseadas sem deslocar fuso.
 */
export function formatDateDDMMYYYY(input: string | Date | null | undefined): string {
  if (input == null || input === '') return '';

  if (typeof input === 'string') {
    const isoDate = input.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoDate) {
      return `${isoDate[3]}/${isoDate[2]}/${isoDate[1]}`;
    }
    const brDate = input.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
    if (brDate) return `${brDate[1]}/${brDate[2]}/${brDate[3]}`;
  }

  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return String(input);

  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** Alias canônico — use em qualquer tela/perfil. */
export const formatDate = formatDateDDMMYYYY;

/** DD/MM/YYYY HH:mm */
export function formatDateTimeDDMMYYYY(input: string | Date | null | undefined): string {
  if (input == null || input === '') return '';

  if (typeof input === 'string') {
    const iso = input.match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})/);
    if (iso) {
      return `${iso[3]}/${iso[2]}/${iso[1]} ${iso[4]}:${iso[5]}`;
    }
  }

  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return formatDateDDMMYYYY(input);

  return `${formatDateDDMMYYYY(d)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/** Alias canônico para data+hora. */
export const formatDateTime = formatDateTimeDDMMYYYY;

/** YYYY-MM-DD no calendário local (evita bug de UTC em toISOString). */
export function toIsoDateLocal(input: Date | string | null | undefined = new Date()): string {
  if (input == null || input === '') return '';

  if (typeof input === 'string') {
    const isoDate = input.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoDate) return `${isoDate[1]}-${isoDate[2]}-${isoDate[3]}`;
    const brDate = input.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
    if (brDate) return `${brDate[3]}-${brDate[2]}-${brDate[1]}`;
  }

  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return '';

  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
