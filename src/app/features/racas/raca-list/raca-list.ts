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

import { RacaService } from '../../../services/raca.service';
import { Raca } from '../../../models/raca.model';
import { AnimalEspecie, ANIMAL_ESPECIES, ESPECIE_LABELS } from '../../../models/enums';
import { mensagemDeErro } from '../../../shared/erro';
import { RacaDeleteDialog } from '../raca-delete-dialog/raca-delete-dialog';
import { contemTexto } from '../../../shared/busca';

type Visao = 'cards' | 'tabela';
const VISAO_KEY = 'racas:visao';

@Component({
  selector: 'app-raca-list',
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
  templateUrl: './raca-list.html',
  styleUrl: './raca-list.scss',
})
export class RacaList implements OnInit {
  private readonly service = inject(RacaService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly racas = signal<Raca[]>([]);
  readonly carregando = signal(false);
  readonly visao = signal<Visao>(this.lerVisaoSalva());
  readonly termo = signal('');
  readonly colunas = ['raca', 'especie', 'acoes'];

  readonly opcoesEspecie = ANIMAL_ESPECIES;
  readonly filtroEspecie = signal<AnimalEspecie[]>([]);

  readonly total = computed(() => this.racas().length);
  readonly filtrosAtivos = computed(() => this.filtroEspecie().length > 0);
  readonly itensFiltrados = computed(() => {
    const especies = this.filtroEspecie();
    return this.racas().filter(
      (r) =>
        this.corresponde(r, this.termo()) &&
        (especies.length === 0 || (!!r.especie?.nome && especies.includes(r.especie.nome))),
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
    this.filtroEspecie.set([]);
  }

  private lerVisaoSalva(): Visao {
    return localStorage.getItem(VISAO_KEY) === 'tabela' ? 'tabela' : 'cards';
  }

  especie(raca: Raca): string {
    const nome = raca.especie?.nome;
    return nome ? ESPECIE_LABELS[nome] : '—';
  }

  /** Inicial do nome da raça para o avatar. */
  inicial(raca: Raca): string {
    return raca.nome?.trim().charAt(0).toUpperCase() || '?';
  }

  private corresponde(raca: Raca, termo: string): boolean {
    return contemTexto(raca.nome, termo) || contemTexto(this.especie(raca), termo);
  }

  carregar(): void {
    this.carregando.set(true);
    this.service.listar().subscribe({
      next: (dados) => {
        this.racas.set(dados);
        this.carregando.set(false);
      },
      error: (err) => {
        this.carregando.set(false);
        this.notificar(mensagemDeErro(err));
      },
    });
  }

  confirmarExclusao(raca: Raca): void {
    const ref = this.dialog.open(RacaDeleteDialog, {
      data: { nome: raca.nome },
      width: '420px',
    });
    ref.afterClosed().subscribe((confirmado) => {
      if (confirmado) this.excluir(raca);
    });
  }

  private excluir(raca: Raca): void {
    this.service.excluir(raca.id).subscribe({
      next: () => {
        this.notificar(`"${raca.nome}" foi excluída.`);
        this.carregar();
      },
      error: (err) => this.notificar(mensagemDeErro(err)),
    });
  }

  private notificar(mensagem: string): void {
    this.snackBar.open(mensagem, 'Fechar', { duration: 5000 });
  }
}
