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

import { VoluntarioService } from '../../../services/voluntario.service';
import { AreaService } from '../../../services/area.service';
import { Area } from '../../../models/area.model';
import { Voluntario } from '../../../models/voluntario.model';
import { FrequenciaVoluntario, FREQUENCIAS, FREQUENCIA_LABELS } from '../../../models/enums';
import { mensagemDeErro } from '../../../shared/erro';
import { formatarCpf, formatarTelefone } from '../../../shared/mascara';
import { VoluntarioDeleteDialog } from '../voluntario-delete-dialog/voluntario-delete-dialog';
import { contemTexto } from '../../../shared/busca';
import { lerBuscaUrl, lerFiltroIdsUrl, lerFiltroUrl } from '../../../shared/filtros-url';

type Visao = 'cards' | 'tabela';
const VISAO_KEY = 'voluntarios:visao';
/** Opção "Sem área" do filtro de áreas (ids do banco começam em 1). */
const SEM_AREA = 0;

@Component({
  selector: 'app-voluntario-list',
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
  templateUrl: './voluntario-list.html',
  styleUrl: './voluntario-list.scss',
})
export class VoluntarioList implements OnInit {
  private readonly service = inject(VoluntarioService);
  private readonly areaService = inject(AreaService);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly voluntarios = signal<Voluntario[]>([]);
  /** A resposta de voluntários não traz áreas; o vínculo vem de GET /areas. */
  readonly areas = signal<Area[]>([]);
  readonly carregando = signal(false);
  readonly visao = signal<Visao>(this.lerVisaoSalva());
  readonly termo = signal(lerBuscaUrl(this.route));
  readonly colunas = [
    'voluntario',
    'documento',
    'frequencia',
    'areas',
    'telefone',
    'responsavel',
    'acoes',
  ];

  readonly frequenciaLabels = FREQUENCIA_LABELS;
  readonly opcoesFrequencia = FREQUENCIAS;
  readonly filtroFrequencia = signal<FrequenciaVoluntario[]>(
    lerFiltroUrl(this.route, 'frequencia', FREQUENCIAS),
  );

  readonly semArea = SEM_AREA;
  readonly filtroArea = signal<number[]>(lerFiltroIdsUrl(this.route, 'area'));

  readonly areasPorVoluntario = computed(() => {
    const mapa = new Map<number, Area[]>();
    for (const area of this.areas()) {
      for (const v of area.voluntarios) {
        mapa.set(v.id, [...(mapa.get(v.id) ?? []), area]);
      }
    }
    return mapa;
  });

  readonly total = computed(() => this.voluntarios().length);
  readonly filtrosAtivos = computed(
    () => this.filtroFrequencia().length > 0 || this.filtroArea().length > 0,
  );
  readonly itensFiltrados = computed(() => {
    const frequencias = this.filtroFrequencia();
    const areas = this.filtroArea();
    return this.voluntarios().filter(
      (v) =>
        this.corresponde(v, this.termo()) &&
        (frequencias.length === 0 || frequencias.includes(v.frequencia)) &&
        (areas.length === 0 || this.atendeFiltroArea(v, areas)),
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
    this.filtroFrequencia.set([]);
    this.filtroArea.set([]);
  }

  areasDe(voluntario: Voluntario): Area[] {
    return this.areasPorVoluntario().get(voluntario.id!) ?? [];
  }

  nomesAreas(voluntario: Voluntario): string {
    return (
      this.areasDe(voluntario)
        .map((a) => a.nome)
        .join(', ') || 'Sem área'
    );
  }

  /** Regra OU: está em alguma das áreas marcadas, ou não tem área e "Sem área" está marcada. */
  private atendeFiltroArea(voluntario: Voluntario, selecionadas: number[]): boolean {
    const areas = this.areasDe(voluntario);
    if (areas.length === 0) return selecionadas.includes(SEM_AREA);
    return areas.some((a) => selecionadas.includes(a.id));
  }

  private lerVisaoSalva(): Visao {
    return localStorage.getItem(VISAO_KEY) === 'tabela' ? 'tabela' : 'cards';
  }

  frequencia(voluntario: Voluntario): string {
    return this.frequenciaLabels[voluntario.frequencia] ?? voluntario.frequencia;
  }

  documento(voluntario: Voluntario): string {
    return voluntario.documento?.cpf ? formatarCpf(voluntario.documento.cpf) : '—';
  }

  telefone(voluntario: Voluntario): string {
    return voluntario.contato?.telefonePrincipal
      ? formatarTelefone(voluntario.contato.telefonePrincipal)
      : '—';
  }

  /** Inicial do nome do voluntário para o avatar. */
  inicial(voluntario: Voluntario): string {
    return voluntario.nome?.trim().charAt(0).toUpperCase() || '?';
  }

  private corresponde(voluntario: Voluntario, termo: string): boolean {
    return (
      contemTexto(voluntario.nome, termo) ||
      contemTexto(this.documento(voluntario), termo) ||
      contemTexto(voluntario.responsavel?.nome, termo) ||
      this.areasDe(voluntario).some((a) => contemTexto(a.nome, termo))
    );
  }

  carregar(): void {
    this.carregando.set(true);
    this.service.listar().subscribe({
      next: (dados) => {
        this.voluntarios.set(dados);
        this.carregando.set(false);
      },
      error: (err) => {
        this.carregando.set(false);
        this.notificar(mensagemDeErro(err));
      },
    });
    // Assinatura separada: se as áreas falharem, a lista de voluntários segue funcionando.
    this.areaService.listar().subscribe({
      next: (dados) => this.areas.set(dados),
      error: (err) => this.notificar(mensagemDeErro(err)),
    });
  }

  confirmarExclusao(voluntario: Voluntario): void {
    const ref = this.dialog.open(VoluntarioDeleteDialog, {
      data: { nome: voluntario.nome },
      width: '420px',
    });
    ref.afterClosed().subscribe((confirmado) => {
      if (confirmado) this.excluir(voluntario);
    });
  }

  private excluir(voluntario: Voluntario): void {
    this.service.excluir(voluntario.id!).subscribe({
      next: () => {
        this.notificar(`"${voluntario.nome}" foi excluído.`);
        this.carregar();
      },
      error: (err) => this.notificar(mensagemDeErro(err)),
    });
  }

  private notificar(mensagem: string): void {
    this.snackBar.open(mensagem, 'Fechar', { duration: 5000 });
  }
}
