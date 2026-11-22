import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;

public class ReservaConflictTest {

    @Test
    public void shouldDetectConflictWhenOverlappingReservations() {
        LocalDateTime start1 = LocalDateTime.of(2024, 6, 10, 10, 0);
        LocalDateTime end1 = LocalDateTime.of(2024, 6, 10, 12, 0);
        LocalDateTime start2 = LocalDateTime.of(2024, 6, 10, 11, 0);
        LocalDateTime end2 = LocalDateTime.of(2024, 6, 10, 13, 0);

        boolean conflict = ReservationService.isConflict(start1, end1, start2, end2);

        assertTrue(conflict, "Deve detectar conflito entre reservas sobrepostas");
    }

    @Test
    public void shouldNotDetectConflictWhenReservationsDoNotOverlap() {
        LocalDateTime start1 = LocalDateTime.of(2024, 6, 10, 8, 0);
        LocalDateTime end1 = LocalDateTime.of(2024, 6, 10, 9, 0);
        LocalDateTime start2 = LocalDateTime.of(2024, 6, 10, 10, 0);
        LocalDateTime end2 = LocalDateTime.of(2024, 6, 10, 11, 0);

        boolean conflict = ReservationService.isConflict(start1, end1, start2, end2);

        assertFalse(conflict, "Não deve detectar conflito quando reservas não se sobrepõem");
    }
}