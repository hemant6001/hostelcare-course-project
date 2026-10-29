package com.hostelcare.exp7.repository;

import com.hostelcare.exp7.model.Student;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository extends JpaRepository<Student, Long> {
    boolean existsByEmailIgnoreCase(String email);
    Optional<Student> findByEmailIgnoreCase(String email);
}
