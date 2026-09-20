import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { ResponsavelService } from '../../../services/responsavel.service';
import { Responsavel } from '../../../models/responsavel.model';
import { TIPO_RESPONSAVEL_LABELS } from '../../../models/enums';
import { mensagemDeErro } from '../../../shared/erro';
import { contemTexto } from '../../../shared/busca';

/** Lista de seleção de responsáveis para trocar o vínculo do voluntário; fecha retornando o Responsavel escolhido. */
@Component({
  selector: 'app-voluntario-vincular-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  template: `
    <h2 mat-dialog-title>Trocar responsável de {{ data.voluntario.nome }}</h2>
    <mat-dialog-content>
      <mat-form-field appearance="outline" class="campo-busca">
        <mat-icon matPrefix>search</mat-icon>
        <input
          matInput
          placeholder="Buscar por nome, tipo ou UF..."
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
        <p class="vazio">Nenhum responsável disponível para vincular.</p>
      } @else {
        <ul class="lista">
          @for (r of itensFiltrados(); track r.id) {
            <li>
              <button type="button" class="item" (click)="selecionar(r)">
                <span class="item__nome">{{ r.nome }}</span>
                <span class="item__sub">{{ tipoLabels[r.tipo.nome] }} · {{ r.endereco.estado }}</span>
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
export class VoluntarioVincularDialog implements OnInit {
  readonly data = inject<{ voluntario: { nome: string }; responsavelAtualId?: number | null }>(
    MAT_DIALOG_DATA,
  );
  private readonly dialogRef = inject(MatDialogRef<VoluntarioVincularDialog, Responsavel>);
  private readonly responsavelService = inject(ResponsavelService);

  readonly tipoLabels = TIPO_RESPONSAVEL_LABELS;

  readonly responsaveis = signal<Responsavel[]>([]);
  readonly carregando = signal(false);
  readonly erro = signal<string | null>(null);
  readonly termo = signal('');

  readonly itensFiltrados = computed(() => {
    const termo = this.termo();
    return this.responsaveis().filter(
      (r) => r.id !== this.data.responsavelAtualId && this.corresponde(r, termo),
    );
  });

  ngOnInit(): void {
    this.carregando.set(true);
    this.responsavelService.listar().subscribe({
      next: (dados) => {
        this.responsaveis.set(dados);
        this.carregando.set(false);
      },
      error: (err) => {
        this.carregando.set(false);
        this.erro.set(mensagemDeErro(err));
      },
    });
  }

  selecionar(responsavel: Responsavel): void {
    this.dialogRef.close(responsavel);
  }

  private corresponde(responsavel: Responsavel, termo: string): boolean {
    return (
      contemTexto(responsavel.nome, termo) ||
      contemTexto(this.tipoLabels[responsavel.tipo?.nome], termo) ||
      contemTexto(responsavel.endereco?.estado, termo)
    );
  }
}
