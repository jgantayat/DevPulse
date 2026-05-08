import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';
import { Post } from '../models/post';

@Injectable({
  providedIn: 'root',
})
export class PostService {

  private httpClient = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/posts`;

  getAllPosts(): Observable<Post[]> {
    return this.httpClient.get<Post[]>(this.apiUrl);
  }

}
