import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, computed } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartStoreService } from '../../services/cart-store.service';

@Component({
  selector: 'app-top-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './top-nav.component.html',
  styleUrl: './top-nav.component.css',
})
export class TopNavComponent {
  @Output() openCart = new EventEmitter<void>();

  readonly itemCount = computed(() => this.cart.itemCount());

  constructor(private readonly cart: CartStoreService) {}
}
