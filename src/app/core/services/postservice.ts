import { HttpClient, HttpHeaders } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';
import { Post, PostPayload } from '../models/post';

@Injectable({
  providedIn: 'root',
})
export class PostService {

  private httpClient = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/posts`;
  private headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  //Signal based state
  private _posts = signal<Post[]>([]);
  private _isLoading = signal(false);
  private _error = signal<string | null>(null);

  //Read-only signal
  readonly posts = this._posts.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  //computed: derived state
  readonly postCount = computed(() => this._posts().length);
  readonly hasPosts = computed(() => this._posts().length > 0);
  readonly myPosts = computed(() => this._posts().filter(p => p.userId === 1));

  getAllPosts(): Observable<Post[]> {
    return this.httpClient.get<Post[]>(this.apiUrl);
  }

  getPostById(id: number): Observable<Post> {
    return this.httpClient.get<Post>(`${this.apiUrl}/${id}`);
  }

  createPost(payload: PostPayload): Observable<Post> {
    return this.httpClient.post<Post>(this.apiUrl, payload, {
      headers: this.headers,
    });
  }

  updatePost(id: number, payload: PostPayload): Observable<Post> {
    return this.httpClient.put<Post>(`${this.apiUrl}/${id}`, payload, {
      headers: this.headers,
    });
  }

  deletePost(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/${id}`);
  }

}
