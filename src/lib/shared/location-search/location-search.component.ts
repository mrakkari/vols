import { Component, EventEmitter, Input, Output, OnInit, signal, computed, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  flag: string;
}

@Component({
  selector: 'app-location-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative">
      <div class="relative">
        <input
          #searchInput
          [(ngModel)]="searchTerm"
          (input)="onSearchChange()"
          (focus)="showDropdown()"
          [placeholder]="placeholder"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm">
        
        <div class="absolute right-3 top-1/2 transform -translate-y-1/2">
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
      </div>

      <!-- Dropdown -->
      <div 
        *ngIf="isDropdownVisible()" 
        class="location-dropdown absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 z-50">
        
        <div *ngIf="filteredAirports().length === 0 && searchTerm" 
             class="px-4 py-3 text-gray-500 text-sm">
          Aucun résultat trouvé
        </div>

        <button
          *ngFor="let airport of filteredAirports()"
          (click)="selectAirport(airport)"
          class="w-full flex items-center px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 text-left transition-colors">
          
          <div class="mr-3 text-lg">{{ airport.flag }}</div>
          <div class="mr-3">
            <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V4z"></path>
            </svg>
          </div>
          <div class="flex-1">
            <div class="font-medium text-gray-900">{{ airport.name }} ({{ airport.code }})</div>
            <div class="text-sm text-gray-500">{{ airport.country }}</div>
          </div>
        </button>
      </div>
    </div>
  `
})
export class LocationSearchComponent implements OnInit {
  @Input() placeholder = 'Pays, ville ou aéroport';
  @Input() selectedAirport?: Airport;
  @Output() airportSelected = new EventEmitter<Airport>();

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  constructor(private elementRef: ElementRef) {}

  searchTerm = '';
  dropdownVisible = signal(false);

  airports: Airport[] = [
    { code: 'TN', name: 'Tunisie', city: 'Tunisie', country: 'Tunisie', flag: '🇹🇳' },
    { code: 'TUN', name: 'Tunis Carthage', city: 'Tunis', country: 'Tunisie', flag: '🇹🇳' },
    { code: 'DJE', name: 'Djerba-Zarzis', city: 'Djerba', country: 'Tunisie', flag: '🇹🇳' },
    { code: 'MIR', name: 'Monastir', city: 'Monastir', country: 'Tunisie', flag: '🇹🇳' },
    { code: 'NBE', name: 'Enfidha', city: 'Enfidha', country: 'Tunisie', flag: '🇹🇳' },
    { code: 'SFA', name: 'Sfax El Maou', city: 'Sfax', country: 'Tunisie', flag: '🇹🇳' },
    { code: 'TOE', name: 'Tozeur', city: 'Tozeur', country: 'Tunisie', flag: '🇹🇳' },
    { code: 'TBJ', name: 'Tabarka', city: 'Tabarka', country: 'Tunisie', flag: '🇹🇳' },
    { code: 'ORY', name: 'Orly', city: 'Paris', country: 'France', flag: '🇫🇷' },
    { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France', flag: '🇫🇷' },
    { code: 'LYS', name: 'Lyon-Saint-Exupéry', city: 'Lyon', country: 'France', flag: '🇫🇷' },
    { code: 'MRS', name: 'Marseille Provence', city: 'Marseille', country: 'France', flag: '🇫🇷' },
    { code: 'NCE', name: 'Nice Côte d\'Azur', city: 'Nice', country: 'France', flag: '🇫🇷' }
  ];

  filteredAirports = computed(() => {
    if (!this.searchTerm) return this.airports;
    
    const term = this.searchTerm.toLowerCase();
    return this.airports.filter(airport => 
      airport.name.toLowerCase().includes(term) ||
      airport.city.toLowerCase().includes(term) ||
      airport.code.toLowerCase().includes(term) ||
      airport.country.toLowerCase().includes(term)
    );
  });

  isDropdownVisible = computed(() => this.dropdownVisible());

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.hideDropdown();
    }
  }

  ngOnInit() {
    if (this.selectedAirport) {
      this.searchTerm = `${this.selectedAirport.name} (${this.selectedAirport.code})`;
    }
  }

  onSearchChange() {
    this.dropdownVisible.set(true);
  }

  showDropdown() {
    this.dropdownVisible.set(true);
  }

  hideDropdown() {
    setTimeout(() => {
      this.dropdownVisible.set(false);
    }, 150);
  }

  selectAirport(airport: Airport) {
    this.searchTerm = `${airport.name} (${airport.code})`;
    this.dropdownVisible.set(false);
    this.airportSelected.emit(airport);
  }
}