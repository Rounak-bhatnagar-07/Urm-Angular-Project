import { Component, HostListener, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {
  protected readonly title = signal('spaces-by-nora');
  cursorX = 0;
  cursorY = 0;
  isInteractive = false;

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    this.cursorX = event.clientX;
    this.cursorY = event.clientY;

    const target = event.target as HTMLElement | null;
    this.isInteractive = !!target?.closest(
      'a, button, input, textarea, select, .btn-primary, .btn-secondary, .nav-btn, .service-card, .portfolio-card, .brand, .custom-cursor'
    );
  }
}
