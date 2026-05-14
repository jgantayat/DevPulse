import { Post } from './../../../core/models/post';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { PostService } from '../../../core/services/postservice';
import { AsyncPipe } from '@angular/common';
import { PostForm } from '../post-form/post-form';

@Component({
  selector: 'app-post-list',
  imports: [AsyncPipe, PostForm],
  templateUrl: './post-list.html',
  styleUrl: './post-list.css',
})
export class PostList {
  private postService = inject(PostService);
  private destroyRef = inject(DestroyRef);

  // Using async pipe — no manual subscribe, no memory leak
  posts$: Observable<Post[]> = this.postService.getAllPosts();
  showForm = false;
  editingPost: Post | null = null;
  deleteError='';

  constructor(){
    
  }

  openCreatForm(){
    this.editingPost = null;
    this.showForm = true;
  }

  openEditForm(Post: Post){
    this.editingPost=Post;
    this.showForm = true;
  }

  onFormSaved(){
    this.showForm = false;
    this.posts$ = this.postService.getAllPosts(); // Refresh list after save
  }
  
  onFormCancelled(id: number){  
    if(!confirm('delete this post?')){
      return;
    }
    this.postService.deletePost(id).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.posts$ = this.postService.getAllPosts();
      },
      error: (error) => {
        console.error('Error deleting post:', error);
      }
    });
  }
}
