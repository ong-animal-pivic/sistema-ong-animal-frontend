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
}
