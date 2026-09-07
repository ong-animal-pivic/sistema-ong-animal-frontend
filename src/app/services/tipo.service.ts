import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Tipo } from '../models/tipo.model';

@Injectable({ providedIn: 'root' })
export class TipoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/tipos`;

  listar(): Observable<Tipo[]> {
    return this.http.get<Tipo[]>(this.baseUrl);
  }

  buscarPorId(id: number): Observable<Tipo> {
    return this.http.get<Tipo>(`${this.baseUrl}/${id}`);
  }
}
