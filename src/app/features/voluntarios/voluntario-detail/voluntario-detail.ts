import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { VoluntarioService } from '../../../services/voluntario.service';
import { Voluntario, VoluntarioPayload } from '../../../models/voluntario.model';
import { Responsavel } from '../../../models/responsavel.model';
import { VoluntarioVincularDialog } from '../voluntario-vincular-dialog/voluntario-vincular-dialog';
import { VinculoConfirmDialog } from '../../responsaveis/vinculo-confirm-dialog/vinculo-confirm-dialog';
import { VoluntarioDeleteDialog } from '../voluntario-delete-dialog/voluntario-delete-dialog';
import { FREQUENCIA_LABELS, TIPO_RESPONSAVEL_LABELS } from '../../../models/enums';
import { mensagemDeErro } from '../../../shared/erro';
import { formatarCpf, formatarTelefone } from '../../../shared/mascara';

@Component({
  selector: 'app-voluntario-detail',
  imports: [RouterLink, MatButtonModule, MatIconModule, MatProgressBarModule, MatDialogModule],
  templateUrl: './voluntario-detail.html',
  styleUrl: './voluntario-detail.scss',
})
export class VoluntarioDetail implements OnInit {
  private readonly service = inject(VoluntarioService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly frequenciaLabels = FREQUENCIA_LABELS;
  readonly tipoResponsavelLabels = TIPO_RESPONSAVEL_LABELS;

  readonly voluntario = signal<Voluntario | null>(null);
  readonly carregando = signal(false);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.router.navigate(['/voluntarios']);
      return;
    }
    this.carregar(Number(idParam));
  }

  private carregar(id: number): void {
    this.carregando.set(true);
    this.service.buscarPorId(id).subscribe({
      next: (v) => {
        this.voluntario.set(v);
        this.carregando.set(false);
      },
      error: (err) => {
        this.carregando.set(false);
        this.notificar(mensagemDeErro(err));
        this.router.navigate(['/voluntarios']);
      },
    });
  }

  documento(v: Voluntario): string {
    return v.documento?.cpf ? `CPF: ${formatarCpf(v.documento.cpf)}` : '—';
  }

  telefone(v: Voluntario): string {
    return v.contato?.telefonePrincipal ? formatarTelefone(v.contato.telefonePrincipal) : '—';
  }

  endereco(v: Voluntario): string {
    const e = v.endereco;
    if (!e) return '—';
    const complemento = e.complemento ? `, ${e.complemento}` : '';
    return `${e.logradouro}, ${e.numero}${complemento} — ${e.bairro}, ${e.cidade}/${e.estado} — CEP ${e.cep}`;
  }

  frequencia(v: Voluntario): string {
    return this.frequenciaLabels[v.frequencia] ?? v.frequencia;
  }

  confirmarExclusao(v: Voluntario): void {
    const ref = this.dialog.open(VoluntarioDeleteDialog, {
      data: { nome: v.nome },
      width: '420px',
    });
    ref.afterClosed().subscribe((confirmado) => {
      if (confirmado) this.excluir(v);
    });
  }

  private excluir(v: Voluntario): void {
    this.service.excluir(v.id!).subscribe({
      next: () => {
        this.notificar(`"${v.nome}" foi excluído.`);
        this.router.navigate(['/voluntarios']);
      },
      error: (err) => this.notificar(mensagemDeErro(err)),
    });
  }

  abrirTrocaResponsavel(v: Voluntario): void {
    this.dialog
      .open(VoluntarioVincularDialog, {
        data: { voluntario: v, responsavelAtualId: v.responsavel?.id ?? null },
        width: '520px',
        maxWidth: '95vw',
      })
      .afterClosed()
      .subscribe((responsavel: Responsavel | undefined) => {
        if (responsavel) this.confirmarTroca(v, responsavel);
      });
  }

  private confirmarTroca(v: Voluntario, responsavel: Responsavel): void {
    const ref = this.dialog.open(VinculoConfirmDialog, {
      data: {
        animal: v.nome,
        responsavelAtual: this.descreverResponsavel(v.responsavel),
        responsavelNovo: this.descreverResponsavel(responsavel),
      },
      width: '460px',
    });
    ref.afterClosed().subscribe((confirmado) => {
      if (confirmado) this.trocarResponsavel(v, responsavel);
    });
  }

  private trocarResponsavel(v: Voluntario, responsavel: Responsavel): void {
    this.service.atualizar(v.id!, this.paraPayload(v, responsavel.id!)).subscribe({
      next: () => {
        this.notificar(`"${v.nome}" foi vinculado a ${responsavel.nome}.`);
        this.carregar(v.id!);
      },
      error: (err) => this.notificar(mensagemDeErro(err)),
    });
  }

  private descreverResponsavel(r: Responsavel | null | undefined): string {
    if (!r) return '—';
    const tipo = r.tipo?.nome ? ` (${this.tipoResponsavelLabels[r.tipo.nome]})` : '';
    return `${r.nome}${tipo}`;
  }

  /** Reenvia o voluntário como está, trocando apenas o responsável. */
  private paraPayload(v: Voluntario, responsavelId: number): VoluntarioPayload {
    return {
      nome: v.nome,
      documento: v.documento,
      idade: v.idade ?? null,
      profissao: v.profissao ?? null,
      contato: v.contato,
      frequencia: v.frequencia,
      endereco: v.endereco,
      responsavelId,
    };
  }

  private notificar(mensagem: string): void {
    this.snackBar.open(mensagem, 'Fechar', { duration: 5000 });
  }
}
