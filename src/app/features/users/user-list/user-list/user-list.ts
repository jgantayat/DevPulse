import { Component, inject } from '@angular/core';
import { Userservice } from '../../../../core/services/userservice';
import { Observable } from 'rxjs';
import { User } from '../../../../core/models/user';
import { AsyncPipe } from '@angular/common';
@Component({
  selector: 'app-user-list',
  imports: [AsyncPipe],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css',
})
export class UserList {
  private userService =inject(Userservice);


  users: Observable<User[]> = this.userService.getUsers();
  
}
