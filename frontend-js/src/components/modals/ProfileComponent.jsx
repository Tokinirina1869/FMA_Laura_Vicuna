import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from "../Users/AuthContext";
import axios from 'axios';

const ProfileComponent = ({ show, handleClose, onUpdateProfile, onBack }) => {
  const { user, token, login } = useContext(AuthContext);

  // États du formulaire
  const [profileImage, setProfileImage] = useState('https://placehold.co/128x128/007bff/ffffff?text=Photo');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // États UI
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageError, setImageError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isModified, setIsModified] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Refs
  const fileInputRef = useRef(null);
  const modalContentRef = useRef(null);

  // Critères de validation du mot de passe
  const passwordCriteria = {
    minLength: { test: (pwd) => pwd.length >= 8, message: "8 caractères minimum" },
    hasUpperCase: { test: (pwd) => /[A-Z]/.test(pwd), message: "1 majuscule" },
    hasLowerCase: { test: (pwd) => /[a-z]/.test(pwd), message: "1 minuscule" },
    hasNumber: { test: (pwd) => /[0-9]/.test(pwd), message: "1 chiffre" },
    hasSpecialChar: { test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd), message: "1 caractère spécial" }
  };

  // Charger les données utilisateur
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      if (user.photo) {
        setProfileImage(user.photo);
      } else if (user.profilePicture) {
        setProfileImage(user.profilePicture);
      }
    }
  }, [user]);

  // Détecter les modifications
  useEffect(() => {
    const isNameModified = user?.name !== name;
    const isEmailModified = user?.email !== email;
    const isImageModified = (user?.photo !== profileImage) && (user?.profilePicture !== profileImage);
    const isPasswordModified = newPassword.length > 0 || currentPassword.length > 0;

    setIsModified(isNameModified || isEmailModified || isImageModified || isPasswordModified);
  }, [name, email, profileImage, newPassword, currentPassword, user]);

  // Calcul de la force du mot de passe
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    Object.values(passwordCriteria).forEach(criterion => {
      if (criterion.test(password)) strength++;
    });
    return strength;
  };

  // Validation du mot de passe
  const validatePassword = () => {
    if (newPassword && newPassword.length < 8) {
      setPasswordError("Le mot de passe doit contenir au moins 8 caractères");
      return false;
    }

    if (newPassword && calculatePasswordStrength(newPassword) < 3) {
      setPasswordError("Mot de passe trop faible (minimum 3 critères)");
      return false;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas");
      return false;
    }

    if (newPassword && !currentPassword) {
      setPasswordError("Le mot de passe actuel est requis");
      return false;
    }

    setPasswordError('');
    return true;
  };

  // Empêcher le scroll du body quand le modal est ouvert
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show]);

  const handleCancel = () => {
    resetForm();
    handleClose();
  };

  // Drag & drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageUpload({ target: { files } });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Simulation d'upload (pour l'effet visuel)
  const simulateUpload = (file) => {
    setIsUploading(true);
    setUploadProgress(0);
    setImageError('');

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    const reader = new FileReader();
    reader.onloadstart = () => {
      setUploadProgress(10);
    };

    reader.onloadend = () => {
      clearInterval(interval);
      setUploadProgress(100);
      setTimeout(() => {
        setProfileImage(reader.result);
        setIsUploading(false);
        setUploadProgress(0);
      }, 500);
    };

    reader.onerror = () => {
      clearInterval(interval);
      setImageError('Erreur lors de la lecture du fichier');
      setIsUploading(false);
      setUploadProgress(0);
    };

    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setImageError('Format non supporté. Utilisez JPEG, PNG, GIF ou WebP.');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setImageError('L\'image ne doit pas dépasser 5MB.');
      return;
    }

    const img = new Image();
    img.onload = () => {
      if (img.width < 100 || img.height < 100) {
        setImageError('L\'image doit faire au moins 100x100 pixels.');
        return;
      }
      if (img.width > 5000 || img.height > 5000) {
        setImageError('L\'image est trop grande. Maximum 2000x2000 pixels.');
        return;
      }
      simulateUpload(file);
    };
    img.onerror = () => {
      setImageError('Impossible de charger l\'image.');
    };
    img.src = URL.createObjectURL(file);
  };

  const removeProfileImage = () => {
    setProfileImage('https://placehold.co/128x128/007bff/ffffff?text=Photo');
    setImageError('');
  };

  const resetForm = () => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setProfileImage(user.photo || user.profilePicture || 'https://placehold.co/128x128/007bff/ffffff?text=Photo');
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setImageError('');
    setPasswordError('');
    setIsModified(false);
    setActiveTab('profile');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setSaveLoading(false);
    setPasswordStrength(0);
  };

  // Toggle de visibilité des mots de passe
  const toggleCurrentPasswordVisibility = () => {
    setShowCurrentPassword(prev => !prev);
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(prev => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(prev => !prev);
  };

  const getInitial = (name) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  const getPasswordStrengthPercent = () => {
    return (passwordStrength / Object.keys(passwordCriteria).length) * 100;
  };

  const handleSave = async () => {
    // Validations de base
    if (!name.trim()) {
      alert('Veuillez saisir un nom complet');
      return;
    }

    if (!email.trim()) {
      alert('Veuillez saisir une adresse email');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Veuillez saisir une adresse email valide');
      return;
    }

    // Validation du mot de passe si modification
    if (newPassword && !validatePassword()) {
      return;
    }

    setSaveLoading(true);

    try {
      // Préparation des données
      const updateData = {
        name: name.trim(),
        email: email.trim(),
      };

      // Gestion de la photo
      if (profileImage && profileImage !== 'https://placehold.co/128x128/007bff/ffffff?text=Photo') {
        if (profileImage.startsWith('data:image')) {
          updateData.photo = profileImage; // Nouvelle image
        }
        // Si c'est une URL (photo existante), on ne renvoie pas pour éviter de l'écraser
      } else {
        updateData.photo = null; // Photo supprimée
      }

      // Ajout des mots de passe si modifiés
      if (newPassword) {
        updateData.current_password = currentPassword;
        updateData.new_password = newPassword;
        updateData.new_password_confirmation = confirmPassword;
      }

      const response = await axios.put(
        `http://127.0.0.1:8000/api/users/${user.id}`,
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.status === 'Succès') {
        // Mise à jour du contexte
        const updatedUser = {
          ...user,
          name: name.trim(),
          email: email.trim(),
          photo: response.data.data.photo || user.photo
        };

        login(token, updatedUser);

        // Mise à jour du stockage
        const storage = localStorage.getItem('token') ? localStorage : sessionStorage;
        storage.setItem('user', JSON.stringify(updatedUser));

        if (onUpdateProfile) {
          onUpdateProfile(updatedUser);
        }

        // Réinitialisation
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordStrength(0);
        handleClose();
        alert('Profil mis à jour avec succès!');
      } else {
        alert('Erreur lors de la mise à jour: ' + response.data.message);
      }
    } catch (error) {
      console.error('Erreur complète:', error);
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        let errorMessage = 'Erreurs de validation:\n';
        Object.entries(errors).forEach(([field, messages]) => {
          errorMessage += `- ${field}: ${messages.join(', ')}\n`;
        });
        alert(errorMessage);
      } else if (error.response?.data?.message) {
        alert('Erreur: ' + error.response.data.message);
      } else {
        alert('Une erreur est survenue lors de la mise à jour du profil: ' + error.message);
      }
    } finally {
      setSaveLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className={`fixed inset-0 z-[10000] flex items-center justify-center ${show ? 'block' : 'hidden'}`}>
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleCancel}></div>

      {/* Modal - avec z-index élevé et pointer-events auto */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col z-30 pointer-events-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-2xl p-6 flex-shrink-0">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Gestion du profil
            </h2>
            <button
              type="button"
              onClick={handleCancel}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation par onglets */}
          <div className="flex mt-4 space-x-1">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                activeTab === 'profile'
                  ? 'bg-white text-blue-600'
                  : 'text-white hover:bg-white hover:bg-opacity-20'
              }`}
            >
              Profil
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('password')}
              className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                activeTab === 'password'
                  ? 'bg-white text-blue-600'
                  : 'text-white hover:bg-white hover:bg-opacity-20'
              }`}
            >
              Mot de passe
            </button>
          </div>
        </div>

        {/* Body */}
        <div ref={modalContentRef} className="flex-1 overflow-y-auto p-6">
          {activeTab === 'profile' && (
            <>
              {/* Section Photo */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative mb-4">
                  {profileImage ? (
                    <div className="relative">
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-32 h-32 rounded-full border-4 border-blue-500 shadow-lg object-cover"
                      />
                      {!isUploading && (
                        <button
                          type="button"
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                          onClick={removeProfileImage}
                          title="Supprimer la photo"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-blue-500 text-white flex items-center justify-center text-4xl font-bold shadow-lg">
                      {getInitial(name)}
                    </div>
                  )}
                </div>

                {/* Barre de progression */}
                {isUploading && (
                  <div className="w-full max-w-xs mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Téléversement...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Zone de drag & drop */}
                <div
                  className={`w-full max-w-xs border-2 border-dashed rounded-2xl p-4 mb-3 transition-all duration-200 cursor-pointer
                    ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
                    ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={isUploading ? undefined : triggerFileInput}
                >
                  <div className="text-center">
                    <svg className={`w-12 h-12 mx-auto mb-3 ${isDragOver ? 'text-blue-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="font-semibold text-gray-700 mb-1">Glissez-déposez votre photo ici</p>
                    <p className="text-gray-500 text-sm mb-3">ou</p>
                    <button
                      type="button"
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors
                        ${isUploading
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                        }
                      `}
                      disabled={isUploading}
                    >
                      Choisir une photo
                    </button>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />

                {imageError && (
                  <div className="w-full max-w-xs bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-red-700 text-sm font-medium">{imageError}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Formulaire profil */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base pointer-events-auto"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Votre nom complet"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Adresse email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base pointer-events-auto"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="exemple@email.com"
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === 'password' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-yellow-800 font-semibold">Changement de mot de passe</span>
                </div>
                <p className="text-yellow-700 text-sm mt-2">
                  Pour modifier votre mot de passe, vous devez saisir votre mot de passe actuel.
                </p>
              </div>

              {/* Mot de passe actuel */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Mot de passe actuel
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base pr-12 pointer-events-auto"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Saisissez votre mot de passe actuel"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                    onClick={toggleCurrentPasswordVisibility}
                    aria-label={showCurrentPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showCurrentPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Nouveau mot de passe */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base pr-12 pointer-events-auto"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPasswordStrength(calculatePasswordStrength(e.target.value));
                    }}
                    placeholder="Créez un nouveau mot de passe"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                    onClick={toggleNewPasswordVisibility}
                    aria-label={showNewPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showNewPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Indicateur de force */}
                {newPassword && (
                  <div className="mt-2">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Force du mot de passe:</span>
                      <span>{passwordStrength}/{Object.keys(passwordCriteria).length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength <= 2 ? 'bg-red-500' :
                          passwordStrength <= 3 ? 'bg-yellow-500' :
                          passwordStrength <= 4 ? 'bg-blue-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${getPasswordStrengthPercent()}%` }}
                      ></div>
                    </div>

                    {/* Critères détaillés */}
                    <div className="mt-2 space-y-1">
                      {Object.entries(passwordCriteria).map(([key, criterion]) => (
                        <div
                          key={key}
                          className={`flex items-center text-sm ${
                            criterion.test(newPassword) ? 'text-green-600' : 'text-red-500'
                          }`}
                        >
                          {criterion.test(newPassword) ? (
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                          {criterion.message}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirmation */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Confirmer le nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-base pr-12 pointer-events-auto"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmez votre nouveau mot de passe"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                    onClick={toggleConfirmPasswordVisibility}
                    aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-red-600 text-sm mt-1">Les mots de passe ne correspondent pas</p>
                )}
              </div>

              {passwordError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-red-700 font-medium">{passwordError}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 rounded-b-2xl px-6 py-4 flex justify-between border-t border-gray-200 flex-shrink-0">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-semibold flex items-center text-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour
          </button>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors font-semibold text-sm"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!isModified || saveLoading}
              className={`px-6 py-3 rounded-xl transition-colors font-semibold flex items-center text-sm
                ${(!isModified || saveLoading)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
                }
              `}
            >
              {saveLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Sauvegarde...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Sauvegarder
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileComponent;