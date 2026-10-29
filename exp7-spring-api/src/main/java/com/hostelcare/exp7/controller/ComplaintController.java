package com.hostelcare.exp7.controller;

import java.nio.charset.StandardCharsets;
import java.util.Map;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.util.UriUtils;
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
import org.springframework.web.client.RestClient;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin(origins = "*")
public class ComplaintController {
    private static final String JSON_SERVER_URL = "http://[::1]:3000/complaints";
    private final RestClient restClient;

    public ComplaintController(RestClient.Builder builder) {
        this.restClient = builder.build();
    }

    @GetMapping
    public ResponseEntity<byte[]> getAll() {
        return forward(HttpMethod.GET, JSON_SERVER_URL, null);
    }

    @GetMapping("/{id}")
    public ResponseEntity<byte[]> getById(@PathVariable String id) {
        return forward(HttpMethod.GET, complaintUrl(id), null);
    }

    @PostMapping
    public ResponseEntity<byte[]> create(@RequestBody Map<String, Object> complaint) {
        return forward(HttpMethod.POST, JSON_SERVER_URL, complaint);
    }

    @PutMapping("/{id}")
    public ResponseEntity<byte[]> replace(
            @PathVariable String id,
            @RequestBody Map<String, Object> complaint) {
        return forward(HttpMethod.PUT, complaintUrl(id), complaint);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<byte[]> updateFields(
            @PathVariable String id,
            @RequestBody Map<String, Object> updates) {
        return forward(HttpMethod.PATCH, complaintUrl(id), updates);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<byte[]> delete(@PathVariable String id) {
        return forward(HttpMethod.DELETE, complaintUrl(id), null);
    }

    private String complaintUrl(String id) {
        return JSON_SERVER_URL + "/" + UriUtils.encodePathSegment(id, StandardCharsets.UTF_8);
    }

    private ResponseEntity<byte[]> forward(HttpMethod method, String url, Object body) {
        try {
            RestClient.RequestBodySpec request = restClient.method(method).uri(url);
            if (body != null) {
                request.contentType(MediaType.APPLICATION_JSON).body(body);
            }

            return request.exchange((clientRequest, clientResponse) -> {
                byte[] responseBody = clientResponse.getBody().readAllBytes();
                return ResponseEntity.status(clientResponse.getStatusCode())
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(responseBody);
            });
        } catch (Exception error) {
            System.err.println("Complaint API proxy failure: " + error);
            byte[] responseBody = "{\"error\":\"JSON Server on port 3000 is unavailable. Start Experiment 2 first.\"}"
                    .getBytes(StandardCharsets.UTF_8);
            return ResponseEntity.status(502)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(responseBody);
        }
    }
}