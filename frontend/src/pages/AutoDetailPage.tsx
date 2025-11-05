import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { autoApi } from '../services/api';
import type { Auto } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { useImageModal } from '../hooks/useImageModal';
import { ImageModal } from '../components/ImageModal';
import { ImageGallery } from '../components/ImageGallery';
import { BackButton } from '../components/BackButton';
import { ActionButtons } from '../components/ActionButtons';
import { combineImages } from '../utils/imageHelpers';
import { formatNumber } from '../utils/formatting';
import { formatDate } from '../utils/date';

export const AutoDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [auto, setAuto] = useState<Auto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, isAuthenticated } = useAuth();

  // Determine back navigation based on where user came from
  const fromMyListings = (location.state as any)?.from === 'my-listings';
  const backPath = fromMyListings ? '/my-listings' : '/auto';

  useEffect(() => {
    if (id) {
      loadAuto();
    }
  }, [id]);

  const loadAuto = async () => {
    try {
      setLoading(true);
      const data = await autoApi.getById(id!);
      setAuto(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить объявление');
    } finally {
      setLoading(false);
    }
  };

  const isOwner = isAuthenticated && user && auto?.user === user._id;

  // Combine thumbnail and images, avoiding duplicates
  const allImages = combineImages(auto?.thumbnail, auto?.images);

  // Image modal hook
  const imageModal = useImageModal(allImages);

  if (loading) return <LoadingSpinner />;
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-medium">Ошибка загрузки объявления</p>
        <p className="text-sm mt-1">{error}</p>
        <Link to={backPath} className="text-stone-600 hover:underline mt-2 inline-block">
          ← Назад к объявлениям
        </Link>
      </div>
    );
  }

  if (!auto) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
        <p className="text-lg font-medium text-gray-900 mb-2">Объявление не найдено</p>
        <Link to={backPath} className="text-stone-600 hover:underline">
          ← Назад к объявлениям
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <BackButton to={backPath} />

      {/* Image Modal */}
      <ImageModal
        isOpen={imageModal.isOpen}
        images={allImages}
        currentIndex={imageModal.selectedImageIndex || 0}
        onClose={imageModal.closeModal}
        onNext={imageModal.nextImage}
        onPrev={imageModal.prevImage}
        alt={`${auto.year} ${auto.make} ${auto.model}`}
      />

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header Section */}
        <div className="p-6 sm:p-8 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex-1">
              <span className={`inline-block px-4 py-2 text-sm font-semibold rounded-full mb-3 ${
                auto.listingType === 'rent' ? 'bg-stone-200 text-stone-800' : 'bg-slate-200 text-slate-800'
              }`}>
                {auto.listingType === 'rent' ? 'Аренда' : 'Продажа'}
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                {auto.year} {auto.make} {auto.model}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-600">
                <span className="flex items-center gap-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {auto.location}
                </span>
                {auto.address && (
                  <span className="text-sm break-words">{auto.address}</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl sm:text-5xl font-bold text-slate-700 mb-1">
                ${formatNumber(auto.price)}
              </p>
              <p className="text-gray-600">{auto.listingType === 'rent' ? 'в месяц' : 'единовременно'}</p>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Описание</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{auto.description}</p>
              </div>

              {/* Vehicle Specifications */}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Характеристики автомобиля</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Год</p>
                    <p className="text-2xl font-bold text-gray-900">{auto.year}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Пробег</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(auto.mileage)}</p>
                    <p className="text-xs text-gray-500">миль</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Состояние</p>
                    <p className="text-lg font-semibold text-gray-900">{auto.condition === 'excellent' ? 'Отличное' : auto.condition === 'good' ? 'Хорошее' : auto.condition === 'fair' ? 'Удовлетворительное' : 'Плохое'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Коробка передач</p>
                    <p className="text-lg font-semibold text-gray-900">{auto.transmission === 'automatic' ? 'Автоматическая' : 'Механическая'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Тип топлива</p>
                    <p className="text-lg font-semibold text-gray-900">{auto.fuelType === 'gasoline' ? 'Бензин' : auto.fuelType === 'electric' ? 'Электрический' : auto.fuelType === 'hybrid' ? 'Гибрид' : 'Дизель'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Availability */}
              {(auto.availableFrom || auto.availableUntil) && (
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Доступность</h2>
                  <div className="space-y-3">
                    {auto.availableFrom && (
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Доступно с</p>
                        <p className="text-lg font-semibold text-gray-900">
                        {formatDate(auto.availableFrom)}
                        </p>
                      </div>
                    )}
                    {auto.availableUntil && (
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Доступно до</p>
                        <p className="text-lg font-semibold text-gray-900">
                        {formatDate(auto.availableUntil)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Контактная информация</h2>
                <div className="space-y-3">
                  {auto.contactEmail && (
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Email</p>
                      <a
                        href={`mailto:${auto.contactEmail}`}
                        className="text-lg font-semibold text-slate-600 hover:text-slate-700 hover:underline"
                      >
                        {auto.contactEmail}
                      </a>
                    </div>
                  )}
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Телефон</p>
                    <a
                      href={`tel:${auto.contactPhone}`}
                      className="text-lg font-semibold text-slate-600 hover:text-slate-700 hover:underline"
                    >
                      {auto.contactPhone}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        {allImages.length > 0 && (
          <div className="p-6 sm:p-8 border-t border-gray-200">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Изображения</h2>
            <ImageGallery
              images={allImages}
              onImageClick={imageModal.openModal}
              alt={`${auto.year} ${auto.make} ${auto.model}`}
            />
          </div>
        )}

        {/* Action Buttons */}
        {isOwner && auto._id && (
          <ActionButtons
            listingId={auto._id}
            listingType="auto"
            onDelete={() => autoApi.delete(auto._id!)}
            backPath={backPath}
          />
        )}
      </div>
    </div>
  );
};

