import { Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { AnimalService } from '../../../services/animal.service';
import { RacaService } from '../../../services/raca.service';
import { Animal } from '../../../models/animal.model';
import { Raca } from '../../../models/raca.model';
import { Responsavel } from '../../../models/responsavel.model';
import {
  AnimalEspecie,
  AnimalPorte,
  AnimalSexo,
  AnimalStatus,
  ANIMAL_ESPECIES,
  ANIMAL_PORTES,
  ANIMAL_SEXOS,
  ANIMAL_STATUS,
  ESPECIE_LABELS,
  STATUS_LABELS,
} from '../../../models/enums';
import { mensagemDeErro } from '../../../shared/erro';
import { contemTexto } from '../../../shared/busca';

/** Lista de seleção de animais para vincular ao responsável; fecha retornando o Animal escolhido. */
@Component({
  selector: 'app-animal-vincular-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    <h2 mat-dialog-title>Vincular animal a {{ data.responsavel.nome }}</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="campo-busca">
        <mat-icon matPrefix>search</mat-icon>
        <input
          matInput
          placeholder="Buscar por nome, espécie, raça ou status..."
          [value]="termo()"
          (input)="termo.set($any($event.target).value)"
        />
        @if (termo()) {
          <button matSuffix mat-icon-button aria-label="Limpar busca" (click)="termo.set('')">
            <mat-icon>close</mat-icon>
          </button>
        }
      </mat-form-field>

      <div class="filtros">
        <mat-form-field appearance="outline">
          <mat-label>Espécie</mat-label>
          <mat-select multiple [value]="filtroEspecie()" (selectionChange)="filtroEspecie.set($event.value)">
            @for (o of opcoesEspecie; track o.value) {
              <mat-option [value]="o.value">{{ o.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Raça</mat-label>
          <mat-select multiple [value]="filtroRacaId()" (selectionChange)="filtroRacaId.set($event.value)">
            @for (r of racasFiltradas(); track r.id) {
              <mat-option [value]="r.id">{{ r.nome }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <mat-select multiple [value]="filtroStatus()" (selectionChange)="filtroStatus.set($event.value)">
            @for (o of opcoesStatus; track o.value) {
              <mat-option [value]="o.value">{{ o.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Sexo</mat-label>
          <mat-select multiple [value]="filtroSexo()" (selectionChange)="filtroSexo.set($event.value)">
            @for (o of opcoesSexo; track o.value) {
              <mat-option [value]="o.value">{{ o.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Porte</mat-label>
          <mat-select multiple [value]="filtroPorte()" (selectionChange)="filtroPorte.set($event.value)">
            @for (o of opcoesPorte; track o.value) {
              <mat-option [value]="o.value">{{ o.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </div>

      @if (carregando()) {
        <mat-progress-bar mode="indeterminate" />
      } @else if (erro()) {
        <p class="vazio">{{ erro() }}</p>
      } @else if (itensFiltrados().length === 0) {
        <p class="vazio">Nenhum animal disponível para vincular.</p>
      } @else {
        <ul class="lista">
          @for (a of itensFiltrados(); track a.id) {
            <li>
              <button type="button" class="item" (click)="selecionar(a)">
                <span class="item__nome">{{ a.nome }}</span>
                <span class="item__sub">
                  {{ nomeEspecie(a) }} · {{ nomeRaca(a) }} · {{ rotuloStatus(a) }}
                </span>
                <span class="item__sub">Responsável atual: {{ a.responsavel.nome }}</span>
              </button>
            </li>
          }
        </ul>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button mat-dialog-close>Cancelar</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .campo-busca {
        width: 100%;
      }
      .filtros {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 0 12px;
      }
      .vazio {
        color: var(--brand-muted, #6b7785);
        text-align: center;
        padding: 16px 0;
      }
      .lista {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .item {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 2px;
        padding: 10px 14px;
        border: 1px solid rgba(0, 0, 0, 0.12);
        border-radius: 12px;
        background: transparent;
        cursor: pointer;
        font: inherit;
        text-align: left;
      }
      .item:hover,
      .item:focus-visible {
        background: rgba(0, 0, 0, 0.04);
      }
      .item__nome {
        font-weight: 600;
      }
      .item__sub {
        font-size: 0.85em;
        color: var(--brand-muted, #6b7785);
      }
    `,
  ],
})
export class AnimalVincularDialog implements OnInit {
  readonly data = inject<{ responsavel: Responsavel }>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<AnimalVincularDialog, Animal>);
  private readonly animalService = inject(AnimalService);
  private readonly racaService = inject(RacaService);

  readonly animais = signal<Animal[]>([]);
  readonly racas = signal<Raca[]>([]);
  readonly carregando = signal(false);
  readonly erro = signal<string | null>(null);
  readonly termo = signal('');

  readonly opcoesEspecie = ANIMAL_ESPECIES;
  readonly opcoesStatus = ANIMAL_STATUS;
  readonly opcoesSexo = ANIMAL_SEXOS;
  readonly opcoesPorte = ANIMAL_PORTES;

  readonly filtroEspecie = signal<AnimalEspecie[]>([]);
  readonly filtroRacaId = signal<number[]>([]);
  readonly filtroStatus = signal<AnimalStatus[]>([]);
  readonly filtroSexo = signal<AnimalSexo[]>([]);
  readonly filtroPorte = signal<AnimalPorte[]>([]);

  readonly racasFiltradas = computed(() => {
    const especies = this.filtroEspecie();
    return especies.length === 0
      ? this.racas()
      : this.racas().filter((r) => r.especie?.nome && especies.includes(r.especie.nome));
  });

  readonly itensFiltrados = computed(() => {
    const termo = this.termo();
    const especies = this.filtroEspecie();
    const racaIds = this.filtroRacaId();
    const status = this.filtroStatus();
    const sexos = this.filtroSexo();
    const portes = this.filtroPorte();

    return this.animais().filter(
      (a) =>
        a.responsavel?.id !== this.data.responsavel.id &&
        this.corresponde(a, termo) &&
        (especies.length === 0 ||
          (!!a.raca?.especie?.nome && especies.includes(a.raca.especie.nome))) &&
        (racaIds.length === 0 || (!!a.raca?.id && racaIds.includes(a.raca.id))) &&
        (status.length === 0 || status.includes(a.status)) &&
        (sexos.length === 0 || sexos.includes(a.sexo)) &&
        (portes.length === 0 || portes.includes(a.porte)),
    );
  });

  constructor() {
    effect(() => {
      const idsValidos = new Set(this.racasFiltradas().map((r) => r.id));
      const racaIds = this.filtroRacaId();
      const filtrados = racaIds.filter((id) => idsValidos.has(id));
      if (filtrados.length !== racaIds.length) {
        this.filtroRacaId.set(filtrados);
      }
    });
  }

  ngOnInit(): void {
    this.carregando.set(true);
    this.animalService.listar().subscribe({
      next: (dados) => {
        this.animais.set(dados);
        this.carregando.set(false);
      },
      error: (err) => {
        this.carregando.set(false);
        this.erro.set(mensagemDeErro(err));
      },
    });
    this.racaService.listar().subscribe({
      next: (dados) => this.racas.set(dados),
    });
  }

  selecionar(animal: Animal): void {
    this.dialogRef.close(animal);
  }

  nomeEspecie(animal: Animal): string {
    const nome = animal.raca?.especie?.nome;
    return nome ? ESPECIE_LABELS[nome] : '—';
  }

  nomeRaca(animal: Animal): string {
    return animal.raca?.nome ?? '—';
  }

  rotuloStatus(animal: Animal): string {
    return STATUS_LABELS[animal.status] ?? animal.status;
  }

  private corresponde(animal: Animal, termo: string): boolean {
    return (
      contemTexto(animal.nome, termo) ||
      contemTexto(this.nomeEspecie(animal), termo) ||
      contemTexto(this.nomeRaca(animal), termo) ||
      contemTexto(this.rotuloStatus(animal), termo)
    );
  }
}
