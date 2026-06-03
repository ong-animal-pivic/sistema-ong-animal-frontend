import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Raca } from '../models/raca.model';

@Injectable({ providedIn: 'root' })
export class RacaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/racas`;

  listar(): Observable<Raca[]> {
    return this.http.get<Raca[]>(this.baseUrl);
  }

  buscarPorId(id: number): Observable<Raca> {
    return this.http.get<Raca>(`${this.baseUrl}/${id}`);
  }

  salvar(raca: { nome: string; especie: { id: number } }): Observable<Raca> {
    return this.http.post<Raca>(this.baseUrl, raca);
  }

  atualizar(id: number, raca: { nome: string; especie: { id: number } }): Observable<Raca> {
    return this.http.put<Raca>(`${this.baseUrl}/${id}`, raca);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
