import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { VoluntarioService } from '../../../services/voluntario.service';
import { Voluntario } from '../../../models/voluntario.model';
import { FREQUENCIA_LABELS } from '../../../models/enums';
import { mensagemDeErro } from '../../../shared/erro';
import { contemTexto } from '../../../shared/busca';

export interface VoluntarioSelecionarData {
  titulo: string;
  /** Voluntários que não devem ser oferecidos (ex.: já vinculados). */
  excluirIds: number[];
}

/** Lista de seleção de voluntários para vincular (a um responsável, a uma área…); fecha retornando o Voluntario escolhido. */
@Component({
  selector: 'app-voluntario-selecionar-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.titulo }}</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="campo-busca">
        <mat-icon matPrefix>search</mat-icon>
        <input
          matInput
          placeholder="Buscar por nome, profissão, frequência ou responsável..."
          [value]="termo()"
          (input)="termo.set($any($event.target).value)"
        />
        @if (termo()) {
          <button matSuffix mat-icon-button aria-label="Limpar busca" (click)="termo.set('')">
            <mat-icon>close</mat-icon>
          </button>
        }
      </mat-form-field>

      @if (carregando()) {
        <mat-progress-bar mode="indeterminate" />
      } @else if (erro()) {
        <p class="vazio">{{ erro() }}</p>
      } @else if (itensFiltrados().length === 0) {
        <p class="vazio">Nenhum voluntário disponível para vincular.</p>
      } @else {
        <ul class="lista">
          @for (v of itensFiltrados(); track v.id) {
            <li>
              <button type="button" class="item" (click)="selecionar(v)">
                <span class="item__nome">{{ v.nome }}</span>
                <span class="item__sub">
                  {{ rotuloFrequencia(v) }}@if (v.profissao) { · {{ v.profissao }} }
                </span>
                <span class="item__sub">Responsável atual: {{ v.responsavel.nome }}</span>
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
export class VoluntarioSelecionarDialog implements OnInit {
  readonly data = inject<VoluntarioSelecionarData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<VoluntarioSelecionarDialog, Voluntario>);
  private readonly voluntarioService = inject(VoluntarioService);

  readonly voluntarios = signal<Voluntario[]>([]);
  readonly carregando = signal(false);
  readonly erro = signal<string | null>(null);
  readonly termo = signal('');

  readonly itensFiltrados = computed(() => {
    const termo = this.termo();
    const excluir = new Set(this.data.excluirIds);
    return this.voluntarios().filter((v) => !excluir.has(v.id!) && this.corresponde(v, termo));
  });

  ngOnInit(): void {
    this.carregando.set(true);
    this.voluntarioService.listar().subscribe({
      next: (dados) => {
        this.voluntarios.set(dados);
        this.carregando.set(false);
      },
      error: (err) => {
        this.carregando.set(false);
        this.erro.set(mensagemDeErro(err));
      },
    });
  }

  selecionar(voluntario: Voluntario): void {
    this.dialogRef.close(voluntario);
  }

  rotuloFrequencia(voluntario: Voluntario): string {
    return FREQUENCIA_LABELS[voluntario.frequencia] ?? voluntario.frequencia;
  }

  private corresponde(voluntario: Voluntario, termo: string): boolean {
    return (
      contemTexto(voluntario.nome, termo) ||
      contemTexto(voluntario.profissao, termo) ||
      contemTexto(this.rotuloFrequencia(voluntario), termo) ||
      contemTexto(voluntario.responsavel?.nome, termo)
    );
  }
}
