<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Property extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'description',
        'address',
        'city',
        'area_m2',
        'bedrooms',
        'bathrooms',
        'monthly_rent',
        'status',
        'image_url'
    ];

    protected $casts = [
        'monthly_rent' => 'decimal:2',
        'area_m2' => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}