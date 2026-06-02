import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CardService } from '../../core/services/card.service';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { Card } from '../../core/models/card.model';

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './cards.component.html',
  styleUrl: './cards.component.scss'
})
export class CardsComponent implements OnInit {
  cards: Card[] = [];
  loading = true;
  showForm = false;
  submitting = false;
  error = '';
  editingId: string | null = null;
  user: { name: string; email: string } | null = null;

  form: FormGroup;

  constructor(
    private cardService: CardService,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.user = this.authService.getUser();
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.cardService.findAll().subscribe({
      next: (data) => { this.cards = data; this.loading = false; },
      error: () => this.loading = false
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.submitting = true;
    this.error = '';

    const action = this.editingId
      ? this.cardService.update(this.editingId, this.form.value)
      : this.cardService.create(this.form.value);

    action.subscribe({
      next: () => {
        this.cancelForm();
        this.load();
      },
      error: (err: { error?: { message?: string } }) => {
        this.error = err.error?.message || 'Erro ao salvar';
        this.submitting = false;
      }
    });
  }

  edit(card: Card): void {
    this.editingId = card.id;
    this.form.patchValue({ name: card.name });
    this.showForm = true;
  }

  delete(id: string): void {
    if (!confirm('Excluir este cartão?')) return;
    this.cardService.delete(id).subscribe({
      next: () => this.load()
    });
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingId = null;
    this.submitting = false;
    this.form.reset();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
