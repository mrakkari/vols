import { Component, EventEmitter, Input, Output, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlightService } from '../../services/flight.service';

interface PriceDate {
  date: string;
  price: number;
  day: string;
  isSelected: boolean;
}

@Component({
  selector: 'app-price-calendar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div class="flex items-center justify-center space-x-2 overflow-x-auto">
        <button
          *ngFor="let priceDate of priceDates()"
          (click)="selectDate(priceDate)"
          [class]="getPriceDateClasses(priceDate)"
          class="price-tab min-w-0 flex-shrink-0 px-4 py-3 rounded-lg text-center transition-all duration-200">
          <div class="text-xs font-medium mb-1">{{ priceDate.day }}</div>
          <div class="text-sm font-bold">{{ priceDate.price }}€</div>
        </button>
      </div>
    </div>
  `
})
export class PriceCalendarComponent implements OnInit {
  @Input() selectedDate?: string;
  @Output() dateSelected = new EventEmitter<string>();

  priceDates = signal<PriceDate[]>([]);

  constructor(private flightService: FlightService) {}

  ngOnInit() {
    this.loadPriceDates();
  }

  loadPriceDates() {
    this.flightService.getFlightsByDateRange().subscribe(data => {
      const priceDates = data.map(item => ({
        date: item.date,
        price: item.price,
        day: this.formatDay(item.date),
        isSelected: item.date === this.selectedDate
      }));
      
      this.priceDates.set(priceDates);
    });
  }

  selectDate(priceDate: PriceDate) {
    // Update selection state
    const updated = this.priceDates().map(pd => ({
      ...pd,
      isSelected: pd.date === priceDate.date
    }));
    
    this.priceDates.set(updated);
    this.dateSelected.emit(priceDate.date);
  }

  getPriceDateClasses(priceDate: PriceDate): string {
    let classes = 'cursor-pointer hover:bg-blue-50';
    
    if (priceDate.isSelected) {
      classes += ' selected bg-skyscanner-darkblue text-white';
    } else {
      classes += ' text-gray-700 bg-gray-50 hover:bg-blue-50';
    }

    return classes;
  }

  private formatDay(dateStr: string): string {
    const date = new Date(dateStr);
    const day = date.getDate();
    const monthNames = ['jan', 'fév', 'mar', 'avr', 'mai', 'jun',
                       'jul', 'aoû', 'sep', 'oct', 'nov', 'déc'];
    const month = monthNames[date.getMonth()];
    
    return `${day} ${month}`;
  }
}