import { Component, ElementRef, OnInit, ViewChild, inject, signal, computed, effect } from '@angular/core';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AnimalService } from '../../../services/animal.service';
import { RacaService } from '../../../services/raca.service';
import { EspecieService } from '../../../services/especie.service';
import { AdotanteService } from '../../../services/adotante.service';
import { ResponsavelService } from '../../../services/responsavel.service';
import { AnimalPayload } from '../../../models/animal.model';
import { Raca } from '../../../models/raca.model';
import { Especie } from '../../../models/especie.model';
import { Adotante } from '../../../models/adotante.model';
import { Responsavel } from '../../../models/responsavel.model';
import {
  ANIMAL_PORTES,
  ANIMAL_SEXOS,
  ANIMAL_STATUS,
  AnimalPorte,
  AnimalSexo,
  AnimalStatus,
  CORES_PELAGEM,
  CORES_OLHOS,
  ESPECIE_LABELS,
} from '../../../models/enums';
import { RacaQuickCreateDialog } from '../../racas/raca-quick-create-dialog/raca-quick-create-dialog';
import { ResponsavelQuickCreateDialog } from '../../responsaveis/responsavel-quick-create-dialog/responsavel-quick-create-dialog';
import { mensagemDeErro } from '../../../shared/erro';
import { scrollParaPrimeiroErro } from '../../../shared/scroll-para-erro';
import { MascaraDataDirective } from '../../../shared/mascara-data.directive';
import { formatarIdade } from '../../../shared/idade';

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
    MatTooltipModule,
    MatDialogModule,
    MascaraDataDirective,
  ],
  templateUrl: './animal-form.html',
  styleUrl: './animal-form.scss',
})
export class AnimalForm implements OnInit {
  @ViewChild('formEl') private readonly formEl?: ElementRef<HTMLFormElement>;

  private readonly fb = inject(FormBuilder);
  private readonly animalService = inject(AnimalService);
  private readonly racaService = inject(RacaService);
  private readonly especieService = inject(EspecieService);
  private readonly adotanteService = inject(AdotanteService);
  private readonly responsavelService = inject(ResponsavelService);
  private readonly dialog = inject(MatDialog);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly portes = ANIMAL_PORTES;
  readonly sexos = ANIMAL_SEXOS;
  readonly statusList = ANIMAL_STATUS;
  readonly especieLabels = ESPECIE_LABELS;

  readonly racas = signal<Raca[]>([]);
  readonly especies = signal<Especie[]>([]);
  readonly adotantes = signal<Adotante[]>([]);
  readonly responsaveis = signal<Responsavel[]>([]);
  readonly carregando = signal(false);
  readonly salvando = signal(false);
  readonly animalId = signal<number | null>(null);
  readonly ehEdicao = computed(() => this.animalId() !== null);

  readonly form = this.fb.group({
    nome: ['', [Validators.required, Validators.maxLength(50)]],
    idadeMeses: [0, [Validators.required, Validators.min(0)]],
    porte: [null as AnimalPorte | null, Validators.required],
    sexo: [null as AnimalSexo | null, Validators.required],
    status: ['DISPONIVEL' as AnimalStatus, Validators.required],
    castrado: [false],
    dataResgate: [null as Date | null, Validators.required],
    dataSaida: [null as Date | null],
    corOlhos: [''],
    corPelagem: [''],
    observacao: [''],
    especieId: [null as number | null],
    racaId: [null as number | null, Validators.required],
    adotanteId: [null as number | null],
    responsavelId: [null as number | null, Validators.required],
  });

