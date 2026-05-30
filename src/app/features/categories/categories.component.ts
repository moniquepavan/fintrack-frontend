import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CategoryService } from '../../core/services/category.service';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { Category } from '../../core/models/category.model';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  loading = true;
  showForm = false;
  submitting = false;
  error = '';
  editingId: string | null = null;
  user: { name: string; email: string } | null = null;

  form: FormGroup;

  colors = [
    '#639922','#E24B4A','#EF9F27','#378ADD','#7F77DD',
    '#1D9E75','#E4709A','#6B7280','#854F0B','#185FA5'
  ];

  constructor(
    private categoryService: CategoryService,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.user = this.authService.getUser();
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      color: ['#639922', Validators.required],
      icon: ['tag', Validators.required],
      budget: [null]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.findAll().subscribe({
      next: (data) => { this.categories = data; this.loading = false; },
      error: () => this.loading = false
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.submitting = true;
    this.error = '';

    const request = this.form.value;

    const action = this.editingId
      ? this.categoryService.update(this.editingId, request)
      : this.categoryService.create(request);

    action.subscribe({
      next: () => {
        this.form.reset({ color: '#639922', icon: 'tag' });
        this.showForm = false;
        this.editingId = null;
        this.submitting = false;
        this.loadCategories();
      },
      error: (err) => {
        this.error = err.error?.message || 'Erro ao salvar categoria';
        this.submitting = false;
      }
    });
  }

  edit(cat: Category): void {
    this.editingId = cat.id;
    this.form.patchValue({
      name: cat.name,
      color: cat.color,
      icon: cat.icon,
      budget: cat.budget
    });
    this.showForm = true;
  }

  delete(id: string): void {
    if (!confirm('Excluir esta categoria?')) return;
    this.categoryService.delete(id).subscribe({
      next: () => this.loadCategories()
    });
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.form.reset({ color: '#639922', icon: 'tag' });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}