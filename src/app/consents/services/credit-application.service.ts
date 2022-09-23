import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BASE_API_URL } from '../models/token.model';

@Injectable()
export class CreditApplicationService {
  baseUrl: string;

  constructor(private httpClient: HttpClient, @Inject(BASE_API_URL) baseApiUrl: string) {
    this.baseUrl = `${baseApiUrl}/creditapplication`;
  }

  saveFields$(fields: { [key: string]: unknown }): Observable<{ [key: string]: unknown }> {
    console.log(this.baseUrl);
    return this.httpClient.put<{ fields: { [key: string]: unknown } }>(`${this.baseUrl}/fields`, { fields });
  }
}
