import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { Post, PostPayload } from '../../../core/models/post';
import { PostService } from '../../../core/services/postservice';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { exhaustMap, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-post-form',
  imports: [ReactiveFormsModule],
  templateUrl: './post-form.html',
  styleUrl: './post-form.css',
})

export class PostForm implements OnInit {

  @Input() editPost: Post | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();


  private fb = inject(FormBuilder);
  private postService = inject(PostService);
  private submitTrigger = new Subject<PostPayload>();

  isLoading = false;
  errorMessage = '';

  form = this.fb.group({
    title: ['', Validators.required, Validators.minLength(5)],
    body: ['', Validators.required]
    // userId: [1, Validators.required]
  });

  constructor(){
    this.submitTrigger.pipe(
      exhaustMap(payload =>{
        this.isLoading = true;
        this.errorMessage='';

        const call = this.editPost
        ? this.postService.updatePost(this.editPost.id, payload)
        : this.postService.createPost(payload);

        return call;
      }),
      takeUntilDestroyed()
    ). subscribe({
      next: () => {
        this.isLoading = false;
        this.form.reset();
        this.saved.emit();
      },
      error: (err)=>{
        this.isLoading= false;
        this.errorMessage = 'Failed to save, Please try again';
      }
    });
  }

  ngOnInit(): void {
    if (this.editPost) {
      this.form.patchValue({
        title: this.editPost.title,
        body: this.editPost.body
      });
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      return;
    }

    const payload = {
      title: this.form.value.title!,
      body: this.form.value.body!,
      userId: 1
    };

    this.isLoading = true;
    this.errorMessage = '';

    const calls = this.editPost
      ? this.postService.updatePost(this.editPost.id, payload)
      : this.postService.createPost(payload);

    calls.subscribe({
      next: () => {
        this.isLoading = false;
        this.form.reset();
        this.saved.emit();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'An error occurred while saving the post. Please try again.';
        console.error('Error saving post:', err);
      }
    });

  }

}