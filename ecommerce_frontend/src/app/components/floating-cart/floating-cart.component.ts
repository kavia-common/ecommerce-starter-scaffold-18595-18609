import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, computed } from '@angular/core';
import { CartStoreService } from '../../services/cart-store.service';

@Component({
  selector: 'app-floating-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './floating-cart.component.html',
  styleUrl: './floating-cart.component.css',
})
export class FloatingCartComponent {
  @Output() openCart = new EventEmitter<void>();

  readonly itemCount = computed(() => this.cart.itemCount());

  constructor(private readonly cart: CartStoreService) {}
}
