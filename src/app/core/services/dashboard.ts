
import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Userservice } from './userservice';
import { Todo } from './todo';
import { PostService } from './postservice';
import { catchError, mergeMap } from 'rxjs/operators';
import { forkJoin, Observable, of, map } from 'rxjs';
import { DashboardData } from '../models/todo';
import { environment } from '../../../environments/environment.development';
import { Post } from '../models/post';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class Dashboard {

  private HttpClient = inject(HttpClient);
  private userService = inject(Userservice);
  private todosService = inject(Todo);
  private postService = inject(PostService);



  getdashBoardData(): Observable<DashboardData>{
    return forkJoin({
      posts: this.postService.getAllPosts().pipe(catchError(() => of([]))),
      users: this.userService.getUsers().pipe(catchError(() => of([]))),
      todos: this.todosService.getAllTodos().pipe(catchError(() => of([])))
    }).pipe(
      map(({ posts, users, todos }) => {
        return {
          totalPosts: posts.length,
          totalUsers: users.length,
          completedTodos: todos.filter(todo => todo.completed).length,
          pendingTodos: todos.filter(todo => !todo.completed).length
        };
      })
    );
  }



  getUsersWithPostCount(): Observable<(User & {postCount: number})[]> {

    return this.userService.getUsers().pipe(
      mergeMap(users =>
        forkJoin(
          users.map(user =>
            this.HttpClient.get<Post[]>(`${environment.jsonPlaceholderUrl}/users/${user.id}/posts`).pipe(
              map(posts => ({...user, postCount: posts.length})),
              catchError(() => of({...user, postCount: 0}))
              )
          )
        )
      )
    );
     
  }
}