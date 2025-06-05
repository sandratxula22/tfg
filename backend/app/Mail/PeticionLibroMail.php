<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PeticionLibroMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $peticionData;

    public function __construct(array $peticionData)
    {
        $this->peticionData = $peticionData;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Nueva Petición de Libro: ' . ($this->peticionData['titulo'] ?? 'Sin título'),
            to: env('MAIL_ADMIN_RECEIVER_EMAIL'),
            replyTo: $this->peticionData['email_remitente'] ?? null
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.peticion-libro',
        );
    }

    public function attachments(): array
    {
        return [];
    }
}