import { HttpClient, HttpHeaders } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { Observable, tap } from 'rxjs';
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

  constructor(){
    effect(()=>{
      console.log('[PostService] posts count:', this._posts().length);
      console.log('[PostService] loading:', this._isLoading());
    });
  }
  getAllPosts(): void {
    this._isLoading.set(true);
    this._error.set(null);
    this.httpClient.get<Post[]>(this.apiUrl).subscribe({
      next: (posts) =>{
        this._posts.set(posts);
        this._isLoading.set(false);
      },
      error: (err)=>{
        this._error.set('Failed to load Posts.');
        this._isLoading.set(false);
      }
    });
  }

  getPostById(id: number): Observable<Post> {
    return this.httpClient.get<Post>(`${this.apiUrl}/${id}`);
  }

  createPost(payload: PostPayload): Observable<Post> {
    return this.httpClient.post<Post>(this.apiUrl, payload, {
      headers: this.headers,
    }).pipe(
      tap(newPost =>{
        this._posts.update(current => [...current, newPost]);
      })
    );
  }

  updatePost(id: number, payload: PostPayload): Observable<Post> {
    return this.httpClient.put<Post>(`${this.apiUrl}/${id}`, payload, {
      headers: this.headers,
    }).pipe(
      tap(updated => {
        this._posts.update(current =>
          current.map(p => p.id === id ? updated : p)
        );
      })
    );
  }

  deletePost(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/${id}`)
    .pipe(
      tap(()=>{
        this._posts.update(current => current.filter(p => p.id !== id));
      })
    );
  }

}
