import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Animal, AnimalPayload } from '../models/animal.model';

@Injectable({ providedIn: 'root' })
export class AnimalService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/animais`;

  listar(): Observable<Animal[]> {
    return this.http.get<Animal[]>(this.baseUrl);
  }

  buscarPorId(id: number): Observable<Animal> {
    return this.http.get<Animal>(`${this.baseUrl}/${id}`);
  }

  salvar(animal: AnimalPayload): Observable<Animal> {
    return this.http.post<Animal>(this.baseUrl, animal);
  }

  atualizar(id: number, animal: AnimalPayload): Observable<Animal> {
    return this.http.put<Animal>(`${this.baseUrl}/${id}`, animal);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
