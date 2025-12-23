package org.wldu.webservices.services.contracts;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.wldu.webservices.entities.Notification;
import org.wldu.webservices.entities.NotificationRole;
import org.wldu.webservices.repositories.NotificationRepository;

import java.util.List;

@Service

public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(NotificationRepository notificationRepository,
                               SimpMessagingTemplate messagingTemplate) {
        this.notificationRepository = notificationRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public Notification notifyCustomer(Long customerId, String title, String message) {
        Notification notification = new Notification(title, message, NotificationRole.CUSTOMER, customerId);
        Notification saved = notificationRepository.save(notification);
        messagingTemplate.convertAndSend("/topic/notifications/" + customerId, saved);
        return saved;
    }

    public List<Notification> getCustomerNotifications(Long userId) {
        return notificationRepository.findByReceiverCustomerId(userId);
    }

    public void markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        notificationRepository.save(notification);
    }
}
