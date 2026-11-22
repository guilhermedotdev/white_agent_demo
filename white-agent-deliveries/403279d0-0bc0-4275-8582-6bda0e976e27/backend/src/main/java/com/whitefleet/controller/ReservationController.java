package com.whitefleet.controller;

import com.whitefleet.dto.ReservationCreateDTO;
import com.whitefleet.dto.ReservationDTO;
import com.whitefleet.service.ReservationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @GetMapping("/availability")
    public ResponseEntity<List<ReservationDTO.VehicleAvailability>> getAvailableVehicles(
            @RequestParam ZonedDateTime startDateTime,
            @RequestParam ZonedDateTime endDateTime) {
        List<ReservationDTO.VehicleAvailability> availableVehicles = reservationService.findAvailableVehicles(startDateTime, endDateTime);
        return ResponseEntity.ok(availableVehicles);
    }

    @PostMapping
    public ResponseEntity<?> createReservation(@Valid @RequestBody ReservationCreateDTO dto) {
        try {
            ReservationDTO reservation = reservationService.createReservation(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(reservation);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<ReservationDTO>> listActiveReservations() {
        List<ReservationDTO> reservations = reservationService.listActiveReservations();
        return ResponseEntity.ok(reservations);
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ReservationDTO> cancelReservation(@PathVariable Long id) {
        ReservationDTO cancelled = reservationService.cancelReservation(id);
        return ResponseEntity.ok(cancelled);
    }
}
