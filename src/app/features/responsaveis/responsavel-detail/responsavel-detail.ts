import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ResponsavelService } from '../../../services/responsavel.service';
import { Responsavel } from '../../../models/responsavel.model';
import { Animal } from '../../../models/animal.model';
import { Raca } from '../../../models/raca.model';
import { TIPO_RESPONSAVEL_LABELS, ESPECIE_LABELS, STATUS_LABELS } from '../../../models/enums';
import { mensagemDeErro } from '../../../shared/erro';
import { formatarCpf, formatarCnpj, formatarTelefone } from '../../../shared/mascara';

@Component({
  selector: 'app-responsavel-detail',
  imports: [RouterLink, MatButtonModule, MatIconModule, MatProgressBarModule, MatTableModule],
  templateUrl: './responsavel-detail.html',
  styleUrl: './responsavel-detail.scss',
})
export class ResponsavelDetail implements OnInit {
  private readonly service = inject(ResponsavelService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly tipoLabels = TIPO_RESPONSAVEL_LABELS;
  readonly colunasAnimais = ['animal', 'especie', 'raca', 'status'];

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
    if (r.documento?.cpf) return `CPF: ${formatarCpf(r.documento.cpf)}`;
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

  private notificar(mensagem: string): void {
    this.snackBar.open(mensagem, 'Fechar', { duration: 5000 });
  }
}
