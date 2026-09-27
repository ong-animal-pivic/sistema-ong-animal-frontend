import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  ActivatedRouteSnapshot,
  NavigationEnd,
  Router,
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { filter, map } from 'rxjs';

import { DadosRotaModulo, MODULOS, MODULOS_MENU, Modulo } from './shared/modulos';

interface Contexto {
  modulo: Modulo;
  pagina?: DadosRotaModulo['pagina'];
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly router = inject(Router);

  protected readonly title = 'Sistema ONG Animal';
  protected readonly menu = MODULOS_MENU;
  protected readonly inicio = MODULOS.inicio;

  /** Módulo e página da rota ativa — definem cor, ícone e trilha do shell. */
  protected readonly contexto = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.lerContexto(this.router.routerState.snapshot.root)),
    ),
    { initialValue: { modulo: MODULOS.inicio } as Contexto },
  );

  private lerContexto(rota: ActivatedRouteSnapshot): Contexto {
    while (rota.firstChild) rota = rota.firstChild;
    const dados = rota.data as Partial<DadosRotaModulo>;
    return {
      modulo: MODULOS[dados.modulo ?? 'inicio'],
      pagina: dados.pagina,
    };
  }
}
