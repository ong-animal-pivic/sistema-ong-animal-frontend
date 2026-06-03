import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Adotante } from '../models/adotante.model';

@Injectable({ providedIn: 'root' })
export class AdotanteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/adotantes`;

  listar(): Observable<Adotante[]> {
    return this.http.get<Adotante[]>(this.baseUrl);
  }

  buscarPorId(id: number): Observable<Adotante> {
    return this.http.get<Adotante>(`${this.baseUrl}/${id}`);
  }

  salvar(adotante: Adotante): Observable<Adotante> {
    return this.http.post<Adotante>(this.baseUrl, adotante);
  }

  atualizar(id: number, adotante: Adotante): Observable<Adotante> {
    return this.http.put<Adotante>(`${this.baseUrl}/${id}`, adotante);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
