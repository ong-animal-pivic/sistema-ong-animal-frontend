import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Area, AreaPayload } from '../models/area.model';

@Injectable({ providedIn: 'root' })
export class AreaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/areas`;

  listar(): Observable<Area[]> {
    return this.http.get<Area[]>(this.baseUrl);
  }

  buscarPorId(id: number): Observable<Area> {
    return this.http.get<Area>(`${this.baseUrl}/${id}`);
  }

  salvar(area: AreaPayload): Observable<Area> {
    return this.http.post<Area>(this.baseUrl, area);
  }

  atualizar(id: number, area: AreaPayload): Observable<Area> {
    return this.http.put<Area>(`${this.baseUrl}/${id}`, area);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  vincularVoluntario(areaId: number, voluntarioId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${areaId}/voluntarios/${voluntarioId}`, null);
  }

  desvincularVoluntario(areaId: number, voluntarioId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${areaId}/voluntarios/${voluntarioId}`);
  }
}
