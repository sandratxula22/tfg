<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Image extends Model
{
    protected $fillable = [
        'libro_id',
        'url',
    ];

    public function libro(): BelongsTo
    {
        return $this->belongsTo(Libro::class);
    }
}