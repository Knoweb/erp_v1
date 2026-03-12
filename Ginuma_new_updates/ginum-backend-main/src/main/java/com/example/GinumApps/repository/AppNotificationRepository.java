package com.example.GinumApps.repository;

import com.example.GinumApps.model.AppNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppNotificationRepository extends JpaRepository<AppNotification, Integer> {
    List<AppNotification> findByCompanyIdOrderByCreatedAtDesc(Integer companyId);
}
