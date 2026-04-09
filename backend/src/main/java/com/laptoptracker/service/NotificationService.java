package com.laptoptracker.service;

import com.laptoptracker.entity.Notification;
import com.laptoptracker.entity.StudentProfile;
import com.laptoptracker.exception.BadRequestException;
import com.laptoptracker.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service for Notification operations
 */
@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private AuthService authService;

    /**
     * Create a notification for a student
     */
    @Transactional
    public Notification createNotification(StudentProfile student, String title, String message) {
        Notification notification = new Notification();
        notification.setStudent(student);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setIsRead(false);

        return notificationRepository.save(notification);
    }

    /**
     * Get all notifications for current student
     */
    public List<Notification> getMyNotifications() {
        StudentProfile student = authService.getCurrentStudentProfile();
        return notificationRepository.findByStudentIdOrderByCreatedAtDesc(student.getId());
    }

    /**
     * Get unread notifications for current student
     */
    public List<Notification> getMyUnreadNotifications() {
        StudentProfile student = authService.getCurrentStudentProfile();
        return notificationRepository.findByStudentIdAndIsReadFalseOrderByCreatedAtDesc(student.getId());
    }

    /**
     * Get unread notification count
     */
    public Long getUnreadNotificationCount() {
        StudentProfile student = authService.getCurrentStudentProfile();
        return notificationRepository.countByStudentIdAndIsReadFalse(student.getId());
    }

    /**
     * Mark notification as read
     */
    @Transactional
    public void markAsRead(Long notificationId) {
        StudentProfile student = authService.getCurrentStudentProfile();

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new BadRequestException("Notification not found"));

        // Verify ownership
        if (!notification.getStudent().getId().equals(student.getId())) {
            throw new BadRequestException("This notification does not belong to you");
        }

        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    /**
     * Mark all notifications as read
     */
    @Transactional
    public void markAllAsRead() {
        StudentProfile student = authService.getCurrentStudentProfile();
        List<Notification> unreadNotifications = notificationRepository.findByStudentIdAndIsReadFalseOrderByCreatedAtDesc(student.getId());

        for (Notification notification : unreadNotifications) {
            notification.setIsRead(true);
        }

        notificationRepository.saveAll(unreadNotifications);
    }
}
