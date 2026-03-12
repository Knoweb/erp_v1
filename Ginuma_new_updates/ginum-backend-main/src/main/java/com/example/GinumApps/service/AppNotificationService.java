package com.example.GinumApps.service;

import com.example.GinumApps.model.AppNotification;
import com.example.GinumApps.repository.AppNotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AppNotificationService {

    private final AppNotificationRepository notificationRepository;

    public List<AppNotification> getNotifications(Integer companyId) {
        List<AppNotification> notifications = notificationRepository.findByCompanyIdOrderByCreatedAtDesc(companyId);

        if (notifications.isEmpty()) {
            AppNotification welcome = AppNotification.builder()
                    .companyId(companyId)
                    .message("Welcome to Ginum! Get started by setting up your company profile.")
                    .readStatus(false)
                    .createdAt(LocalDateTime.now())
                    .build();
            AppNotification security = AppNotification.builder()
                    .companyId(companyId)
                    .message("Security Alert: New login from Ginuma Dashboard.")
                    .readStatus(false)
                    .createdAt(LocalDateTime.now().minusHours(1))
                    .build();

            notificationRepository.save(welcome);
            notificationRepository.save(security);

            List<AppNotification> defaults = new ArrayList<>();
            defaults.add(welcome);
            defaults.add(security);
            return defaults;
        }

        return notifications;
    }

    public boolean markAsRead(Integer companyId, Integer notificationId) {
        Optional<AppNotification> notificationOpt = notificationRepository.findById(notificationId)
                .filter(n -> n.getCompanyId().equals(companyId));

        if (notificationOpt.isPresent()) {
            AppNotification notif = notificationOpt.get();
            notif.setReadStatus(true);
            notificationRepository.save(notif);
            return true;
        }
        return false;
    }

    public AppNotification createNotification(Integer companyId, Map<String, String> payload) {
        AppNotification notif = AppNotification.builder()
                .companyId(companyId)
                .message(payload.getOrDefault("message", "System notification"))
                .readStatus(false)
                .createdAt(LocalDateTime.now())
                .build();
        return notificationRepository.save(notif);
    }

    public boolean clearAllNotifications(Integer companyId) {
        try {
            List<AppNotification> notifications = notificationRepository.findByCompanyIdOrderByCreatedAtDesc(companyId);
            notificationRepository.deleteAll(notifications);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
