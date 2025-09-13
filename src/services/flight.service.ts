import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';

export interface Flight {
  id: string;
  ville_depart: string;
  ville_arrivee: string;
  date_depart: string;
  date_arrivee: string;
  prix: number;
  temps_trajet: string;
  compagnie: string;
  heure_depart: string;
  heure_arrivee: string;
  direct: boolean;
  bagages: boolean;
  escales: number;
  offres: number;
}

export interface SearchFilters {
  date_depart?: string;
  ville_depart?: string;
  ville_arrivee?: string;
  tri?: 'prix' | 'temps' | 'meilleur';
  escales?: string[];
  heures_depart?: { min: number; max: number };
  duree_voyage?: { min: number; max: number };
}

@Injectable({
  providedIn: 'root'
})
export class FlightService {
  private apiUrl = '/api/vols';
  
  // Mock data for development
  private mockFlights: Flight[] = [
    {
      id: '1',
      ville_depart: 'ORY',
      ville_arrivee: 'DJE',
      date_depart: '2024-03-07',
      date_arrivee: '2024-03-07',
      prix: 79,
      temps_trajet: '2h 55',
      compagnie: 'Transavia France',
      heure_depart: '12:35',
      heure_arrivee: '15:30',
      direct: true,
      bagages: false,
      escales: 0,
      offres: 13
    },
    {
      id: '2',
      ville_depart: 'ORY',
      ville_arrivee: 'DJE',
      date_depart: '2024-03-07',
      date_arrivee: '2024-03-07',
      prix: 79,
      temps_trajet: '2h 55',
      compagnie: 'Transavia France',
      heure_depart: '14:55',
      heure_arrivee: '17:50',
      direct: true,
      bagages: false,
      escales: 0,
      offres: 13
    },
    {
      id: '3',
      ville_depart: 'CDG',
      ville_arrivee: 'DJE',
      date_depart: '2024-03-07',
      date_arrivee: '2024-03-07',
      prix: 96,
      temps_trajet: '2h 50',
      compagnie: 'Nouvelair',
      heure_depart: '13:05',
      heure_arrivee: '15:55',
      direct: true,
      bagages: false,
      escales: 0,
      offres: 12
    }
  ];

  loading = signal(false);

  constructor(private http: HttpClient) {}

  searchFlights(filters: SearchFilters): Observable<Flight[]> {
    this.loading.set(true);

    // For development, return mock data
    return of(this.mockFlights).pipe(
      delay(1000) // Simulate API delay
    );

    // Uncomment for real API integration
    /*
    let params = new HttpParams();
    
    if (filters.date_depart) params = params.set('date_depart', filters.date_depart);
    if (filters.ville_depart) params = params.set('ville_depart', filters.ville_depart);
    if (filters.ville_arrivee) params = params.set('ville_arrivee', filters.ville_arrivee);
    if (filters.tri) params = params.set('tri', filters.tri);

    return this.http.get<Flight[]>(this.apiUrl, { params });
    */
  }

  getFlightsByDateRange(): Observable<{ date: string; price: number }[]> {
    // Mock date range data
    const dateRangeData = [
      { date: '2024-03-04', price: 94 },
      { date: '2024-03-05', price: 94 },
      { date: '2024-03-06', price: 94 },
      { date: '2024-03-07', price: 79 },
      { date: '2024-03-08', price: 106 },
      { date: '2024-03-09', price: 85 },
      { date: '2024-03-10', price: 82 }
    ];

    return of(dateRangeData).pipe(delay(500));
  }
}