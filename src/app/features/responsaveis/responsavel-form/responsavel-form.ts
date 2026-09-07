import { Component, ElementRef, OnInit, ViewChild, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ResponsavelService } from '../../../services/responsavel.service';
import { TipoService } from '../../../services/tipo.service';
import { ResponsavelPayload } from '../../../models/responsavel.model';
import { Tipo } from '../../../models/tipo.model';
import { TIPO_RESPONSAVEL_LABELS } from '../../../models/enums';
import { mensagemDeErro } from '../../../shared/erro';
import { scrollParaPrimeiroErro } from '../../../shared/scroll-para-erro';
import { MascaraDirective } from '../../../shared/mascara.directive';

/** Impede que telefone principal e telefone secundário sejam iguais. */
const telefonesDiferentesValidator: ValidatorFn = (grupo: AbstractControl): ValidationErrors | null => {
  const principal = grupo.get('telefonePrincipal')?.value;
  const secundario = grupo.get('telefoneSecundario')?.value;
  if (principal && secundario && principal === secundario) {
    return { telefonesIguais: true };
  }
  return null;
};

/** CPF e CNPJ são mutuamente exclusivos, mas pelo menos um é obrigatório (espelha a regra do backend). */
export const cpfOuCnpjValidator: ValidatorFn = (grupo: AbstractControl): ValidationErrors | null => {
  const cpf = grupo.get('documento.cpf')?.value?.trim();
  const cnpj = grupo.get('cnpj')?.value?.trim();
  if (cpf && cnpj) return { cpfECnpjPreenchidos: true };
  if (!cpf && !cnpj) return { cpfOuCnpjObrigatorio: true };
  return null;
};

@Component({
  selector: 'app-responsavel-form',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MascaraDirective,
  ],
  templateUrl: './responsavel-form.html',
  styleUrl: './responsavel-form.scss',
})
export class ResponsavelForm implements OnInit {
  @ViewChild('formEl') private readonly formEl?: ElementRef<HTMLFormElement>;

  private readonly fb = inject(FormBuilder);
  private readonly responsavelService = inject(ResponsavelService);
  private readonly tipoService = inject(TipoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly tipoLabels = TIPO_RESPONSAVEL_LABELS;

  readonly tipos = signal<Tipo[]>([]);
  readonly carregando = signal(false);
  readonly salvando = signal(false);
  readonly responsavelId = signal<number | null>(null);
  readonly ehEdicao = computed(() => this.responsavelId() !== null);

  readonly form = this.fb.group(
    {
      nome: ['', [Validators.required, Validators.maxLength(100)]],
      documento: this.fb.group({
        cpf: ['', Validators.maxLength(11)],
        rg: ['', Validators.maxLength(20)],
        orgaoRg: ['', Validators.maxLength(10)],
      }),
      cnpj: ['', Validators.maxLength(14)],
      contato: this.fb.group(
        {
          telefonePrincipal: ['', [Validators.required, Validators.maxLength(15)]],
          telefoneSecundario: ['', Validators.maxLength(15)],
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
      tipoId: [null as number | null, Validators.required],
    },
    { validators: cpfOuCnpjValidator },
  );

  ngOnInit(): void {
    this.carregarTipos();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.responsavelId.set(Number(idParam));
      this.carregarResponsavel(Number(idParam));
    }
  }

  private carregarTipos(): void {
    this.tipoService.listar().subscribe({
      next: (dados) => this.tipos.set(dados),
      error: (err) => this.notificar(mensagemDeErro(err)),
    });
  }

  private carregarResponsavel(id: number): void {
    this.carregando.set(true);
    this.responsavelService.buscarPorId(id).subscribe({
      next: (r) => {
        this.form.patchValue({
          nome: r.nome,
          documento: {
            cpf: r.documento?.cpf ?? '',
            rg: r.documento?.rg ?? '',
            orgaoRg: r.documento?.orgaoRg ?? '',
          },
          cnpj: r.cnpj ?? '',
          contato: {
            telefonePrincipal: r.contato?.telefonePrincipal ?? '',
            telefoneSecundario: r.contato?.telefoneSecundario ?? '',
            email: r.contato?.email ?? '',
            instagram: r.contato?.instagram ?? '',
          },
          endereco: {
            logradouro: r.endereco?.logradouro ?? '',
            numero: r.endereco?.numero ?? '',
            complemento: r.endereco?.complemento ?? '',
            bairro: r.endereco?.bairro ?? '',
            cidade: r.endereco?.cidade ?? '',
            estado: r.endereco?.estado ?? '',
            cep: r.endereco?.cep ?? '',
          },
          tipoId: r.tipo?.id ?? null,
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
      scrollParaPrimeiroErro(this.formEl?.nativeElement ?? null);
      return;
    }

    const v = this.form.getRawValue();
    const payload: ResponsavelPayload = {
      nome: v.nome!,
      documento: {
        cpf: v.documento.cpf || null,
        rg: v.documento.rg || null,
        orgaoRg: v.documento.orgaoRg || null,
      },
      cnpj: v.cnpj || null,
      contato: {
        telefonePrincipal: v.contato.telefonePrincipal!,
        telefoneSecundario: v.contato.telefoneSecundario || null,
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
      tipoId: v.tipoId!,
    };

    this.salvando.set(true);
    const id = this.responsavelId();
    const requisicao = id
      ? this.responsavelService.atualizar(id, payload)
      : this.responsavelService.salvar(payload);

    requisicao.subscribe({
      next: () => {
        this.salvando.set(false);
        this.notificar(id ? 'Responsável atualizado.' : 'Responsável cadastrado.');
        this.router.navigate(['/responsaveis']);
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
