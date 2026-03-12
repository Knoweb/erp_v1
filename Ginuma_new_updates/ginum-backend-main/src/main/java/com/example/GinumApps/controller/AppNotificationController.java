package com.example.GinumApps.controller;

import com.example.GinumApps.model.AppNotification;
import com.example.GinumApps.service.AppNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/companies/{companyId}/notifications")
@RequiredArgsConstructor
public class AppNotificationController {

    private final AppNotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<AppNotification>> getNotifications(@PathVariable Integer companyId) {
        List<AppNotification> notifications = notificationService.getNotifications(companyId);
        return ResponseEntity.ok(notifications);
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Integer companyId, @PathVariable Integer notificationId) {
        boolean success = notificationService.markAsRead(companyId, notificationId);
        if (success) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<AppNotification> createNotification(@PathVariable Integer companyId,
            @RequestBody Map<String, String> payload) {
        AppNotification notif = notificationService.createNotification(companyId, payload);
        return ResponseEntity.ok(notif);
    }

    @DeleteMapping
    public ResponseEntity<?> clearAllNotifications(@PathVariable Integer companyId) {
        boolean success = notificationService.clearAllNotifications(companyId);
        if (success) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.internalServerError().build();
        }
    }
}
