import { ActivatedRoute } from '@angular/router';
import { Opcao } from '../models/enums';

// Filtros das listas podem vir pré-aplicados pela URL (ex.: atalhos da tela
// inicial: `/animais?status=EM_TRATAMENTO,QUARENTENA`). A URL só semeia o
// estado inicial; depois disso os signals de filtro são a fonte da verdade.

function valoresDaUrl(route: ActivatedRoute, chave: string): string[] {
  const bruto = route.snapshot.queryParamMap.get(chave);
  return bruto ? bruto.split(',').map((v) => v.trim()).filter(Boolean) : [];
}

/** Texto de busca pré-preenchido (`?busca=Rex`), vindo da busca da tela inicial. */
export function lerBuscaUrl(route: ActivatedRoute): string {
  return route.snapshot.queryParamMap.get('busca')?.trim() ?? '';
}

/** Lê um query param "A,B,C" e devolve só os valores presentes em `opcoes`. */
export function lerFiltroUrl<T extends string>(
  route: ActivatedRoute,
  chave: string,
  opcoes: readonly Opcao<T>[],
): T[] {
  const validos = new Set<string>(opcoes.map((o) => o.value));
  return valoresDaUrl(route, chave).filter((v): v is T => validos.has(v));
}

/** Lê um query param booleano ("true", "false" ou "true,false"). */
export function lerFiltroBooleanoUrl(route: ActivatedRoute, chave: string): boolean[] {
  return valoresDaUrl(route, chave)
    .filter((v) => v === 'true' || v === 'false')
    .map((v) => v === 'true');
}
