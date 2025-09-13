import { Component, signal, OnInit } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { CalendarComponent } from './lib/shared/calendar/calendar.component';
import { LocationSearchComponent } from './lib/shared/location-search/location-search.component';
import { PriceCalendarComponent } from './components/price-calendar/price-calendar.component';
import { FlightCardComponent } from './components/flight-card/flight-card.component';
import { FilterSidebarComponent } from './components/filter-sidebar/filter-sidebar.component';
import { FlightService, Flight, SearchFilters } from './services/flight.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CalendarComponent,
    LocationSearchComponent,
    PriceCalendarComponent,
    FlightCardComponent,
    FilterSidebarComponent
  ],
  providers: [FlightService],
  template: `
    <!-- Hero Section (shown when no search has been performed) -->
    <div *ngIf="!hasSearched()" class="hero-section flex items-center justify-center px-4">
      <div class="w-full max-w-7xl">
        <h1 class="hero-title">Find the best flight deals anywhere</h1>
        
        <!-- Search Form -->
        <div class="search-form-container">
          <!-- Trip Type Selector -->
          <div class="mb-6">
            <button class="trip-type-selector">
              <span>Return</span>
              <svg class="ml-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
              </svg>
            </button>
          </div>

          <!-- Search Fields -->
          <div class="search-grid">
            <!-- From -->
            <div class="search-field">
              <label>From</label>
              <app-location-search
                placeholder="Tunisia (TN)"
                (airportSelected)="onDepartureSelected($event)">
              </app-location-search>
            </div>

            <!-- Swap Button -->
            <div class="swap-button-container">
              <button (click)="swapLocations()" class="swap-button">
                <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                </svg>
              </button>
            </div>

            <!-- To -->
            <div class="search-field">
              <label>To</label>
              <app-location-search
                placeholder="Country, city or airport"
                (airportSelected)="onDestinationSelected($event)">
              </app-location-search>
            </div>

            <!-- Depart -->
            <div class="search-field">
              <label>Depart</label>
              <button
                (click)="toggleCalendar()"
                class="w-full px-4 py-4 border border-gray-300 rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                {{ selectedDate() || '18/09/2025' }}
              </button>
              
              <!-- Calendar Popup -->
              <div *ngIf="showCalendar()" class="absolute top-full left-0 mt-2 z-50">
                <app-calendar
                  [initialDate]="initialDateForCalendar"
                  (dateSelected)="onCalendarDateSelected($event)"
                  (cancelled)="hideCalendar()">
                </app-calendar>
              </div>
            </div>

            <!-- Return -->
            <div class="search-field">
              <label>Return</label>
              <button class="w-full px-4 py-4 border border-gray-300 rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                25/09/2025
              </button>
            </div>

            <!-- Travelers -->
            <div class="search-field">
              <label>Travellers and cabin class</label>
              <button class="w-full px-4 py-4 border border-gray-300 rounded-lg text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                1 Adult, Economy
              </button>
            </div>
          </div>

          <!-- Search Options -->
          <div class="search-options">
            <div class="checkbox-option">
              <input type="checkbox" id="nearby-from">
              <label for="nearby-from">Add nearby airports</label>
            </div>
            <div class="checkbox-option">
              <input type="checkbox" id="nearby-to">
              <label for="nearby-to">Add nearby airports</label>
            </div>
            <div class="checkbox-option">
              <input type="checkbox" id="direct-flights">
              <label for="direct-flights">Direct flights</label>
            </div>
          </div>

          <!-- Search Button -->
          <div class="flex justify-end">
            <button 
              (click)="searchFlights()"
              [disabled]="loading()"
              class="search-button">
              <span *ngIf="!loading()">Search</span>
              <span *ngIf="loading()" class="flex items-center">
                <div class="loading-spinner mr-2"></div>
                Searching...
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Results Header (shown after search) -->
    <div *ngIf="hasSearched()" class="results-header">
      <div class="max-w-7xl mx-auto px-4 flex items-center">
        <button class="mr-4 p-2 rounded-full hover:bg-blue-800 transition-colors">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"/>
          </svg>
        </button>
        <h1 class="text-lg font-medium">Paris (Tous) - Djerba (DJE) • 1 adulte, Économie</h1>
      </div>
    </div>

    <!-- Price Calendar -->
    <div *ngIf="hasSearched()" class="max-w-7xl mx-auto px-4 py-6">
      <app-price-calendar 
        [selectedDate]="searchParams().date_depart"
        (dateSelected)="onDateSelected($event)">
      </app-price-calendar>
    </div>

    <!-- Main Content -->
    <div *ngIf="hasSearched()" class="max-w-7xl mx-auto px-4 pb-12">
      <div class="flex gap-8">
        <!-- Sidebar -->
        <aside class="w-80 flex-shrink-0">
          <app-filter-sidebar (filtersChanged)="onFiltersChanged($event)"></app-filter-sidebar>
        </aside>

        <!-- Main Content -->
        <main class="flex-1">
            <!-- Sort Options -->
            <div class="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
              <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-600">Trier par</span>
                <select 
                  [(ngModel)]="sortBy" 
                  (change)="onSortChange()"
                  class="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="meilleur">Le meilleur</option>
                  <option value="prix">Le moins cher</option>
                  <option value="temps">Le plus rapide</option>
                </select>
              </div>

              <button 
                (click)="searchFlights()"
                [disabled]="loading()"
                class="btn-primary px-6 py-2 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                <span *ngIf="!loading()">Rechercher</span>
                <span *ngIf="loading()" class="flex items-center">
                  <div class="loading-spinner mr-2"></div>
                  Recherche...
                </span>
              </button>
            </div>

          <!-- Sort Tabs -->
          <div class="flex space-x-1 mb-6">
            <button
              (click)="setSortTab('meilleur')"
              [class]="getSortTabClasses('meilleur')"
              class="flex-1 px-6 py-4 rounded-l-lg text-center transition-all duration-200">
              <div class="font-semibold">Le meilleur</div>
              <div class="text-xl font-bold">79€</div>
              <div class="text-sm opacity-75">2h 55</div>
            </button>

            <button
              (click)="setSortTab('prix')"
              [class]="getSortTabClasses('prix')"
              class="flex-1 px-6 py-4 text-center transition-all duration-200">
              <div class="font-semibold">Le moins cher</div>
              <div class="text-xl font-bold">79€</div>
              <div class="text-sm opacity-75">2h 55</div>
            </button>

            <button
              (click)="setSortTab('temps')"
              [class]="getSortTabClasses('temps')"
              class="flex-1 px-6 py-4 rounded-r-lg text-center transition-all duration-200">
              <div class="font-semibold">Le plus rapide</div>
              <div class="text-xl font-bold">96€</div>
              <div class="text-sm opacity-75">2h 50</div>
            </button>
          </div>

          <!-- Loading State -->
          <div *ngIf="loading()" class="flex justify-center py-12">
            <div class="loading-spinner"></div>
          </div>

          <!-- Flight Results -->
          <div *ngIf="!loading() && flights().length > 0" class="space-y-4">
            <app-flight-card 
              *ngFor="let flight of flights()" 
              [flight]="flight">
            </app-flight-card>
          </div>

          <!-- No Results -->
          <div *ngIf="!loading() && flights().length === 0 && hasSearched()" 
               class="text-center py-12">
            <div class="text-gray-500 text-lg mb-2">Aucun vol trouvé</div>
            <div class="text-gray-400">Essayez de modifier vos critères de recherche</div>
          </div>

          <!-- Side Panel -->
          <div class="fixed top-0 right-0 w-96 h-full bg-white shadow-xl p-6 border-l border-gray-200">
            <h3 class="text-xl font-bold text-gray-900 mb-4">Vous avez trouvé votre vol ?</h3>
            <p class="text-gray-600 mb-6">Trouvez maintenant votre hôtel</p>
            <p class="text-sm text-gray-500 mb-6">Accédez aux résultats des meilleurs sites d'hôtels ici, sur Skyscanner.</p>
            
            <button class="w-full bg-skyscanner-darkblue text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-800 transition-colors mb-8">
              Découvrir les hôtels
            </button>

            <div class="bg-gray-50 rounded-lg p-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-gray-600">ven. 7 mars-sam. 8 mars</span>
                <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V4z"/>
                  </svg>
                </div>
              </div>
              
              <h4 class="font-semibold text-gray-900 mb-2">Location de voiture à Djerba</h4>
              <p class="text-sm text-gray-600 mb-4">Ne vous arrêtez pas aux vols, trouvez également de bonnes affaires sur les véhicules.</p>
              
              <div class="bg-blue-600 rounded-lg p-4 text-white relative overflow-hidden">
                <div class="relative z-10">
                  <h5 class="font-semibold mb-1">Location de voiture dès</h5>
                  <div class="text-xl font-bold">24€ par jour</div>
                </div>
                <button class="absolute bottom-4 right-4 w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
                <!-- Car image background would go here -->
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .price-tab.selected {
      background: linear-gradient(135deg, #1e3a8a 0%, #0770e3 100%);
      color: white;
    }
  `]
})
export class App implements OnInit {
  // Signals for state management
  flights = signal<Flight[]>([]);
  loading = signal(false);
  hasSearched = signal(false);
  showCalendar = signal(false);
  selectedDate = signal<string | null>(null);
  sortBy = 'meilleur';
  activeTab = signal('meilleur');

