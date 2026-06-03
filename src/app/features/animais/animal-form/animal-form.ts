import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AnimalService } from '../../../services/animal.service';
import { RacaService } from '../../../services/raca.service';
import { AdotanteService } from '../../../services/adotante.service';
import { Animal } from '../../../models/animal.model';
import { Raca } from '../../../models/raca.model';
import { Adotante } from '../../../models/adotante.model';
import {
  ANIMAL_ESPECIES,
  ANIMAL_PORTES,
  ANIMAL_SEXOS,
  ANIMAL_STATUS,
  AnimalEspecie,
  AnimalPorte,
  AnimalSexo,
  AnimalStatus,
  CORES_PELAGEM,
  CORES_OLHOS,
} from '../../../models/enums';
import { mensagemDeErro } from '../../../shared/erro';

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

/** Filtra a lista de cores pelo texto digitado (case-insensitive); vazio mostra tudo. */
function filtrarCores(cores: string[], texto: string | null | undefined): string[] {
  const termo = (texto ?? '').trim().toLowerCase();
  if (!termo) return cores;
  return cores.filter((cor) => cor.toLowerCase().includes(termo));
}

@Component({
  selector: 'app-animal-form',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  templateUrl: './animal-form.html',
  styleUrl: './animal-form.scss',
})
export class AnimalForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly animalService = inject(AnimalService);
  private readonly racaService = inject(RacaService);
  private readonly adotanteService = inject(AdotanteService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly especies = ANIMAL_ESPECIES;
  readonly portes = ANIMAL_PORTES;
  readonly sexos = ANIMAL_SEXOS;
  readonly statusList = ANIMAL_STATUS;

  readonly todasRacas = signal<Raca[]>([]);
  readonly adotantes = signal<Adotante[]>([]);
  readonly carregando = signal(false);
  readonly salvando = signal(false);
  readonly animalId = signal<number | null>(null);
  readonly ehEdicao = computed(() => this.animalId() !== null);

  readonly form = this.fb.group({
    nome: ['', [Validators.required, Validators.maxLength(50)]],
    idade: [0, [Validators.required, Validators.min(0)]],
    especie: [null as AnimalEspecie | null, Validators.required],
    porte: [null as AnimalPorte | null, Validators.required],
    sexo: [null as AnimalSexo | null, Validators.required],
    status: ['DISPONIVEL' as AnimalStatus, Validators.required],
    castrado: [false],
    dataResgate: [null as Date | null, Validators.required],
    dataSaida: [null as Date | null],
    corOlhos: [''],
    corPelagem: [''],
    observacao: [''],
    racaId: [{ value: null as number | null, disabled: true }, Validators.required],
    adotanteId: [null as number | null],
  });

  private readonly especieSelecionada = toSignal(
    this.form.controls.especie.valueChanges,
    { initialValue: this.form.controls.especie.value },
  );
  readonly racasFiltradas = computed(() => {
    const especie = this.especieSelecionada();
    if (!especie) return [];
    return this.todasRacas().filter((r) => r.especie?.nome === especie);
  });

  // Sugestões filtradas pelo texto digitado (autocomplete); aceita valores fora da lista.
  private readonly corOlhosDigitada = toSignal(
    this.form.controls.corOlhos.valueChanges,
    { initialValue: this.form.controls.corOlhos.value },
  );
  private readonly corPelagemDigitada = toSignal(
    this.form.controls.corPelagem.valueChanges,
    { initialValue: this.form.controls.corPelagem.value },
  );
  readonly coresOlhosFiltradas = computed(() =>
    filtrarCores(CORES_OLHOS, this.corOlhosDigitada()),
  );
  readonly coresPelagemFiltradas = computed(() =>
    filtrarCores(CORES_PELAGEM, this.corPelagemDigitada()),
  );

  constructor() {
    // Quando a espécie muda: reseta raça, habilita/desabilita o select de raça.
    this.form.controls.especie.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((especie) => {
        const racaCtrl = this.form.controls.racaId;
        racaCtrl.setValue(null);
        if (especie) {
          racaCtrl.enable();
        } else {
          racaCtrl.disable();
        }
      });

    // Adotante é obrigatório apenas quando o status é ADOTADO (espelha a regra do backend).
    this.form.controls.status.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((status) => {
        const adotante = this.form.controls.adotanteId;
        if (status === 'ADOTADO') {
          adotante.addValidators(Validators.required);
        } else {
          adotante.removeValidators(Validators.required);
          adotante.setValue(null);
        }
        adotante.updateValueAndValidity();
      });
  }

  get ehAdotado(): boolean {
    return this.form.controls.status.value === 'ADOTADO';
  }

  ngOnInit(): void {
    this.carregarRacas();
    this.carregarAdotantes();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.animalId.set(Number(idParam));
      this.carregarAnimal(Number(idParam));
    }
  }

  private carregarRacas(): void {
    this.racaService.listar().subscribe({
      next: (dados) => this.todasRacas.set(dados),
      error: (err) => this.notificar(mensagemDeErro(err)),
    });
  }

  private carregarAdotantes(): void {
    this.adotanteService.listar().subscribe({
      next: (dados) => this.adotantes.set(dados),
      error: (err) => this.notificar(mensagemDeErro(err)),
    });
  }

  private carregarAnimal(id: number): void {
    this.carregando.set(true);
    this.animalService.buscarPorId(id).subscribe({
      next: (a) => {
        const especieAnimal = (a.raca as Raca)?.especie?.nome ?? null;
        this.form.patchValue({
          nome: a.nome,
          idade: a.idade,
          especie: especieAnimal,
          porte: a.porte,
          sexo: a.sexo,
          status: a.status,
          castrado: a.castrado,
          dataResgate: paraData(a.dataResgate),
          dataSaida: paraData(a.dataSaida),
          corOlhos: a.corOlhos ?? '',
          corPelagem: a.corPelagem ?? '',
          observacao: a.observacao ?? '',
          racaId: (a.raca as Raca)?.id ?? null,
          adotanteId: (a.adotante as { id: number })?.id ?? null,
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
    const payload: Animal = {
      nome: v.nome!,
      idade: v.idade!,
      porte: v.porte!,
      sexo: v.sexo!,
      status: v.status!,
      castrado: v.castrado!,
      dataResgate: paraIso(v.dataResgate)!,
      dataSaida: paraIso(v.dataSaida),
      corOlhos: v.corOlhos || null,
      corPelagem: v.corPelagem || null,
      observacao: v.observacao || null,
      raca: { id: v.racaId! },
      adotante:
        v.status === 'ADOTADO' && v.adotanteId ? { id: v.adotanteId } : null,
    };

    this.salvando.set(true);
    const id = this.animalId();
    const requisicao = id
      ? this.animalService.atualizar(id, payload)
      : this.animalService.salvar(payload);

    requisicao.subscribe({
      next: () => {
        this.salvando.set(false);
        this.notificar(id ? 'Animal atualizado.' : 'Animal cadastrado.');
        this.router.navigate(['/animais']);
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
