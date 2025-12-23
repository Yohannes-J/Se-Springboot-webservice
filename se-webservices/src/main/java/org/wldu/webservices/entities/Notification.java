package org.wldu.webservices.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String message;

    @Enumerated(EnumType.STRING)
    private NotificationRole receiverRole;

    private Long receiverCustomerId;
    private boolean read = false;
    private LocalDateTime createdAt = LocalDateTime.now();

    public Notification() {}

    public Notification(String title, String message, NotificationRole receiverRole, Long receiverCustomerId) {
        this.title = title;
        this.message = message;
        this.receiverRole = receiverRole;
        this.receiverCustomerId = receiverCustomerId;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public NotificationRole getReceiverRole() { return receiverRole; }
    public void setReceiverRole(NotificationRole receiverRole) { this.receiverRole = receiverRole; }
    public Long getReceiverCustomerId() { return receiverCustomerId; }
    public void setReceiverCustomerId(Long receiverUserId) { this.receiverCustomerId = receiverCustomerId; }
    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}