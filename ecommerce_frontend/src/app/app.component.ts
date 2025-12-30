import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CartDrawerComponent } from './components/cart-drawer/cart-drawer.component';
import { FloatingCartComponent } from './components/floating-cart/floating-cart.component';
import { TopNavComponent } from './components/top-nav/top-nav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TopNavComponent, FloatingCartComponent, CartDrawerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  readonly cartOpen = signal(false);

  openCart() {
    this.cartOpen.set(true);
  }

  closeCart() {
    this.cartOpen.set(false);
  }
}
