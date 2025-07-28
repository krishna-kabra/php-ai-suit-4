<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EmailVerificationNotification extends Notification
{
    use Queueable;

    protected $verificationToken;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $verificationToken)
    {
        $this->verificationToken = $verificationToken;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $verificationUrl = url("/api/v1/provider/verify-email/{$this->verificationToken}");
        
        return (new MailMessage)
                    ->subject('Verify Email Address')
                    ->line('Please click the button below to verify your email address.')
                    ->action('Verify Email Address', $verificationUrl)
                    ->line('If you did not create an account, no further action is required.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
