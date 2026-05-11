import { Routes } from '@angular/router';
import { PostList } from './features/posts/post-list/post-list';

export const routes: Routes = [
    {
        path: '', redirectTo: 'posts', pathMatch: 'full'
    },
    {
        path: 'posts', component: PostList
    },
    {
        path: 'users', loadComponent: () => import('./features/users/user-list/user-list/user-list').then(m => m.UserList)
    }
    
];
