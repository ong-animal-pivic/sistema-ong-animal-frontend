import { Component, ElementRef, OnInit, ViewChild, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AreaService } from '../../../services/area.service';
import { AreaPayload } from '../../../models/area.model';
import { mensagemDeErro } from '../../../shared/erro';
import { scrollParaPrimeiroErro } from '../../../shared/scroll-para-erro';

@Component({
  selector: 'app-area-form',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  templateUrl: './area-form.html',
  styleUrl: './area-form.scss',
})
export class AreaForm implements OnInit {
  @ViewChild('formEl') private readonly formEl?: ElementRef<HTMLFormElement>;

  private readonly fb = inject(FormBuilder);
  private readonly service = inject(AreaService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly carregando = signal(false);
  readonly salvando = signal(false);
  readonly areaId = signal<number | null>(null);
  readonly ehEdicao = computed(() => this.areaId() !== null);

  readonly form = this.fb.group({
    nome: ['', [Validators.required, Validators.maxLength(100)]],
    descricao: ['', Validators.maxLength(255)],
    observacao: ['', Validators.maxLength(255)],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.areaId.set(Number(idParam));
      this.carregarArea(Number(idParam));
    }
  }

  private carregarArea(id: number): void {
    this.carregando.set(true);
    this.service.buscarPorId(id).subscribe({
      next: (a) => {
        this.form.patchValue({
          nome: a.nome,
          descricao: a.descricao ?? '',
          observacao: a.observacao ?? '',
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
    const payload: AreaPayload = {
      nome: v.nome!.trim(),
      descricao: v.descricao?.trim() || null,
      observacao: v.observacao?.trim() || null,
    };

    this.salvando.set(true);
    const id = this.areaId();
    const requisicao = id ? this.service.atualizar(id, payload) : this.service.salvar(payload);

    requisicao.subscribe({
      next: () => {
        this.salvando.set(false);
        this.notificar(id ? 'Área atualizada.' : 'Área cadastrada.');
        this.router.navigate(['/areas']);
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
