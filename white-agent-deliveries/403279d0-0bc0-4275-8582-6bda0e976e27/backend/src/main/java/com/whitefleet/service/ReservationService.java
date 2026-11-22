package com.whitefleet.service;

import com.whitefleet.dto.ReservationCreateDTO;
import com.whitefleet.dto.ReservationDTO;
import com.whitefleet.entity.Reservation;
import com.whitefleet.entity.Vehicle;
import com.whitefleet.repository.ReservationRepository;
import com.whitefleet.repository.VehicleRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final VehicleRepository vehicleRepository;

    private static final ZoneId ZONE_ID = ZoneId.of("America/Sao_Paulo");

    public ReservationService(ReservationRepository reservationRepository, VehicleRepository vehicleRepository) {
        this.reservationRepository = reservationRepository;
        this.vehicleRepository = vehicleRepository;
    }

    public List<ReservationDTO.VehicleAvailability> findAvailableVehicles(ZonedDateTime start, ZonedDateTime end) {
        ZonedDateTime startZ = start.withZoneSameInstant(ZONE_ID);
        ZonedDateTime endZ = end.withZoneSameInstant(ZONE_ID);

        List<Vehicle> activeVehicles = vehicleRepository.findByStatus(Vehicle.Status.ACTIVE);

        List<Long> reservedVehicleIds = reservationRepository.findVehicleIdsReservedBetween(startZ, endZ);

        return activeVehicles.stream()
                .filter(v -> !reservedVehicleIds.contains(v.getId()))
                .map(v -> new ReservationDTO.VehicleAvailability(v.getId(), v.getPlate(), v.getBrand(), v.getModel(), v.getYear()))
                .collect(Collectors.toList());
    }

    @Transactional
    public ReservationDTO createReservation(ReservationCreateDTO dto) {
        ZonedDateTime start = dto.getStartDateTime().withZoneSameInstant(ZONE_ID);
        ZonedDateTime end = dto.getEndDateTime().withZoneSameInstant(ZONE_ID);

        if (start.isBefore(ZonedDateTime.now(ZONE_ID))) {
            throw new IllegalArgumentException("Start date/time cannot be in the past.");
        }
        if (!end.isAfter(start)) {
            throw new IllegalArgumentException("End date/time must be after start date/time.");
        }

        Vehicle vehicle = vehicleRepository.findById(dto.getVehicleId())
                .orElseThrow(() -> new IllegalArgumentException("Vehicle not found."));

        if (vehicle.getStatus() != Vehicle.Status.ACTIVE) {
            throw new IllegalArgumentException("Vehicle is not active.");
        }

        boolean conflict = reservationRepository.existsActiveReservationConflict(dto.getVehicleId(), start, end);
        if (conflict) {
            throw new IllegalArgumentException("Reservation conflict detected for the vehicle in the given period.");
        }

        Reservation reservation = new Reservation();
        reservation.setVehicle(vehicle);
        reservation.setEmployeeId(dto.getEmployeeId());
        reservation.setStartDateTime(start);
        reservation.setEndDateTime(end);
        reservation.setPurpose(dto.getPurpose());
        reservation.setStatus(Reservation.Status.ACTIVE);

        Reservation saved = reservationRepository.save(reservation);

        return ReservationDTO.fromEntity(saved);
    }

    public List<ReservationDTO> listActiveReservations() {
        ZonedDateTime now = ZonedDateTime.now(ZONE_ID);
        List<Reservation> reservations = reservationRepository.findActiveReservationsFrom(now);
        return reservations.stream().map(ReservationDTO::fromEntity).collect(Collectors.toList());
    }

    @Transactional
    public ReservationDTO cancelReservation(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found."));

        reservation.setStatus(Reservation.Status.CANCELLED);
        Reservation saved = reservationRepository.save(reservation);

        return ReservationDTO.fromEntity(saved);
    }
}
