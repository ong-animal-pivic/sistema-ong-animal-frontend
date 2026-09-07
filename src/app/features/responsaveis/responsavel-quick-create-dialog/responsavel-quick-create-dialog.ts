import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ResponsavelService } from '../../../services/responsavel.service';
import { TipoService } from '../../../services/tipo.service';
import { Responsavel, ResponsavelPayload } from '../../../models/responsavel.model';
import { Tipo } from '../../../models/tipo.model';
import { TIPO_RESPONSAVEL_LABELS } from '../../../models/enums';
import { mensagemDeErro } from '../../../shared/erro';
import { MascaraDirective } from '../../../shared/mascara.directive';
import { cpfOuCnpjValidator } from '../responsavel-form/responsavel-form';

@Component({
  selector: 'app-responsavel-quick-create-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MascaraDirective,
  ],
  templateUrl: './responsavel-quick-create-dialog.html',
  styleUrl: './responsavel-quick-create-dialog.scss',
})
export class ResponsavelQuickCreateDialog implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly responsavelService = inject(ResponsavelService);
  private readonly tipoService = inject(TipoService);
  private readonly dialogRef = inject(MatDialogRef<ResponsavelQuickCreateDialog, Responsavel>);
  private readonly snackBar = inject(MatSnackBar);

  readonly tipoLabels = TIPO_RESPONSAVEL_LABELS;
  readonly tipos = signal<Tipo[]>([]);
  readonly salvando = signal(false);

  readonly form = this.fb.group(
    {
      nome: ['', [Validators.required, Validators.maxLength(100)]],
      documento: this.fb.group({
        cpf: ['', Validators.maxLength(11)],
      }),
      cnpj: ['', Validators.maxLength(14)],
      telefonePrincipal: ['', [Validators.required, Validators.maxLength(15)]],
      logradouro: ['', [Validators.required, Validators.maxLength(100)]],
      numero: ['', [Validators.required, Validators.maxLength(10)]],
      bairro: ['', [Validators.required, Validators.maxLength(50)]],
      cidade: ['', [Validators.required, Validators.maxLength(50)]],
      estado: ['', [Validators.required, Validators.maxLength(2)]],
      cep: ['', [Validators.required, Validators.maxLength(8)]],
      tipoId: [null as number | null, Validators.required],
    },
    { validators: cpfOuCnpjValidator },
  );

  ngOnInit(): void {
    this.tipoService.listar().subscribe({
      next: (dados) => this.tipos.set(dados),
      error: (err) => this.notificar(mensagemDeErro(err)),
    });
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const payload: ResponsavelPayload = {
      nome: v.nome!,
      documento: { cpf: v.documento.cpf || null },
      cnpj: v.cnpj || null,
      contato: { telefonePrincipal: v.telefonePrincipal! },
      endereco: {
        logradouro: v.logradouro!,
        numero: v.numero!,
        bairro: v.bairro!,
        cidade: v.cidade!,
        estado: v.estado!,
        cep: v.cep!,
      },
      tipoId: v.tipoId!,
    };

    this.salvando.set(true);
    this.responsavelService.salvar(payload).subscribe({
      next: (responsavelCriado) => {
        this.salvando.set(false);
        this.notificar('Responsável cadastrado.');
        this.dialogRef.close(responsavelCriado);
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
