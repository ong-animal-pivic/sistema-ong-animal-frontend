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

import { ResponsavelService } from '../../../services/responsavel.service';
import { Responsavel } from '../../../models/responsavel.model';
import { TipoResponsavel, TIPOS_RESPONSAVEL, TIPO_RESPONSAVEL_LABELS } from '../../../models/enums';
import { mensagemDeErro } from '../../../shared/erro';
import { formatarCpf, formatarCnpj, formatarTelefone } from '../../../shared/mascara';
import { ResponsavelDeleteDialog } from '../responsavel-delete-dialog/responsavel-delete-dialog';
import { contemTexto } from '../../../shared/busca';

type Visao = 'cards' | 'tabela';
const VISAO_KEY = 'responsaveis:visao';

@Component({
  selector: 'app-responsavel-list',
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
  templateUrl: './responsavel-list.html',
  styleUrl: './responsavel-list.scss',
})
export class ResponsavelList implements OnInit {
  private readonly service = inject(ResponsavelService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly responsaveis = signal<Responsavel[]>([]);
  readonly carregando = signal(false);
  readonly visao = signal<Visao>(this.lerVisaoSalva());
  readonly termo = signal('');
  readonly colunas = ['responsavel', 'documento', 'tipo', 'telefone', 'animais', 'acoes'];

  readonly tipoLabels = TIPO_RESPONSAVEL_LABELS;
  readonly opcoesTipo = TIPOS_RESPONSAVEL;
  readonly filtroTipo = signal<TipoResponsavel[]>([]);

  readonly total = computed(() => this.responsaveis().length);
  readonly filtrosAtivos = computed(() => this.filtroTipo().length > 0);
  readonly itensFiltrados = computed(() => {
    const tipos = this.filtroTipo();
    return this.responsaveis().filter(
      (r) =>
        this.corresponde(r, this.termo()) &&
        (tipos.length === 0 || (!!r.tipo?.nome && tipos.includes(r.tipo.nome))),
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
    this.filtroTipo.set([]);
  }

  private lerVisaoSalva(): Visao {
    return localStorage.getItem(VISAO_KEY) === 'tabela' ? 'tabela' : 'cards';
  }

  tipo(responsavel: Responsavel): string {
    const nome = responsavel.tipo?.nome;
    return nome ? this.tipoLabels[nome] : '—';
  }

  documento(responsavel: Responsavel): string {
    if (responsavel.documento?.cpf) return formatarCpf(responsavel.documento.cpf);
    if (responsavel.cnpj) return formatarCnpj(responsavel.cnpj);
    return '—';
  }

  telefone(responsavel: Responsavel): string {
    return responsavel.contato?.telefonePrincipal
      ? formatarTelefone(responsavel.contato.telefonePrincipal)
      : '—';
  }

  /** Inicial do nome do responsável para o avatar. */
  inicial(responsavel: Responsavel): string {
    return responsavel.nome?.trim().charAt(0).toUpperCase() || '?';
  }

  private corresponde(responsavel: Responsavel, termo: string): boolean {
    return (
      contemTexto(responsavel.nome, termo) ||
      contemTexto(this.documento(responsavel), termo) ||
      contemTexto(this.tipo(responsavel), termo)
    );
  }

  carregar(): void {
    this.carregando.set(true);
    this.service.listar().subscribe({
      next: (dados) => {
        this.responsaveis.set(dados);
        this.carregando.set(false);
      },
      error: (err) => {
        this.carregando.set(false);
        this.notificar(mensagemDeErro(err));
      },
    });
  }

  confirmarExclusao(responsavel: Responsavel): void {
    const ref = this.dialog.open(ResponsavelDeleteDialog, {
      data: { nome: responsavel.nome },
      width: '420px',
    });
    ref.afterClosed().subscribe((confirmado) => {
      if (confirmado) this.excluir(responsavel);
    });
  }

  private excluir(responsavel: Responsavel): void {
    this.service.excluir(responsavel.id!).subscribe({
      next: () => {
        this.notificar(`"${responsavel.nome}" foi excluído.`);
        this.carregar();
      },
      error: (err) => this.notificar(mensagemDeErro(err)),
    });
  }

  private notificar(mensagem: string): void {
    this.snackBar.open(mensagem, 'Fechar', { duration: 5000 });
  }
}
