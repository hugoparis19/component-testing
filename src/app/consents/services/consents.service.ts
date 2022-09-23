import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConsentValue } from '../models/consent.model';
import { BASE_API_URL } from '../models/token.model';

@Injectable()
export class NycConsentsService {
  baseUrl: string;

  constructor(private httpClient: HttpClient, @Inject(BASE_API_URL) baseApiUrl: string) {
    this.baseUrl = `${baseApiUrl}/consents`;
  }

  saveToCache$(consents: ConsentValue[]): Observable<{ [key: string]: unknown }> {
    return this.httpClient.post<{ consents: { [key: string]: unknown } }>(`${this.baseUrl}/save-to-cache`, { consents });
  }

  getFromCache$(): Observable<ConsentValue[]> {
    return this.httpClient.get<ConsentValue[]>(`${this.baseUrl}/cache`);
  }
}
