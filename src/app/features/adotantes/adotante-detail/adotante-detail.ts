import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { AdotanteService } from '../../../services/adotante.service';
import { Adotante } from '../../../models/adotante.model';
import { ESCOLARIDADE_LABELS, ESTADO_CIVIL_LABELS } from '../../../models/enums';
import { mensagemDeErro } from '../../../shared/erro';
import { formatarCpf, formatarRg, formatarTelefone } from '../../../shared/mascara';
import { calcularIdadeAnos } from '../../../shared/idade';
import { AdotanteDeleteDialog } from '../adotante-delete-dialog/adotante-delete-dialog';

@Component({
  selector: 'app-adotante-detail',
  imports: [RouterLink, MatButtonModule, MatIconModule, MatProgressBarModule, MatDialogModule],
  templateUrl: './adotante-detail.html',
  styleUrl: './adotante-detail.scss',
})
export class AdotanteDetail implements OnInit {
  private readonly service = inject(AdotanteService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly adotante = signal<Adotante | null>(null);
  readonly carregando = signal(false);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.router.navigate(['/adotantes']);
      return;
    }
    this.carregar(Number(idParam));
  }

  private carregar(id: number): void {
    this.carregando.set(true);
    this.service.buscarPorId(id).subscribe({
      next: (a) => {
        this.adotante.set(a);
        this.carregando.set(false);
      },
      error: (err) => {
        this.carregando.set(false);
        this.notificar(mensagemDeErro(err));
        this.router.navigate(['/adotantes']);
      },
    });
  }

  cidade(a: Adotante): string {
    const e = a.endereco;
    if (!e?.cidade) return '—';
    return e.estado ? `${e.cidade}/${e.estado}` : e.cidade;
  }

  cpf(a: Adotante): string {
    return a.documento?.cpf ? formatarCpf(a.documento.cpf) : '—';
  }

  rg(a: Adotante): string {
    const rg = a.documento?.rg;
    if (!rg) return '—';
    const orgao = a.documento.orgaoRg ? ` (${a.documento.orgaoRg})` : '';
    return `${formatarRg(rg)}${orgao}`;
  }

  telefone(raw: string | null | undefined): string {
    return raw ? formatarTelefone(raw) : '—';
  }

  endereco(a: Adotante): string {
    const e = a.endereco;
    if (!e) return '—';
    const complemento = e.complemento ? `, ${e.complemento}` : '';
    return `${e.logradouro}, ${e.numero}${complemento} — ${e.bairro}, ${e.cidade}/${e.estado} — CEP ${e.cep}`;
  }

  nascimento(a: Adotante): string {
    if (!a.dataNascimento) return '—';
    const [ano, mes, dia] = a.dataNascimento.split('-');
    return `${dia}/${mes}/${ano} (${calcularIdadeAnos(a.dataNascimento)} anos)`;
  }

  renda(a: Adotante): string {
    const valor = a.dadosDemograficos?.rendaMensal;
    if (valor == null) return '—';
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  estadoCivil(a: Adotante): string {
    const v = a.dadosDemograficos?.estadoCivil;
    return v ? ESTADO_CIVIL_LABELS[v] : '—';
  }

  escolaridade(a: Adotante): string {
    const v = a.dadosDemograficos?.escolaridade;
    return v ? ESCOLARIDADE_LABELS[v] : '—';
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
        this.router.navigate(['/adotantes']);
      },
      error: (err) => this.notificar(mensagemDeErro(err)),
    });
  }

  private notificar(mensagem: string): void {
    this.snackBar.open(mensagem, 'Fechar', { duration: 5000 });
  }
}
