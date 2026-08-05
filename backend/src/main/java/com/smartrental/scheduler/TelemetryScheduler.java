package com.smartrental.scheduler;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduled job to simulate or poll active IoT telemetry streams.
 */
@Component
public class TelemetryScheduler {

    private static final Logger log = LoggerFactory.getLogger(TelemetryScheduler.class);

    // Runs every 60 seconds
    @Scheduled(fixedRate = 60000)
    public void processTelemetryPoll() {
        log.info("Scheduled task: Polling active IoT telemetry beacons for live asset status...");
        // TODO: Ingest telemetry payloads from message broker or IoT gateway during feature development
    }
}
