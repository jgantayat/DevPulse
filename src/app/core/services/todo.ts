import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { catchError, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Todo {

  private HttpClient = inject(HttpClient);
  private todoApiUrl = `${environment.jsonPlaceholderUrl}/todos';`
  completed: unknown;


  getAllTodos(): Observable<Todo[]> {
    return this.HttpClient.get<Todo[]>(this.todoApiUrl).pipe(
      catchError(() => of([]))
    );
  }
}
