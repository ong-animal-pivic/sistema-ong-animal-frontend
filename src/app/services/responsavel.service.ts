import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Responsavel, ResponsavelPayload } from '../models/responsavel.model';

@Injectable({ providedIn: 'root' })
export class ResponsavelService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/responsaveis`;

  listar(): Observable<Responsavel[]> {
    return this.http.get<Responsavel[]>(this.baseUrl);
  }

  buscarPorId(id: number): Observable<Responsavel> {
    return this.http.get<Responsavel>(`${this.baseUrl}/${id}`);
  }

  salvar(responsavel: ResponsavelPayload): Observable<Responsavel> {
    return this.http.post<Responsavel>(this.baseUrl, responsavel);
  }

  atualizar(id: number, responsavel: ResponsavelPayload): Observable<Responsavel> {
    return this.http.put<Responsavel>(`${this.baseUrl}/${id}`, responsavel);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
