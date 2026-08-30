import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AdotanteService } from '../../../services/adotante.service';
import { Adotante } from '../../../models/adotante.model';
import {
  ESTADOS_CIVIS,
  ESCOLARIDADES,
  EstadoCivil,
  Escolaridade,
} from '../../../models/enums';
import { mensagemDeErro } from '../../../shared/erro';
import { MascaraDirective } from '../../../shared/mascara.directive';

/** Converte um Date para string ISO `yyyy-MM-dd` no fuso local (sem deslocar o dia). */
function paraIso(data: Date | null): string | null {
  if (!data) return null;
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

/** Converte string ISO `yyyy-MM-dd` para Date local (meia-noite). */
function paraData(iso: string | null | undefined): Date | null {
  return iso ? new Date(`${iso}T00:00:00`) : null;
}

/** Impede que telefone principal e telefone secundário sejam iguais. */
const telefonesDiferentesValidator: ValidatorFn = (grupo: AbstractControl): ValidationErrors | null => {
  const principal = grupo.get('telefonePrincipal')?.value;
  const secundario = grupo.get('telefoneSecundario')?.value;
  if (principal && secundario && principal === secundario) {
    return { telefonesIguais: true };
  }
  return null;
};

@Component({
  selector: 'app-adotante-form',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MascaraDirective,
  ],
  templateUrl: './adotante-form.html',
  styleUrl: './adotante-form.scss',
})
export class AdotanteForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly adotanteService = inject(AdotanteService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly estadosCivis = ESTADOS_CIVIS;
  readonly escolaridades = ESCOLARIDADES;

  readonly carregando = signal(false);
  readonly salvando = signal(false);
  readonly adotanteId = signal<number | null>(null);
  readonly ehEdicao = computed(() => this.adotanteId() !== null);

  readonly form = this.fb.group({
    nome: ['', [Validators.required, Validators.maxLength(100)]],
    dataNascimento: [null as Date | null, Validators.required],
    documento: this.fb.group({
      cpf: ['', [Validators.required, Validators.maxLength(11)]],
      rg: ['', [Validators.required, Validators.maxLength(20)]],
      orgaoRg: ['', [Validators.required, Validators.maxLength(10)]],
    }),
    contato: this.fb.group(
      {
        telefonePrincipal: ['', [Validators.required, Validators.maxLength(15)]],
        telefoneSecundario: ['', [Validators.required, Validators.maxLength(15)]],
        email: ['', [Validators.email, Validators.maxLength(100)]],
        instagram: ['', Validators.maxLength(50)],
      },
      { validators: telefonesDiferentesValidator },
    ),
    endereco: this.fb.group({
      logradouro: ['', [Validators.required, Validators.maxLength(100)]],
      numero: ['', [Validators.required, Validators.maxLength(10)]],
      complemento: ['', Validators.maxLength(50)],
      bairro: ['', [Validators.required, Validators.maxLength(50)]],
      cidade: ['', [Validators.required, Validators.maxLength(50)]],
      estado: ['', [Validators.required, Validators.maxLength(2)]],
      cep: ['', [Validators.required, Validators.maxLength(8)]],
    }),
    dadosDemograficos: this.fb.group({
      profissao: ['', Validators.maxLength(50)],
      rendaMensal: [0, [Validators.min(0)]],
      estadoCivil: [null as EstadoCivil | null],
      escolaridade: [null as Escolaridade | null],
    }),
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.adotanteId.set(Number(idParam));
      this.carregarAdotante(Number(idParam));
    }
  }

  private carregarAdotante(id: number): void {
    this.carregando.set(true);
    this.adotanteService.buscarPorId(id).subscribe({
      next: (a) => {
        this.form.patchValue({
          nome: a.nome,
          dataNascimento: paraData(a.dataNascimento),
          documento: {
            cpf: a.documento?.cpf ?? '',
            rg: a.documento?.rg ?? '',
            orgaoRg: a.documento?.orgaoRg ?? '',
          },
          contato: {
            telefonePrincipal: a.contato?.telefonePrincipal ?? '',
            telefoneSecundario: a.contato?.telefoneSecundario ?? '',
            email: a.contato?.email ?? '',
            instagram: a.contato?.instagram ?? '',
          },
          endereco: {
            logradouro: a.endereco?.logradouro ?? '',
            numero: a.endereco?.numero ?? '',
            complemento: a.endereco?.complemento ?? '',
            bairro: a.endereco?.bairro ?? '',
            cidade: a.endereco?.cidade ?? '',
            estado: a.endereco?.estado ?? '',
            cep: a.endereco?.cep ?? '',
          },
          dadosDemograficos: {
            profissao: a.dadosDemograficos?.profissao ?? '',
            rendaMensal: a.dadosDemograficos?.rendaMensal ?? 0,
            estadoCivil: a.dadosDemograficos?.estadoCivil ?? null,
            escolaridade: a.dadosDemograficos?.escolaridade ?? null,
          },
        });
        this.carregando.set(false);
      },
      error: (err) => {
        this.carregando.set(false);
        this.notificar(mensagemDeErro(err));
      },
    });
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const payload: Adotante = {
      nome: v.nome!,
      dataNascimento: paraIso(v.dataNascimento)!,
      documento: {
        cpf: v.documento.cpf!,
        rg: v.documento.rg!,
        orgaoRg: v.documento.orgaoRg!,
      },
      contato: {
        telefonePrincipal: v.contato.telefonePrincipal!,
        telefoneSecundario: v.contato.telefoneSecundario!,
        email: v.contato.email || null,
        instagram: v.contato.instagram || null,
      },
      endereco: {
        logradouro: v.endereco.logradouro!,
        numero: v.endereco.numero!,
        complemento: v.endereco.complemento || null,
        bairro: v.endereco.bairro!,
        cidade: v.endereco.cidade!,
        estado: v.endereco.estado!,
        cep: v.endereco.cep!,
      },
      dadosDemograficos: {
        profissao: v.dadosDemograficos.profissao || null,
        rendaMensal: v.dadosDemograficos.rendaMensal ?? 0,
        estadoCivil: v.dadosDemograficos.estadoCivil ?? null,
        escolaridade: v.dadosDemograficos.escolaridade ?? null,
      },
    };

    this.salvando.set(true);
    const id = this.adotanteId();
    const requisicao = id
      ? this.adotanteService.atualizar(id, payload)
      : this.adotanteService.salvar(payload);

    requisicao.subscribe({
      next: () => {
        this.salvando.set(false);
        this.notificar(id ? 'Adotante atualizado.' : 'Adotante cadastrado.');
        this.router.navigate(['/adotantes']);
      },
      error: (err) => {
        this.salvando.set(false);
        this.notificar(mensagemDeErro(err));
      },
    });
  }

  private notificar(mensagem: string): void {
    this.snackBar.open(mensagem, 'Fechar', { duration: 5000 });
  }
}
