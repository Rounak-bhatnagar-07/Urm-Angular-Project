import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  PLATFORM_ID,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HeroComponent } from './components/hero/hero.component';
import{ TestimonialComponent } from './components/testimonial/testimonial.component';
import{PortfolioComponent} from './components/portfolio/portfolio.component';
import{ContactComponent,} from './components/contact/contact.component';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroComponent, TestimonialComponent, PortfolioComponent, ContactComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home implements AfterViewInit {
  @ViewChildren('counter') counters!: QueryList<ElementRef<HTMLElement>>;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit(): void {
    // requestAnimationFrame only exists in the browser; skip on the server.
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.counters.forEach((counter, index) => {
      const el = counter.nativeElement;
      const target = Number(el.getAttribute('data-target') ?? '0');
      const suffix = el.getAttribute('data-suffix') ?? '';
      const duration = 1400 + index * 200;

      this.animateCounter(el, target, suffix, duration);
    });
  }

  /** Animates a number from 0 to `target` with an ease-out curve. */
  private animateCounter(
    element: HTMLElement,
    target: number,
    suffix: string,
    duration: number,
  ): void {
    const startTime = performance.now();

    const step = (currentTime: number): void => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);

      element.textContent = `${current}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = `${target}${suffix}`;
      }
    };

    requestAnimationFrame(step);
  }
}