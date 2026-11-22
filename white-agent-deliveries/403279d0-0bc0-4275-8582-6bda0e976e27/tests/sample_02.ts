import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ReservationService } from './reservation.service';

describe('ReservationService', () => {
  let service: ReservationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ReservationService]
    });
    service = TestBed.inject(ReservationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should fetch available vehicles for given period', () => {
    const mockResponse = [{ id: 1, placa: 'ABC1234', situacao: 'ativo' }];
    service.getAvailability('2024-06-10T10:00', '2024-06-10T12:00').subscribe(vehicles => {
      expect(vehicles.length).toBe(1);
      expect(vehicles[0].placa).toBe('ABC1234');
    });

    const req = httpMock.expectOne('/api/reservations/availability?start=2024-06-10T10:00&end=2024-06-10T12:00');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  afterEach(() => {
    httpMock.verify();
  });
});