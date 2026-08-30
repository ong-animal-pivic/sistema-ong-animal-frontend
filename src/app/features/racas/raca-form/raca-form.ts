import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';

import { RacaService } from '../../../services/raca.service';
import { EspecieService } from '../../../services/especie.service';
import { RacaPayload } from '../../../models/raca.model';
import { Especie } from '../../../models/especie.model';
import { ESPECIE_LABELS } from '../../../models/enums';
import { mensagemDeErro } from '../../../shared/erro';

@Component({
  selector: 'app-raca-form',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  templateUrl: './raca-form.html',
  styleUrl: './raca-form.scss',
})
export class RacaForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly racaService = inject(RacaService);
  private readonly especieService = inject(EspecieService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly especieLabels = ESPECIE_LABELS;

  readonly especies = signal<Especie[]>([]);
  readonly carregando = signal(false);
  readonly salvando = signal(false);
  readonly racaId = signal<number | null>(null);
  readonly ehEdicao = computed(() => this.racaId() !== null);

  readonly form = this.fb.group({
    nome: ['', [Validators.required, Validators.maxLength(50)]],
    especieId: [null as number | null, Validators.required],
  });

  ngOnInit(): void {
    this.carregarEspecies();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.racaId.set(Number(idParam));
      this.carregarRaca(Number(idParam));
    }
  }

  private carregarEspecies(): void {
    this.especieService.listar().subscribe({
      next: (dados) => this.especies.set(dados),
      error: (err) => this.notificar(mensagemDeErro(err)),
    });
  }

  private carregarRaca(id: number): void {
    this.carregando.set(true);
    this.racaService.buscarPorId(id).subscribe({
      next: (r) => {
        this.form.patchValue({
          nome: r.nome,
          especieId: r.especie?.id ?? null,
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
    const payload: RacaPayload = {
      nome: v.nome!,
      especieId: v.especieId!,
    };

    this.salvando.set(true);
    const id = this.racaId();
    const requisicao = id
      ? this.racaService.atualizar(id, payload)
      : this.racaService.salvar(payload);

    requisicao.subscribe({
      next: () => {
        this.salvando.set(false);
        this.notificar(id ? 'Raça atualizada.' : 'Raça cadastrada.');
        this.router.navigate(['/racas']);
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
