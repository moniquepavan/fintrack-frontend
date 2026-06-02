import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PaymentMethodService } from '../../core/services/payment-method.service';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { PaymentMethod } from '../../core/models/payment-method.model';

@Component({
  selector: 'app-payment-methods',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './payment-methods.component.html',
  styleUrl: './payment-methods.component.scss'
})
export class PaymentMethodsComponent implements OnInit {
  paymentMethods: PaymentMethod[] = [];
  loading = true;
  showForm = false;
  submitting = false;
  error = '';
  editingId: string | null = null;
  user: { name: string; email: string } | null = null;

  form: FormGroup;

  constructor(
    private paymentMethodService: PaymentMethodService,
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
    this.paymentMethodService.findAll().subscribe({
      next: (data) => { this.paymentMethods = data; this.loading = false; },
      error: () => this.loading = false
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.submitting = true;
    this.error = '';

    const action = this.editingId
      ? this.paymentMethodService.update(this.editingId, this.form.value)
      : this.paymentMethodService.create(this.form.value);

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

  edit(pm: PaymentMethod): void {
    this.editingId = pm.id;
    this.form.patchValue({ name: pm.name });
    this.showForm = true;
  }

  delete(id: string): void {
    if (!confirm('Excluir esta forma de pagamento?')) return;
    this.paymentMethodService.delete(id).subscribe({
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