  searchParams = signal<SearchFilters>({
    date_depart: '2024-03-07',
    ville_depart: 'ORY',
    ville_arrivee: 'DJE',
    tri: 'meilleur'
  });

  // Computed signal for initial date
  get initialDateForCalendar(): Date | undefined {
    const dateStr = this.selectedDate();
    return dateStr ? new Date(dateStr) : undefined;
  }

  constructor(private flightService: FlightService) {}

  ngOnInit() {
    // Set initial date
    this.selectedDate.set('2024-03-07');
    // Load initial flights
    this.searchFlights();
  }

  searchFlights() {
    this.loading.set(true);
    this.hasSearched.set(true);

    this.flightService.searchFlights(this.searchParams()).subscribe({
      next: (flights) => {
        this.flights.set(flights);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Search error:', error);
        this.loading.set(false);
      }
    });
  }

  onDepartureSelected(airport: any) {
    const params = this.searchParams();
    params.ville_depart = airport.code;
    this.searchParams.set({ ...params });
  }

  onDestinationSelected(airport: any) {
    const params = this.searchParams();
    params.ville_arrivee = airport.code;
    this.searchParams.set({ ...params });
  }

  onDateSelected(date: string) {
    this.selectedDate.set(date);
    const params = this.searchParams();
    params.date_depart = date;
    this.searchParams.set({ ...params });
    this.searchFlights();
  }

