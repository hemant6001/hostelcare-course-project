package com.hostelcare.exp7.controller;

import java.util.Map;
import java.util.UUID;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ApiHealthController {
    private final String instanceId = UUID.randomUUID().toString();

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "UP", "instanceId", instanceId);
    }
}
