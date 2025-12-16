package com.parcelninja.pnjreader.controller;

import com.parcelninja.pnjreader.service.ParcelninjaApiService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inbounds")
public class InboundController {

    private static final Logger logger = LoggerFactory.getLogger(InboundController.class);
    private final ParcelninjaApiService parcelninjaApiService;

    public InboundController(ParcelninjaApiService parcelninjaApiService) {
        this.parcelninjaApiService = parcelninjaApiService;
    }

    @PostMapping("/sync")
    public ResponseEntity<String> syncInbounds(@RequestParam String fromDate, @RequestParam String toDate) {
        try {
            parcelninjaApiService.fetchAndSaveInbounds(fromDate, toDate);
            return ResponseEntity.ok("Inbounds synchronization started successfully.");
        } catch (Exception e) {
            logger.error("Failed to trigger inbound synchronization", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to synchronize inbounds: " + e.getMessage());
        }
    }
}