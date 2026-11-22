package com.whitefleet.service;

import com.whitefleet.dto.ReservationCreateDTO;
import com.whitefleet.entity.Reservation;
import com.whitefleet.entity.Vehicle;
import com.whitefleet.repository.ReservationRepository;
import com.whitefleet.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.Mockito;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ReservationServiceTest {

    private ReservationRepository reservationRepository;
    private VehicleRepository vehicleRepository;
    private ReservationService reservationService;

    private static final ZoneId ZONE_ID = ZoneId.of("America/Sao_Paulo");

    @BeforeEach
    void setup() {
        reservationRepository = Mockito.mock(ReservationRepository.class);
        vehicleRepository = Mockito.mock(VehicleRepository.class);
        reservationService = new ReservationService(reservationRepository, vehicleRepository);
    }

    @Test
    void createReservation_shouldThrow_whenVehicleInactive() {
        Vehicle vehicle = new Vehicle();
        vehicle.setId(1L);
        vehicle.setStatus(Vehicle.Status.INACTIVE);

        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(vehicle));

        ReservationCreateDTO dto = new ReservationCreateDTO();
        dto.setVehicleId(1L);
        dto.setEmployeeId(1L);
        dto.setStartDateTime(ZonedDateTime.now(ZONE_ID).plusHours(1));
        dto.setEndDateTime(ZonedDateTime.now(ZONE_ID).plusHours(2));
        dto.setPurpose("Test");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            reservationService.createReservation(dto);
        });

        assertEquals("Vehicle is not active.", ex.getMessage());
    }

    @Test
    void createReservation_shouldThrow_whenConflictExists() {
        Vehicle vehicle = new Vehicle();
        vehicle.setId(1L);
        vehicle.setStatus(Vehicle.Status.ACTIVE);

        when(vehicleRepository.findById(1L)).thenReturn(Optional.of(vehicle));
        when(reservationRepository.existsActiveReservationConflict(anyLong(), any(), any())).thenReturn(true);

        ReservationCreateDTO dto = new ReservationCreateDTO();
        dto.setVehicleId(1L);
        dto.setEmployeeId(1L);
        dto.setStartDateTime(ZonedDateTime.now(ZONE_ID).plusHours(1));
        dto.setEndDateTime(ZonedDateTime.now(ZONE_ID).plusHours(2));
        dto.setPurpose("Test");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> {
            reservationService.createReservation(dto);
        });

        assertEquals("Reservation conflict detected for the vehicle in the given period.", ex.getMessage());
    }
}
