package org.wldu.webservices.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.wldu.webservices.entities.Notification;
import org.wldu.webservices.entities.NotificationRole;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByReceiverCustomerId(Long customerId);
    List<Notification> findByReceiverRole(NotificationRole role);
}
