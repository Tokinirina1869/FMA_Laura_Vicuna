<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = [];

    // Participants de la conversation
    public function users()
    {
        return $this->belongsToMany(User::class, 'conversation_user')
                    ->withTimestamps();
    }

    // Messages de la conversation
    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    // Dernier message (pour affichage dans la liste)
    public function lastMessage()
    {
        return $this->hasOne(Message::class)->latestOfMany();
    }
}