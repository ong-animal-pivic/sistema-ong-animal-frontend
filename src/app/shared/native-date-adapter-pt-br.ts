import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';

const DATA_DIGITADA_REGEX = /^\s*(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{2,4})\s*$/;

/**
 * O `NativeDateAdapter` padrão delega o parsing de texto digitado para `Date.parse`,
 * que interpreta datas ambíguas como MM/DD/YYYY (formato americano) em vez de
 * DD/MM/YYYY (pt-BR), rejeitando ou invertendo dia/mês. Este adapter corrige apenas
 * o parsing de strings digitadas, mantendo o restante do comportamento nativo.
 */
@Injectable()
export class NativeDateAdapterPtBr extends NativeDateAdapter {
  override parse(value: unknown, parseFormat?: unknown): Date | null {
    if (typeof value !== 'string') {
      return super.parse(value, parseFormat);
    }

    const match = DATA_DIGITADA_REGEX.exec(value);
    if (!match) {
      return super.parse(value, parseFormat);
    }

    const dia = Number(match[1]);
    const mes = Number(match[2]);
    let ano = Number(match[3]);
    if (match[3].length === 2) {
      ano += ano < 50 ? 2000 : 1900;
    }

    if (mes < 1 || mes > 12 || dia < 1 || dia > 31) {
      return new Date(NaN);
    }

    const data = new Date(ano, mes - 1, dia);
    if (data.getFullYear() !== ano || data.getMonth() !== mes - 1 || data.getDate() !== dia) {
      return new Date(NaN);
    }

    return data;
  }
}
