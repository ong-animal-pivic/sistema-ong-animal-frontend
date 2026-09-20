import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
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
import { Voluntario } from '../../../models/voluntario.model';
import { FrequenciaVoluntario, FREQUENCIAS, FREQUENCIA_LABELS } from '../../../models/enums';
import { mensagemDeErro } from '../../../shared/erro';
import { formatarCpf, formatarTelefone } from '../../../shared/mascara';
import { VoluntarioDeleteDialog } from '../voluntario-delete-dialog/voluntario-delete-dialog';
import { contemTexto } from '../../../shared/busca';

type Visao = 'cards' | 'tabela';
const VISAO_KEY = 'voluntarios:visao';

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
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly voluntarios = signal<Voluntario[]>([]);
  readonly carregando = signal(false);
  readonly visao = signal<Visao>(this.lerVisaoSalva());
  readonly termo = signal('');
  readonly colunas = ['voluntario', 'documento', 'frequencia', 'telefone', 'responsavel', 'acoes'];

  readonly frequenciaLabels = FREQUENCIA_LABELS;
  readonly opcoesFrequencia = FREQUENCIAS;
  readonly filtroFrequencia = signal<FrequenciaVoluntario[]>([]);

  readonly total = computed(() => this.voluntarios().length);
  readonly filtrosAtivos = computed(() => this.filtroFrequencia().length > 0);
  readonly itensFiltrados = computed(() => {
    const frequencias = this.filtroFrequencia();
    return this.voluntarios().filter(
      (v) =>
        this.corresponde(v, this.termo()) &&
        (frequencias.length === 0 || frequencias.includes(v.frequencia)),
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
      contemTexto(voluntario.responsavel?.nome, termo)
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