  onCalendarDateSelected(date: string) {
    this.selectedDate.set(date);
    const params = this.searchParams();
    params.date_depart = date;
    this.searchParams.set({ ...params });
    this.hideCalendar();
  }

  toggleCalendar() {
    this.showCalendar.set(!this.showCalendar());
  }

  hideCalendar() {
    this.showCalendar.set(false);
  }

  swapLocations() {
    const params = this.searchParams();
    const temp = params.ville_depart;
    params.ville_depart = params.ville_arrivee;
    params.ville_arrivee = temp;
    this.searchParams.set({ ...params });
  }

  onSortChange() {
    const params = this.searchParams();
    params.tri = this.sortBy as any;
    this.searchParams.set({ ...params });
    this.searchFlights();
  }

  setSortTab(tab: string) {
    this.activeTab.set(tab);
    this.sortBy = tab;
    this.onSortChange();
  }

  getSortTabClasses(tab: string): string {
    const base = 'cursor-pointer';
    if (this.activeTab() === tab) {
      return `${base} selected bg-blue-900 text-white`;
    }
    return `${base} text-gray-700 bg-white hover:bg-gray-50`;
  }

  onFiltersChanged(filters: any) {
    // Handle filter changes
    console.log('Filters changed:', filters);
    this.searchFlights();
  }
}

bootstrapApplication(App, {
  providers: [
    provideHttpClient()
  ]
});