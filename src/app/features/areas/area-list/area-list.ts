import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { AreaService } from '../../../services/area.service';
import { Area } from '../../../models/area.model';
import { mensagemDeErro } from '../../../shared/erro';
import { AreaDeleteDialog } from '../area-delete-dialog/area-delete-dialog';
import { contemTexto } from '../../../shared/busca';
import { lerBuscaUrl, lerFiltroBooleanoUrl } from '../../../shared/filtros-url';

type Visao = 'cards' | 'tabela';
const VISAO_KEY = 'areas:visao';

@Component({
  selector: 'app-area-list',
  imports: [
    RouterLink,
    MatTableModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './area-list.html',
  styleUrl: './area-list.scss',
})
export class AreaList implements OnInit {
  private readonly service = inject(AreaService);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly areas = signal<Area[]>([]);
  readonly carregando = signal(false);
  readonly visao = signal<Visao>(this.lerVisaoSalva());
  readonly termo = signal(lerBuscaUrl(this.route));
  readonly colunas = ['area', 'descricao', 'voluntarios', 'acoes'];

  readonly filtroComVoluntarios = signal<boolean[]>(
    lerFiltroBooleanoUrl(this.route, 'comVoluntarios'),
  );

  readonly total = computed(() => this.areas().length);
  readonly totalSemVoluntarios = computed(
    () => this.areas().filter((a) => a.voluntarios.length === 0).length,
  );
  readonly filtrosAtivos = computed(() => this.filtroComVoluntarios().length > 0);
  readonly itensFiltrados = computed(() => {
    const comVoluntarios = this.filtroComVoluntarios();
    return this.areas().filter(
      (a) =>
        this.corresponde(a, this.termo()) &&
        (comVoluntarios.length === 0 || comVoluntarios.includes(a.voluntarios.length > 0)),
    );
  });
  readonly totalFiltrado = computed(() => this.itensFiltrados().length);

  ngOnInit(): void {
    this.carregar();
  }

  definirVisao(v: Visao): void {
    this.visao.set(v);
    localStorage.setItem(VISAO_KEY, v);
  }

  limparFiltros(): void {
    this.filtroComVoluntarios.set([]);
  }

  private lerVisaoSalva(): Visao {
    return localStorage.getItem(VISAO_KEY) === 'tabela' ? 'tabela' : 'cards';
  }

  /** Inicial do nome da área para o avatar. */
  inicial(area: Area): string {
    return area.nome?.trim().charAt(0).toUpperCase() || '?';
  }

  qtdVoluntarios(area: Area): string {
    const n = area.voluntarios.length;
    return n === 1 ? '1 voluntário' : `${n} voluntários`;
  }

  private corresponde(area: Area, termo: string): boolean {
    return (
      contemTexto(area.nome, termo) ||
      contemTexto(area.descricao, termo) ||
      contemTexto(area.observacao, termo) ||
      area.voluntarios.some((v) => contemTexto(v.nome, termo))
    );
  }

  carregar(): void {
    this.carregando.set(true);
    this.service.listar().subscribe({
      next: (dados) => {
        this.areas.set(dados);
        this.carregando.set(false);
      },
      error: (err) => {
        this.carregando.set(false);
        this.notificar(mensagemDeErro(err));
      },
    });
  }

  confirmarExclusao(area: Area): void {
    const ref = this.dialog.open(AreaDeleteDialog, {
      data: { nome: area.nome, qtdVoluntarios: area.voluntarios.length },
      width: '420px',
    });
    ref.afterClosed().subscribe((confirmado) => {
      if (confirmado) this.excluir(area);
    });
  }

  private excluir(area: Area): void {
    this.service.excluir(area.id).subscribe({
      next: () => {
        this.notificar(`"${area.nome}" foi excluída.`);
        this.carregar();
      },
      error: (err) => this.notificar(mensagemDeErro(err)),
    });
  }

  private notificar(mensagem: string): void {
    this.snackBar.open(mensagem, 'Fechar', { duration: 5000 });
  }
}
