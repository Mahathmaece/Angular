import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HeaderMail } from './mail.model';
import { environment } from 'environments/environment';
const apiUrl = environment.apiUrl + '/mails';
@Injectable({
  providedIn: 'root'
})
export class MailListService {

  constructor(private http: HttpClient) { }

  getMailsByFolder(folderId: number, pageNumber: number, rowsOfPage: number): Observable<HeaderMail> {
    return this.http.get<HeaderMail>(apiUrl + `/folder/${folderId}/${pageNumber}/${rowsOfPage}`);
  }
}
