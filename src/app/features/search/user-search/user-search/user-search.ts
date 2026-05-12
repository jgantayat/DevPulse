import { Component, inject, OnInit } from '@angular/core';
import { Userservice } from '../../../../core/services/userservice';
import { catchError, debounceTime, distinctUntilChanged, Observable, of, startWith, switchMap, tap } from 'rxjs';
import { User } from '../../../../core/models/user';
import { start } from 'repl';
import { AsyncPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
@Component({
  selector: 'app-user-search',
  imports: [ReactiveFormsModule, AsyncPipe],
  templateUrl: './user-search.html',
  styleUrl: './user-search.css',
})
export class UserSearch implements OnInit {

  private userService = inject(Userservice);

  searchControl = new FormControl('');
  isSearching = false;
  searchResult !: Observable<User[]>;

  ngOnInit() {
    this.searchResult = this.searchControl.valueChanges.pipe(

      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.isSearching = true),

      switchMap(query =>
        this.userService.searchUsers(query ?? '').pipe(
          catchError(() => of([]))
        )
      ),
      tap(() => this.isSearching = false)
    );
  }
}
