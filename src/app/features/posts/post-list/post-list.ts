import { Component, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Post } from '../../../core/models/post';
import { PostService } from '../../../core/services/postservice';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-post-list',
  imports: [AsyncPipe],
  templateUrl: './post-list.html',
  styleUrl: './post-list.css',
})
export class PostList {
    private postService = inject(PostService);

  // Using async pipe — no manual subscribe, no memory leak
  posts$: Observable<Post[]> = this.postService.getAllPosts();
  
}