  // Espécie é só um filtro de UI para a Raça; não faz parte do AnimalPayload.
  readonly especieIdSelecionada = toSignal(
    this.form.controls.especieId.valueChanges,
    { initialValue: this.form.controls.especieId.value },
  );
  readonly racasFiltradas = computed(() => {
    const especieId = this.especieIdSelecionada();
    return especieId === null
      ? []
      : this.racas().filter((r) => r.especie?.id === especieId);
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

  // Hint de conversão meses→anos, atualizado em tempo real conforme o usuário digita.
  private readonly idadeMesesDigitada = toSignal(
    this.form.controls.idadeMeses.valueChanges,
    { initialValue: this.form.controls.idadeMeses.value },
  );
  readonly idadeConvertida = computed(() => {
    const meses = this.idadeMesesDigitada();
    if (meses == null || meses < 12) return null;
    return formatarIdade(meses);
  });

  constructor() {
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

    // Se a raça selecionada deixa de pertencer à espécie filtrada, limpa a seleção.
    effect(() => {
      const idsValidos = new Set(this.racasFiltradas().map((r) => r.id));
      const racaId = this.form.controls.racaId.value;
      if (racaId !== null && !idsValidos.has(racaId)) {
        this.form.controls.racaId.setValue(null);
      }
    });
  }

  get ehAdotado(): boolean {
    return this.form.controls.status.value === 'ADOTADO';
  }

  ngOnInit(): void {
    this.carregarRacas();
    this.carregarEspecies();
    this.carregarAdotantes();
    this.carregarResponsaveis();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.animalId.set(Number(idParam));
      this.carregarAnimal(Number(idParam));
    }
  }

  private carregarRacas(): void {
    this.racaService.listar().subscribe({
      next: (dados) => this.racas.set(dados),
      error: (err) => this.notificar(mensagemDeErro(err)),
    });
  }

  private carregarEspecies(): void {
    this.especieService.listar().subscribe({
      next: (dados) => this.especies.set(dados),
      error: (err) => this.notificar(mensagemDeErro(err)),
    });
  }

  private carregarAdotantes(): void {
    this.adotanteService.listar().subscribe({
      next: (dados) => this.adotantes.set(dados),
      error: (err) => this.notificar(mensagemDeErro(err)),
    });
  }

  private carregarResponsaveis(): void {
    this.responsavelService.listar().subscribe({
      next: (dados) => this.responsaveis.set(dados),
      error: (err) => this.notificar(mensagemDeErro(err)),
    });
  }

  private carregarAnimal(id: number): void {
    this.carregando.set(true);
    this.animalService.buscarPorId(id).subscribe({
      next: (a) => {
        this.form.patchValue({
          nome: a.nome,
          idadeMeses: a.idadeMeses,
          porte: a.porte,
          sexo: a.sexo,
          status: a.status,
          castrado: a.castrado,
          dataResgate: paraData(a.dataResgate),
          dataSaida: paraData(a.dataSaida),
          corOlhos: a.corOlhos ?? '',
          corPelagem: a.corPelagem ?? '',
          observacao: a.observacao ?? '',
          especieId: (a.raca as Raca)?.especie?.id ?? null,
          racaId: (a.raca as Raca)?.id ?? null,
          adotanteId: (a.adotante as { id: number })?.id ?? null,
          responsavelId: (a.responsavel as Responsavel)?.id ?? null,
        });
        this.carregando.set(false);
      },
      error: (err) => {
        this.carregando.set(false);
        this.notificar(mensagemDeErro(err));
      },
    });
  }

  abrirCadastroRapidoDeRaca(): void {
    const ref = this.dialog.open(RacaQuickCreateDialog, {
      data: { especieIdSugerido: this.form.controls.especieId.value },
      width: '480px',
    });
    ref.afterClosed().subscribe((novaRaca?: Raca) => {
      if (!novaRaca) return;
      this.racas.update((rs) => [...rs, novaRaca]);
      this.form.patchValue({
        especieId: novaRaca.especie?.id ?? null,
        racaId: novaRaca.id,
      });
    });
  }

  abrirCadastroRapidoDeResponsavel(): void {
    const ref = this.dialog.open(ResponsavelQuickCreateDialog, { width: '560px' });
    ref.afterClosed().subscribe((novoResponsavel?: Responsavel) => {
      if (!novoResponsavel) return;
      this.responsaveis.update((rs) => [...rs, novoResponsavel]);
      this.form.patchValue({ responsavelId: novoResponsavel.id });
    });
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      scrollParaPrimeiroErro(this.formEl?.nativeElement ?? null);
      return;
    }

    const v = this.form.getRawValue();
    const payload: AnimalPayload = {
      nome: v.nome!,
      idadeMeses: v.idadeMeses!,
      porte: v.porte!,
      sexo: v.sexo!,
      status: v.status!,
      castrado: v.castrado!,
      dataResgate: paraIso(v.dataResgate)!,
      dataSaida: paraIso(v.dataSaida),
      corOlhos: v.corOlhos || null,
      corPelagem: v.corPelagem || null,
      observacao: v.observacao || null,
      racaId: v.racaId!,
      adotanteId: v.status === 'ADOTADO' && v.adotanteId ? v.adotanteId : null,
      responsavelId: v.responsavelId!,
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
