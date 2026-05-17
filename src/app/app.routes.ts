import { Routes } from '@angular/router';
import { PostList } from './features/posts/post-list/post-list';
import { UserSearch } from './features/search/user-search/user-search/user-search';

export const routes: Routes = [
    {
        path: '', redirectTo: 'posts', pathMatch: 'full'
    },
    {
        path: 'posts', component: PostList
    },
    {
        path: 'users', loadComponent: () => import('./features/users/user-list/user-list/user-list').then(m => m.UserList)
    },
    {
        path: 'search', component: UserSearch
    },
    {
        path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard/dashboard').then(m => m.DashboardComponent)
    }

    
];
