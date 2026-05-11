import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { filter, Observable, tap, map, catchError, of } from 'rxjs';
import { User, UserApiResponse } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class Userservice {

  private http = inject(HttpClient);
  private usersApiUrl = `${environment.jsonPlaceholderUrl}/users`;;



  getUsers(): Observable<User[]> {
    return this.http.get<UserApiResponse[]>(this.usersApiUrl).pipe(
      tap(raw => console.log('Fetched users from API:', raw)),
      map(users =>
        users.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          city: u.address.city,
          company: u.company.name
        }))
      ),
      filter(users => users.length > 0),
      catchError(err => {
        console.error('Error fetching users:', err);
        return of([]);
      })
    );
  }

  getuserById(id: number): Observable<User> {
    return this.http.get<UserApiResponse>(`${this.usersApiUrl}/${id}`).pipe(
      map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        city: u.address.city,
        company: u.company.name
      })),
      catchError(err => {
        console.error('Error fetching user:', err);
        return of({} as User);
      })
    );
  }
}
