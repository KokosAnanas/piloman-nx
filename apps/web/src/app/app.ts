/**
 * Корневой компонент приложения piloman.ru
 *
 * @see https://angular.dev/guide/standalone-components — Standalone Components
 */

import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'piloman';
}
