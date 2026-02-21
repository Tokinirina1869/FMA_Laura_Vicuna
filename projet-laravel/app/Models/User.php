<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */

    const ROLE_DIRECTRICE = 'directrice';
    const ROLE_BDE = 'bde';
    const ROLE_SECRETAIRE_LYCEE = 'secretaire_lycee'; 
    const ROLE_SECRETAIRE_CFP = 'secretaire_cfp'; 
    protected $fillable = [
        'name',
        'email',
        'password',
        'photo',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    // Methodes pour obtenir tous les roles disponibles

    public static function getRoles()
    {
        return [
            self::ROLE_DIRECTRICE       => 'Directrice',
            self::ROLE_BDE              => "Bureau d'emploi",
            self::ROLE_SECRETAIRE_LYCEE => 'Secretaire Lycee',
            self::ROLE_SECRETAIRE_CFP   => 'Secretaire Cfp',
        ];
    }
    // Méthode pour vérifier si admin
    public function isAdmin()
    {
        return in_array($this->role, [
            self::ROLE_DIRECTRICE,
            self::ROLE_BDE
        ]);
    }

    // Méthode pour vérifier si secrétaire
    public function isSecretaire()
    {
        return in_array($this->role, [
            self::ROLE_SECRETAIRE_LYCEE,
            self::ROLE_SECRETAIRE_CFP
        ]);
    }

    // Récupérer les rôles avec indication admin
    public static function getRolesWithAdminInfo()
    {
        return [
            self::ROLE_DIRECTRICE => [
                'label' => 'Directrice',
                'is_admin' => true,
                'description' => 'Administrateur principal'
            ],
            self::ROLE_BDE => [
                'label' => 'Bureau des Étudiants',
                'is_admin' => true,
                'description' => 'Administrateur'
            ],
            self::ROLE_SECRETAIRE_LYCEE => [
                'label' => 'Secrétaire Lycée',
                'is_admin' => false,
                'description' => 'Utilisateur standard'
            ],
            self::ROLE_SECRETAIRE_CFP => [
                'label' => 'Secrétaire CFP',
                'is_admin' => false,
                'description' => 'Utilisateur standard'
            ],
        ];
    }
    // Obtenir le nom du role formate

    public function getRoleName()
    {
        return self::getRoles()[$this->role] ?? $this->role;
    }

}
