import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { AreaService } from '../../../services/area.service';
import { Area, VoluntarioResumo } from '../../../models/area.model';
import { Voluntario } from '../../../models/voluntario.model';
import { AreaDeleteDialog } from '../area-delete-dialog/area-delete-dialog';
import { AreaDesvincularDialog } from '../area-desvincular-dialog/area-desvincular-dialog';
import {
  VoluntarioSelecionarData,
  VoluntarioSelecionarDialog,
} from '../../voluntarios/voluntario-selecionar-dialog/voluntario-selecionar-dialog';
import { mensagemDeErro } from '../../../shared/erro';

@Component({
  selector: 'app-area-detail',
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTableModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  templateUrl: './area-detail.html',
  styleUrl: './area-detail.scss',
})
export class AreaDetail implements OnInit {
  private readonly service = inject(AreaService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly colunasVoluntarios = ['voluntario', 'acoes'];

  readonly area = signal<Area | null>(null);
  readonly carregando = signal(false);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.router.navigate(['/areas']);
      return;
    }
    this.carregar(Number(idParam));
  }

  private carregar(id: number): void {
    this.carregando.set(true);
    this.service.buscarPorId(id).subscribe({
      next: (a) => {
        this.area.set(a);
        this.carregando.set(false);
      },
      error: (err) => {
        this.carregando.set(false);
        this.notificar(mensagemDeErro(err));
        this.router.navigate(['/areas']);
      },
    });
  }

  confirmarExclusao(area: Area): void {
    const ref = this.dialog.open(AreaDeleteDialog, {
      data: { nome: area.nome, qtdVoluntarios: area.voluntarios.length },
      width: '420px',
    });
    ref.afterClosed().subscribe((confirmado) => {
      if (confirmado) this.excluir(area);
    });
  }

  private excluir(area: Area): void {
    this.service.excluir(area.id).subscribe({
      next: () => {
        this.notificar(`"${area.nome}" foi excluída.`);
        this.router.navigate(['/areas']);
      },
      error: (err) => this.notificar(mensagemDeErro(err)),
    });
  }

  abrirVinculoVoluntario(area: Area): void {
    const data: VoluntarioSelecionarData = {
      titulo: `Vincular voluntário a ${area.nome}`,
      excluirIds: area.voluntarios.map((v) => v.id),
    };
    this.dialog
      .open(VoluntarioSelecionarDialog, { data, width: '520px', maxWidth: '95vw' })
      .afterClosed()
      .subscribe((voluntario: Voluntario | undefined) => {
        if (voluntario) this.vincular(area, voluntario);
      });
  }

  private vincular(area: Area, voluntario: Voluntario): void {
    this.service.vincularVoluntario(area.id, voluntario.id!).subscribe({
      next: () => {
        this.notificar(`"${voluntario.nome}" foi vinculado a ${area.nome}.`);
        this.carregar(area.id);
      },
      error: (err) => this.notificar(mensagemDeErro(err)),
    });
  }

  confirmarDesvinculo(area: Area, voluntario: VoluntarioResumo): void {
    const ref = this.dialog.open(AreaDesvincularDialog, {
      data: { voluntario: voluntario.nome, area: area.nome },
      width: '440px',
    });
    ref.afterClosed().subscribe((confirmado) => {
      if (confirmado) this.desvincular(area, voluntario);
    });
  }

  private desvincular(area: Area, voluntario: VoluntarioResumo): void {
    this.service.desvincularVoluntario(area.id, voluntario.id).subscribe({
      next: () => {
        this.notificar(`"${voluntario.nome}" foi desvinculado de ${area.nome}.`);
        this.carregar(area.id);
      },
      error: (err) => this.notificar(mensagemDeErro(err)),
    });
  }

  private notificar(mensagem: string): void {
    this.snackBar.open(mensagem, 'Fechar', { duration: 5000 });
  }
}
