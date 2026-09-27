import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { VoluntarioService } from '../../../services/voluntario.service';
import { Disponibilidade, DisponibilidadePayload } from '../../../models/disponibilidade.model';
import {
  DIA_SEMANA_LABELS,
  DIAS_SEMANA,
  DiaSemana,
  TURNO_LABELS,
  TURNOS,
  Turno,
} from '../../../models/enums';
import { mensagemDeErro } from '../../../shared/erro';
import {
  DisponibilidadeDialog,
  DisponibilidadeDialogData,
} from '../disponibilidade-dialog/disponibilidade-dialog';

const chave = (dia: DiaSemana, turno: Turno): string => `${dia}|${turno}`;

/** Posição na grade (ordem dos enums), já que itens novos entram no fim da lista. */
const ordem = (d: Disponibilidade): number =>
  DIAS_SEMANA.findIndex((o) => o.value === d.diaSemana) * TURNOS.length +
  TURNOS.findIndex((o) => o.value === d.turno);

/**
 * Grade dia × turno da disponibilidade do voluntário. Cada célula liga/desliga
 * a combinação direto na API (POST/DELETE). A observação pertence ao vínculo e
 * a API não tem PUT: para trocá-la, remove-se e adiciona-se de novo.
 */
@Component({
  selector: 'app-disponibilidade-grade',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  templateUrl: './disponibilidade-grade.html',
  styleUrl: './disponibilidade-grade.scss',
})
export class DisponibilidadeGrade implements OnInit {
  private readonly service = inject(VoluntarioService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly voluntarioId = input.required<number>();

  readonly dias = DIAS_SEMANA;
  readonly turnos = TURNOS;

  readonly disponibilidades = signal<Disponibilidade[]>([]);
  readonly carregando = signal(false);
  /** Células com requisição em andamento, para evitar cliques duplos. */
  readonly salvando = signal<ReadonlySet<string>>(new Set());

  readonly porCelula = computed(
    () => new Map(this.disponibilidades().map((d) => [chave(d.diaSemana, d.turno), d])),
  );
  readonly comObservacao = computed(() =>
    this.disponibilidades()
      .filter((d) => d.observacao)
      .sort((a, b) => ordem(a) - ordem(b)),
  );
  readonly lotada = computed(
    () => this.disponibilidades().length === DIAS_SEMANA.length * TURNOS.length,
  );

  ngOnInit(): void {
    this.carregar();
  }

  private carregar(): void {
    this.carregando.set(true);
    this.service.listarDisponibilidades(this.voluntarioId()).subscribe({
      next: (dados) => {
        this.disponibilidades.set(dados);
        this.carregando.set(false);
      },
      error: (err) => {
        this.carregando.set(false);
        this.notificar(mensagemDeErro(err));
      },
    });
  }

  celula(dia: DiaSemana, turno: Turno): Disponibilidade | undefined {
    return this.porCelula().get(chave(dia, turno));
  }

  emAndamento(dia: DiaSemana, turno: Turno): boolean {
    return this.salvando().has(chave(dia, turno));
  }

  abreviar(rotulo: string): string {
    return rotulo.slice(0, 3);
  }

  descrever(dia: DiaSemana, turno: Turno): string {
    return `${DIA_SEMANA_LABELS[dia]} · ${TURNO_LABELS[turno]}`;
  }

  dica(dia: DiaSemana, turno: Turno): string {
    const d = this.celula(dia, turno);
    if (!d) return `${this.descrever(dia, turno)} — clique para marcar`;
    const obs = d.observacao ? ` (${d.observacao})` : '';
    return `${this.descrever(dia, turno)}${obs} — clique para desmarcar`;
  }

  alternar(dia: DiaSemana, turno: Turno): void {
    if (this.emAndamento(dia, turno)) return;
    const existente = this.celula(dia, turno);
    if (existente) {
      this.remover(existente);
    } else {
      this.adicionar({ diaSemana: dia, turno, observacao: null });
    }
  }

  abrirComObservacao(): void {
    const data: DisponibilidadeDialogData = { ocupadas: [...this.porCelula().keys()] };
    this.dialog
      .open(DisponibilidadeDialog, { data, width: '480px', maxWidth: '95vw' })
      .afterClosed()
      .subscribe((payload: DisponibilidadePayload | undefined) => {
        if (payload) this.adicionar(payload);
      });
  }

  remover(d: Disponibilidade): void {
    const k = chave(d.diaSemana, d.turno);
    this.marcarSalvando(k, true);
    this.service.removerDisponibilidade(this.voluntarioId(), d.id).subscribe({
      next: () => {
        this.marcarSalvando(k, false);
        this.disponibilidades.update((lista) => lista.filter((x) => x !== d));
      },
      error: (err) => {
        this.marcarSalvando(k, false);
        this.notificar(mensagemDeErro(err));
      },
    });
  }

  private adicionar(payload: DisponibilidadePayload): void {
    const k = chave(payload.diaSemana, payload.turno);
    this.marcarSalvando(k, true);
    this.service.adicionarDisponibilidade(this.voluntarioId(), payload).subscribe({
      next: (nova) => {
        this.marcarSalvando(k, false);
        this.disponibilidades.update((lista) => [...lista, nova]);
      },
      error: (err) => {
        this.marcarSalvando(k, false);
        this.notificar(mensagemDeErro(err));
      },
    });
  }

  private marcarSalvando(k: string, ativo: boolean): void {
    this.salvando.update((atual) => {
      const novo = new Set(atual);
      if (ativo) novo.add(k);
      else novo.delete(k);
      return novo;
    });
  }

  private notificar(mensagem: string): void {
    this.snackBar.open(mensagem, 'Fechar', { duration: 5000 });
  }
}
