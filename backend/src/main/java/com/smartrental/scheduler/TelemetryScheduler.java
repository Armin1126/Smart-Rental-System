package com.smartrental.scheduler;

import com.smartrental.service.TelemetrySimulatorService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduled job to simulate IoT telemetry streams every 5 seconds.
 */
@Component
public class TelemetryScheduler {

    private static final Logger log = LoggerFactory.getLogger(TelemetryScheduler.class);
    private final TelemetrySimulatorService telemetrySimulatorService;

    public TelemetryScheduler(TelemetrySimulatorService telemetrySimulatorService) {
        this.telemetrySimulatorService = telemetrySimulatorService;
    }

    // Runs every 5 seconds (5000 ms)
    @Scheduled(fixedRate = 5000)
    public void processTelemetryPoll() {
        log.info("Scheduled 5-second tick: Generating and broadcasting telemetry update...");
        telemetrySimulatorService.runTelemetrySimulationCycle();
    }
}
