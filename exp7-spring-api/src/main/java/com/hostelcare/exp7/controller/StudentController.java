package com.hostelcare.exp7.controller;

import com.hostelcare.exp7.model.Student;
import com.hostelcare.exp7.repository.StudentRepository;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.Map;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
public class StudentController {
    private static final Set<String> PATCH_FIELDS = Set.of("name", "email", "course", "roomNumber", "mobile");
    private final StudentRepository repository;

    public StudentController(StudentRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public ResponseEntity<Student> create(@Valid @RequestBody Student student) {
        if (repository.existsByEmailIgnoreCase(student.getEmail().trim())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        student.setId(null);
        student.setName(student.getName().trim());
        student.setEmail(student.getEmail().trim());
        student.setCourse(student.getCourse().trim());
        Student saved = repository.save(student);
        return ResponseEntity.created(URI.create("/api/students/" + saved.getId())).body(saved);
    }

    @GetMapping
    public java.util.List<Student> getAll() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Student> getById(@PathVariable Long id) {
        return repository.findById(id).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Student> replace(@PathVariable Long id, @Valid @RequestBody Student updated) {
        return repository.findById(id).map(existing -> {
            if (emailBelongsToAnotherStudent(updated.getEmail(), id)) {
                return ResponseEntity.status(HttpStatus.CONFLICT).<Student>build();
            }
            existing.setName(updated.getName().trim());
            existing.setEmail(updated.getEmail().trim());
            existing.setCourse(updated.getCourse().trim());
            existing.setRoomNumber(updated.getRoomNumber());
            existing.setMobile(updated.getMobile());
            return ResponseEntity.ok(repository.save(existing));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Student> updateFields(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        if (updates.keySet().stream().anyMatch(field -> !PATCH_FIELDS.contains(field))) {
            return ResponseEntity.badRequest().build();
        }
        return repository.findById(id).map(student -> {
            if (updates.containsKey("name")) student.setName(value(updates.get("name")));
            if (updates.containsKey("email")) student.setEmail(value(updates.get("email")));
            if (updates.containsKey("course")) student.setCourse(value(updates.get("course")));
            if (updates.containsKey("roomNumber")) student.setRoomNumber(value(updates.get("roomNumber")));
            if (updates.containsKey("mobile")) student.setMobile(value(updates.get("mobile")));

            if (blank(student.getName()) || blank(student.getEmail()) || blank(student.getCourse()) || !validEmail(student.getEmail())) {
                return ResponseEntity.badRequest().<Student>build();
            }
            if (emailBelongsToAnotherStudent(student.getEmail(), id)) {
                return ResponseEntity.status(HttpStatus.CONFLICT).<Student>build();
            }
            student.setName(student.getName().trim());
            student.setEmail(student.getEmail().trim());
            student.setCourse(student.getCourse().trim());
            return ResponseEntity.ok(repository.save(student));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        repository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    private boolean emailBelongsToAnotherStudent(String email, Long id) {
        return repository.findByEmailIgnoreCase(email.trim())
                .map(existing -> !existing.getId().equals(id))
                .orElse(false);
    }

    private static String value(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    private static boolean blank(String value) {
        return value == null || value.isBlank();
    }

    private static boolean validEmail(String value) {
        return value != null && value.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    }
}
