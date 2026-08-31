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

import { AdotanteService } from '../../../services/adotante.service';
import { Adotante } from '../../../models/adotante.model';
import { mensagemDeErro } from '../../../shared/erro';
import { AdotanteDeleteDialog } from '../adotante-delete-dialog/adotante-delete-dialog';
import { formatarCpf, formatarTelefone } from '../../../shared/mascara';
import { contemTexto } from '../../../shared/busca';

type Visao = 'cards' | 'tabela';
const VISAO_KEY = 'adotantes:visao';

@Component({
  selector: 'app-adotante-list',
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
  ],
  templateUrl: './adotante-list.html',
  styleUrl: './adotante-list.scss',
})
export class AdotanteList implements OnInit {
  private readonly service = inject(AdotanteService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly adotantes = signal<Adotante[]>([]);
  readonly carregando = signal(false);
  readonly visao = signal<Visao>(this.lerVisaoSalva());
  readonly termo = signal('');
  readonly colunas = ['adotante', 'documento', 'cidade', 'contato', 'acoes'];

  readonly total = computed(() => this.adotantes().length);
  readonly itensFiltrados = computed(() =>
    this.adotantes().filter((a) => this.corresponde(a, this.termo())),
  );
  readonly totalFiltrado = computed(() => this.itensFiltrados().length);

  ngOnInit(): void {
    this.carregar();
  }

  definirVisao(v: Visao): void {
    this.visao.set(v);
    localStorage.setItem(VISAO_KEY, v);
  }

  private lerVisaoSalva(): Visao {
    return localStorage.getItem(VISAO_KEY) === 'tabela' ? 'tabela' : 'cards';
  }

  cpf(adotante: Adotante): string {
    return adotante.documento?.cpf ? formatarCpf(adotante.documento.cpf) : '—';
  }

  cidade(adotante: Adotante): string {
    const e = adotante.endereco;
    if (!e?.cidade) return '—';
    return e.estado ? `${e.cidade}/${e.estado}` : e.cidade;
  }

  telefone(adotante: Adotante): string {
    return adotante.contato?.telefonePrincipal
      ? formatarTelefone(adotante.contato.telefonePrincipal)
      : '—';
  }

  /** Inicial do nome do adotante para o avatar. */
  inicial(adotante: Adotante): string {
    return adotante.nome?.trim().charAt(0).toUpperCase() || '?';
  }

  private corresponde(adotante: Adotante, termo: string): boolean {
    return (
      contemTexto(adotante.nome, termo) ||
      contemTexto(this.cpf(adotante), termo) ||
      contemTexto(this.cidade(adotante), termo)
    );
  }

  carregar(): void {
    this.carregando.set(true);
    this.service.listar().subscribe({
      next: (dados) => {
        this.adotantes.set(dados);
        this.carregando.set(false);
      },
      error: (err) => {
        this.carregando.set(false);
        this.notificar(mensagemDeErro(err));
      },
    });
  }

  confirmarExclusao(adotante: Adotante): void {
    const ref = this.dialog.open(AdotanteDeleteDialog, {
      data: { nome: adotante.nome },
      width: '420px',
    });
    ref.afterClosed().subscribe((confirmado) => {
      if (confirmado) this.excluir(adotante);
    });
  }

  private excluir(adotante: Adotante): void {
    this.service.excluir(adotante.id!).subscribe({
      next: () => {
        this.notificar(`"${adotante.nome}" foi excluído.`);
        this.carregar();
      },
      error: (err) => this.notificar(mensagemDeErro(err)),
    });
  }

  private notificar(mensagem: string): void {
    this.snackBar.open(mensagem, 'Fechar', { duration: 5000 });
  }
}
