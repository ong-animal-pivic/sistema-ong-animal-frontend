import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Voluntario, VoluntarioPayload } from '../models/voluntario.model';
import { Disponibilidade, DisponibilidadePayload } from '../models/disponibilidade.model';

@Injectable({ providedIn: 'root' })
export class VoluntarioService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/voluntarios`;

  listar(): Observable<Voluntario[]> {
    return this.http.get<Voluntario[]>(this.baseUrl);
  }

  buscarPorId(id: number): Observable<Voluntario> {
    return this.http.get<Voluntario>(`${this.baseUrl}/${id}`);
  }

  salvar(voluntario: VoluntarioPayload): Observable<Voluntario> {
    return this.http.post<Voluntario>(this.baseUrl, voluntario);
  }

  atualizar(id: number, voluntario: VoluntarioPayload): Observable<Voluntario> {
    return this.http.put<Voluntario>(`${this.baseUrl}/${id}`, voluntario);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Disponibilidade é sub-recurso do voluntário (sem gerenciamento independente no backend).
  listarDisponibilidades(id: number): Observable<Disponibilidade[]> {
    return this.http.get<Disponibilidade[]>(`${this.baseUrl}/${id}/disponibilidades`);
  }

  adicionarDisponibilidade(
    id: number,
    disponibilidade: DisponibilidadePayload,
  ): Observable<Disponibilidade> {
    return this.http.post<Disponibilidade>(`${this.baseUrl}/${id}/disponibilidades`, disponibilidade);
  }

  removerDisponibilidade(id: number, disponibilidadeId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/disponibilidades/${disponibilidadeId}`);
  }
}
