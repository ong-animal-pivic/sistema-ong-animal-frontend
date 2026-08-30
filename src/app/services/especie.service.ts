import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Especie } from '../models/especie.model';

@Injectable({ providedIn: 'root' })
export class EspecieService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/especies`;

  listar(): Observable<Especie[]> {
    return this.http.get<Especie[]>(this.baseUrl);
  }
}
