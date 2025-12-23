package org.wldu.webservices.controllers;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.wldu.webservices.entities.Notification;
import org.wldu.webservices.services.contracts.NotificationService;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping("/send")
    public ResponseEntity<Notification> sendNotification(@RequestBody Notification notification) {
        return ResponseEntity.ok(
                notificationService.notifyCustomer(
                        notification.getReceiverCustomerId(),
                        notification.getTitle(),
                        notification.getMessage()
                )
        );
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable Long customerId) {
        return ResponseEntity.ok(
                notificationService.getCustomerNotifications(customerId)
        );
    }

    @PostMapping("/read/{id}")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }
}
