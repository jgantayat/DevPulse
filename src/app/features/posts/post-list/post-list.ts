import { Post } from './../../../core/models/post';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PostService } from '../../../core/services/postservice';
import { PostForm } from '../post-form/post-form';

@Component({
  selector: 'app-post-list',
  imports: [PostForm],
  templateUrl: './post-list.html',
  styleUrl: './post-list.css',
})
export class PostList implements OnInit {
  postService = inject(PostService);
  private destroyRef = inject(DestroyRef);

  showForm = false;
  editingPost: Post | null = null;
  deleteError='';

  ngOnInit(): void {
     this.postService.getAllPosts();
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
    this.postService.getAllPosts(); // Refresh list after save
  }
  
  onFormCancelled(id: number){  
    if(!confirm('delete this post?')){
      return;
    }
    this.postService.deletePost(id).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.postService.getAllPosts();
      },
      error: (error) => {
        console.error('Error deleting post:', error);
      }
    });
  }
}
