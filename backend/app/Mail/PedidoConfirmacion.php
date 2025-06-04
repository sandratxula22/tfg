<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\Pedido;

class PedidoConfirmacion extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $pedido;

    public function __construct(Pedido $pedido)
    {
        $this->pedido = $pedido;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Confirmación de tu pedido en La Página Doblada',
            to: $this->pedido->usuario->correo
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.pedido-confirmacion',
            with: [
                'nombreCliente' => $this->pedido->usuario->nombre,
            ]
        );
    }

    public function attachments(): array
    {
        return [];
    }
}