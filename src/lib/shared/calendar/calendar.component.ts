import { Component, EventEmitter, Input, Output, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CalendarDay {
  date: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  fullDate: Date;
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="calendar-popup bg-white rounded-2xl p-6 shadow-xl max-w-sm mx-auto">
      <!-- Month/Year Selectors -->
      <div class="flex justify-between items-center mb-6">
        <select 
          [value]="currentMonth()"
          (change)="onMonthChange($event)"
          class="bg-gray-100 border-0 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option *ngFor="let month of months; let i = index" [value]="i">
            {{ month }}
          </option>
        </select>
        
        <select 
          [value]="currentYear()"
          (change)="onYearChange($event)"
          class="bg-gray-100 border-0 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option *ngFor="let year of availableYears" [value]="year">
            {{ year }}
          </option>
        </select>
      </div>

      <!-- Calendar Grid -->
      <div class="calendar-grid">
        <!-- Day Headers -->
        <div class="grid grid-cols-7 mb-4">
          <div *ngFor="let day of dayHeaders" 
               class="text-center text-xs font-medium text-gray-400 py-2">
            {{ day }}
          </div>
        </div>

        <!-- Calendar Days -->
        <div class="grid grid-cols-7 gap-1">
          <button
            *ngFor="let day of calendarDays()"
            (click)="selectDate(day)"
            [class]="getDayClasses(day)"
            [disabled]="!day.isCurrentMonth"
            class="h-10 w-10 flex items-center justify-center text-sm font-medium rounded-lg transition-all duration-200 hover:bg-gray-100">
            {{ day.date }}
          </button>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-between mt-8 pt-4 border-t border-gray-100">
        <button 
          (click)="onCancel()"
          class="px-6 py-2 text-gray-600 font-medium hover:text-gray-800 transition-colors">
          Back
        </button>
        <button 
          (click)="onApply()"
          class="px-8 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
          Apply
        </button>
      </div>
    </div>
  `,
  styles: [`
    .calendar-grid {
      user-select: none;
    }
  `]
})
export class CalendarComponent implements OnInit {
  @Input() initialDate?: Date;
  @Output() dateSelected = new EventEmitter<string>();
  @Output() cancelled = new EventEmitter<void>();

  currentDate = signal(new Date());
  selectedDate = signal<Date | null>(null);
  currentMonth = signal(new Date().getMonth());
  currentYear = signal(new Date().getFullYear());

  months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  dayHeaders = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  availableYears = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i);

  calendarDays = computed(() => {
    return this.generateCalendarDays();
  });

  ngOnInit() {
    if (this.initialDate) {
      this.selectedDate.set(this.initialDate);
      this.currentMonth.set(this.initialDate.getMonth());
      this.currentYear.set(this.initialDate.getFullYear());
    }
  }

  generateCalendarDays(): CalendarDay[] {
    const year = this.currentYear();
    const month = this.currentMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const today = new Date();
    const selected = this.selectedDate();

    // Get the first Monday of the calendar view
    const startDate = new Date(firstDay);
    const dayOfWeek = (firstDay.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
    startDate.setDate(firstDay.getDate() - dayOfWeek);

    const days: CalendarDay[] = [];
    const currentDate = new Date(startDate);

    // Generate 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = this.isSameDay(currentDate, today);
      const isSelected = selected ? this.isSameDay(currentDate, selected) : false;

      days.push({
        date: currentDate.getDate(),
        isCurrentMonth,
        isToday,
        isSelected,
        fullDate: new Date(currentDate)
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  selectDate(day: CalendarDay) {
    if (!day.isCurrentMonth) return;
    this.selectedDate.set(day.fullDate);
  }

  getDayClasses(day: CalendarDay): string {
    let classes = '';
    
    if (!day.isCurrentMonth) {
      classes += 'text-gray-300 cursor-not-allowed ';
    } else {
      classes += 'text-gray-900 cursor-pointer hover:bg-blue-50 ';
    }

    if (day.isToday) {
      classes += 'text-blue-600 font-bold ';
    }

    if (day.isSelected) {
      classes += 'bg-red-500 text-white hover:bg-red-600 ';
    }

    return classes.trim();
  }

  onMonthChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.currentMonth.set(parseInt(target.value));
  }

  onYearChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.currentYear.set(parseInt(target.value));
  }

  onApply() {
    const selected = this.selectedDate();
    if (selected) {
      const formattedDate = this.formatDate(selected);
      this.dateSelected.emit(formattedDate);
    }
  }

  onCancel() {
    this.cancelled.emit();
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}