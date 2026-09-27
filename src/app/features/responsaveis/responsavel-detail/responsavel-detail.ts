import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { ResponsavelService } from '../../../services/responsavel.service';
import { AnimalService } from '../../../services/animal.service';
import { VoluntarioService } from '../../../services/voluntario.service';
import { Responsavel } from '../../../models/responsavel.model';
import { Animal, AnimalPayload } from '../../../models/animal.model';
import { Voluntario, VoluntarioPayload } from '../../../models/voluntario.model';
import { AnimalVincularDialog } from '../animal-vincular-dialog/animal-vincular-dialog';
import {
  VoluntarioSelecionarData,
  VoluntarioSelecionarDialog,
} from '../../voluntarios/voluntario-selecionar-dialog/voluntario-selecionar-dialog';
import { VinculoConfirmDialog } from '../vinculo-confirm-dialog/vinculo-confirm-dialog';
import { ResponsavelDeleteDialog } from '../responsavel-delete-dialog/responsavel-delete-dialog';
import { Raca } from '../../../models/raca.model';
import {
  TIPO_RESPONSAVEL_LABELS,
  ESPECIE_LABELS,
  STATUS_LABELS,
  FREQUENCIA_LABELS,
} from '../../../models/enums';
import { mensagemDeErro } from '../../../shared/erro';
import { formatarCpf, formatarCnpj, formatarTelefone } from '../../../shared/mascara';

