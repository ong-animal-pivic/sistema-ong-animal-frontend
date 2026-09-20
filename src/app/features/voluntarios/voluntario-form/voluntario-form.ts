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

import { VoluntarioService } from '../../../services/voluntario.service';
import { ResponsavelService } from '../../../services/responsavel.service';
import { VoluntarioPayload } from '../../../models/voluntario.model';
import { Responsavel } from '../../../models/responsavel.model';
import { FrequenciaVoluntario, FREQUENCIAS, FREQUENCIA_LABELS } from '../../../models/enums';
import { mensagemDeErro } from '../../../shared/erro';
import { scrollParaPrimeiroErro } from '../../../shared/scroll-para-erro';
import { MascaraDirective } from '../../../shared/mascara.directive';
import { ErroDeGrupoMatcher } from '../../../shared/erro-de-grupo.matcher';

/** Impede que telefone principal e telefone secundário sejam iguais (mesma regra usada em ResponsavelForm). */
const telefonesDiferentesValidator: ValidatorFn = (grupo: AbstractControl): ValidationErrors | null => {
  const principal = grupo.get('telefonePrincipal')?.value;
  const secundario = grupo.get('telefoneSecundario')?.value;
  if (principal && secundario && principal === secundario) {
    return { telefonesIguais: true };
  }
  return null;
};

@Component({
  selector: 'app-voluntario-form',
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
  templateUrl: './voluntario-form.html',
  styleUrl: './voluntario-form.scss',
})
export class VoluntarioForm implements OnInit {
  @ViewChild('formEl') private readonly formEl?: ElementRef<HTMLFormElement>;

  private readonly fb = inject(FormBuilder);
  private readonly voluntarioService = inject(VoluntarioService);
  private readonly responsavelService = inject(ResponsavelService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly frequenciaLabels = FREQUENCIA_LABELS;
  readonly frequencias = FREQUENCIAS;
  readonly telefonesMatcher = new ErroDeGrupoMatcher('telefonesIguais');

  readonly responsaveis = signal<Responsavel[]>([]);
  readonly carregando = signal(false);
  readonly salvando = signal(false);
  readonly voluntarioId = signal<number | null>(null);
  readonly ehEdicao = computed(() => this.voluntarioId() !== null);

  readonly form = this.fb.group({
    nome: ['', [Validators.required, Validators.maxLength(100)]],
    documento: this.fb.group({
      cpf: ['', Validators.maxLength(11)],
      rg: ['', Validators.maxLength(20)],
      orgaoRg: ['', Validators.maxLength(10)],
    }),
    idade: [null as number | null, Validators.min(0)],
    profissao: ['', Validators.maxLength(50)],
    contato: this.fb.group(
      {
        telefonePrincipal: ['', [Validators.required, Validators.maxLength(15)]],
        telefoneSecundario: ['', Validators.maxLength(15)],
        email: ['', [Validators.email, Validators.maxLength(100)]],
        instagram: ['', Validators.maxLength(50)],
      },
      { validators: telefonesDiferentesValidator },
    ),
    frequencia: [null as FrequenciaVoluntario | null, Validators.required],
    endereco: this.fb.group({
      logradouro: ['', [Validators.required, Validators.maxLength(100)]],
      numero: ['', [Validators.required, Validators.maxLength(10)]],
      complemento: ['', Validators.maxLength(50)],
      bairro: ['', [Validators.required, Validators.maxLength(50)]],
      cidade: ['', [Validators.required, Validators.maxLength(50)]],
      estado: ['', [Validators.required, Validators.maxLength(2)]],
      cep: ['', [Validators.required, Validators.maxLength(8)]],
    }),
    responsavelId: [null as number | null, Validators.required],
  });

  ngOnInit(): void {
    this.carregarResponsaveis();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.voluntarioId.set(Number(idParam));
      this.carregarVoluntario(Number(idParam));
    }
  }

  private carregarResponsaveis(): void {
    this.responsavelService.listar().subscribe({
      next: (dados) => this.responsaveis.set(dados),
      error: (err) => this.notificar(mensagemDeErro(err)),
    });
  }

  private carregarVoluntario(id: number): void {
    this.carregando.set(true);
    this.voluntarioService.buscarPorId(id).subscribe({
      next: (v) => {
        this.form.patchValue({
          nome: v.nome,
          documento: {
            cpf: v.documento?.cpf ?? '',
            rg: v.documento?.rg ?? '',
            orgaoRg: v.documento?.orgaoRg ?? '',
          },
          idade: v.idade ?? null,
          profissao: v.profissao ?? '',
          contato: {
            telefonePrincipal: v.contato?.telefonePrincipal ?? '',
            telefoneSecundario: v.contato?.telefoneSecundario ?? '',
            email: v.contato?.email ?? '',
            instagram: v.contato?.instagram ?? '',
          },
          frequencia: v.frequencia,
          endereco: {
            logradouro: v.endereco?.logradouro ?? '',
            numero: v.endereco?.numero ?? '',
            complemento: v.endereco?.complemento ?? '',
            bairro: v.endereco?.bairro ?? '',
            cidade: v.endereco?.cidade ?? '',
            estado: v.endereco?.estado ?? '',
            cep: v.endereco?.cep ?? '',
          },
          responsavelId: v.responsavel?.id ?? null,
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
    const payload: VoluntarioPayload = {
      nome: v.nome!,
      documento: {
        cpf: v.documento.cpf || null,
        rg: v.documento.rg || null,
        orgaoRg: v.documento.orgaoRg || null,
      },
      idade: v.idade,
      profissao: v.profissao || null,
      contato: {
        telefonePrincipal: v.contato.telefonePrincipal!,
        telefoneSecundario: v.contato.telefoneSecundario || null,
        email: v.contato.email || null,
        instagram: v.contato.instagram || null,
      },
      frequencia: v.frequencia!,
      endereco: {
        logradouro: v.endereco.logradouro!,
        numero: v.endereco.numero!,
        complemento: v.endereco.complemento || null,
        bairro: v.endereco.bairro!,
        cidade: v.endereco.cidade!,
        estado: v.endereco.estado!,
        cep: v.endereco.cep!,
      },
      responsavelId: v.responsavelId!,
    };

    this.salvando.set(true);
    const id = this.voluntarioId();
    const requisicao = id
      ? this.voluntarioService.atualizar(id, payload)
      : this.voluntarioService.salvar(payload);

    requisicao.subscribe({
      next: () => {
        this.salvando.set(false);
        this.notificar(id ? 'Voluntário atualizado.' : 'Voluntário cadastrado.');
        this.router.navigate(['/voluntarios']);
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