@Component({
  selector: 'app-responsavel-detail',
  imports: [RouterLink, MatButtonModule, MatIconModule, MatProgressBarModule, MatTableModule, MatDialogModule],
  templateUrl: './responsavel-detail.html',
  styleUrl: './responsavel-detail.scss',
})
export class ResponsavelDetail implements OnInit {
  private readonly service = inject(ResponsavelService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly animalService = inject(AnimalService);
  private readonly voluntarioService = inject(VoluntarioService);

  readonly tipoLabels = TIPO_RESPONSAVEL_LABELS;
  readonly colunasAnimais = ['animal', 'especie', 'raca', 'status'];
  readonly colunasVoluntarios = ['voluntario', 'frequencia', 'telefone', 'email'];

  readonly responsavel = signal<Responsavel | null>(null);
  readonly carregando = signal(false);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.router.navigate(['/responsaveis']);
      return;
    }
    this.carregar(Number(idParam));
  }

  private carregar(id: number): void {
    this.carregando.set(true);
    this.service.buscarPorId(id).subscribe({
      next: (r) => {
        this.responsavel.set(r);
        this.carregando.set(false);
      },
      error: (err) => {
        this.carregando.set(false);
        this.notificar(mensagemDeErro(err));
        this.router.navigate(['/responsaveis']);
      },
    });
  }

  documento(r: Responsavel): string {
    if (r.documento?.cpf) return `CPF/CIN: ${formatarCpf(r.documento.cpf)}`;
    if (r.cnpj) return `CNPJ: ${formatarCnpj(r.cnpj)}`;
    return '—';
  }

  telefone(r: Responsavel): string {
    return r.contato?.telefonePrincipal ? formatarTelefone(r.contato.telefonePrincipal) : '—';
  }

  endereco(r: Responsavel): string {
    const e = r.endereco;
    if (!e) return '—';
    const complemento = e.complemento ? `, ${e.complemento}` : '';
    return `${e.logradouro}, ${e.numero}${complemento} — ${e.bairro}, ${e.cidade}/${e.estado} — CEP ${e.cep}`;
  }

  nomeEspecie(animal: Animal): string {
    const nome = (animal.raca as Raca)?.especie?.nome;
    return nome ? ESPECIE_LABELS[nome] : '—';
  }

  nomeRaca(animal: Animal): string {
    return (animal.raca as Raca)?.nome ?? '—';
  }

  rotuloStatus(animal: Animal): string {
    return STATUS_LABELS[animal.status] ?? animal.status;
  }

  rotuloFrequencia(voluntario: Voluntario): string {
    return FREQUENCIA_LABELS[voluntario.frequencia] ?? voluntario.frequencia;
  }

  telefoneVoluntario(voluntario: Voluntario): string {
    return voluntario.contato?.telefonePrincipal ? formatarTelefone(voluntario.contato.telefonePrincipal) : '—';
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
        this.router.navigate(['/responsaveis']);
      },
      error: (err) => this.notificar(mensagemDeErro(err)),
    });
  }

  abrirVinculo(responsavel: Responsavel): void {
    this.dialog
      .open(AnimalVincularDialog, { data: { responsavel }, width: '720px', maxWidth: '95vw' })
      .afterClosed()
      .subscribe((animal: Animal | undefined) => {
        if (animal) this.confirmarVinculo(animal, responsavel);
      });
  }

  private confirmarVinculo(animal: Animal, responsavel: Responsavel): void {
    const ref = this.dialog.open(VinculoConfirmDialog, {
      data: {
        animal: `${animal.nome} (${this.nomeEspecie(animal)} · ${this.nomeRaca(animal)})`,
        responsavelAtual: this.descreverResponsavel(animal.responsavel),
        responsavelNovo: this.descreverResponsavel(responsavel),
      },
      width: '460px',
    });
    ref.afterClosed().subscribe((confirmado) => {
      if (confirmado) this.vincular(animal, responsavel);
    });
  }

  private vincular(animal: Animal, responsavel: Responsavel): void {
    this.animalService.atualizar(animal.id!, this.paraPayload(animal, responsavel.id!)).subscribe({
      next: () => {
        this.notificar(`"${animal.nome}" foi vinculado a ${responsavel.nome}.`);
        this.carregar(responsavel.id!);
      },
      error: (err) => this.notificar(mensagemDeErro(err)),
    });
  }

  abrirVinculoVoluntario(responsavel: Responsavel): void {
    const data: VoluntarioSelecionarData = {
      titulo: `Vincular voluntário a ${responsavel.nome}`,
      excluirIds: (responsavel.voluntariosVinculados ?? []).map((v) => v.id!),
    };
    this.dialog
      .open(VoluntarioSelecionarDialog, { data, width: '520px', maxWidth: '95vw' })
      .afterClosed()
      .subscribe((voluntario: Voluntario | undefined) => {
        if (voluntario) this.confirmarVinculoVoluntario(voluntario, responsavel);
      });
  }

  private confirmarVinculoVoluntario(voluntario: Voluntario, responsavel: Responsavel): void {
    const ref = this.dialog.open(VinculoConfirmDialog, {
      data: {
        animal: voluntario.nome,
        responsavelAtual: this.descreverResponsavel(voluntario.responsavel),
        responsavelNovo: this.descreverResponsavel(responsavel),
        tipo: 'voluntario',
      },
      width: '460px',
    });
    ref.afterClosed().subscribe((confirmado) => {
      if (confirmado) this.vincularVoluntario(voluntario, responsavel);
    });
  }

  private vincularVoluntario(voluntario: Voluntario, responsavel: Responsavel): void {
    this.voluntarioService
      .atualizar(voluntario.id!, this.paraPayloadVoluntario(voluntario, responsavel.id!))
      .subscribe({
        next: () => {
          this.notificar(`"${voluntario.nome}" foi vinculado a ${responsavel.nome}.`);
          this.carregar(responsavel.id!);
        },
        error: (err) => this.notificar(mensagemDeErro(err)),
      });
  }

  private descreverResponsavel(r: Responsavel | null | undefined): string {
    if (!r) return '—';
    const tipo = r.tipo?.nome ? ` (${this.tipoLabels[r.tipo.nome]})` : '';
    return `${r.nome}${tipo}`;
  }

  /** Reenvia o animal como está, trocando apenas o responsável. */
  private paraPayload(a: Animal, responsavelId: number): AnimalPayload {
    return {
      nome: a.nome,
      idadeMeses: a.idadeMeses,
      porte: a.porte,
      sexo: a.sexo,
      status: a.status,
      castrado: a.castrado,
      dataResgate: a.dataResgate,
      dataSaida: a.dataSaida ?? null,
      corOlhos: a.corOlhos ?? null,
      corPelagem: a.corPelagem ?? null,
      observacao: a.observacao ?? null,
      racaId: a.raca.id!,
      adotanteId: a.adotante?.id ?? null,
      responsavelId,
    };
  }

  /** Reenvia o voluntário como está, trocando apenas o responsável. */
  private paraPayloadVoluntario(v: Voluntario, responsavelId: number): VoluntarioPayload {
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
