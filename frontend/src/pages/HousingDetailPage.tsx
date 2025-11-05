import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { housingApi } from '../services/api';
import type { Housing } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { useImageModal } from '../hooks/useImageModal';
import { ImageModal } from '../components/ImageModal';
import { ImageGallery } from '../components/ImageGallery';
import { BackButton } from '../components/BackButton';
import { combineImages } from '../utils/imageHelpers';
import { formatListingType, formatNumber } from '../utils/formatting';
import { formatDate } from '../utils/date';
import { ActionButtons } from '../components/ActionButtons';

export const HousingDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [housing, setHousing] = useState<Housing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, isAuthenticated } = useAuth();

  // Determine back navigation based on where user came from
  const fromMyListings = (location.state as any)?.from === 'my-listings';
  const backPath = fromMyListings ? '/my-listings' : '/housing';

  useEffect(() => {
    if (id) {
      loadHousing();
    }
  }, [id]);

  const loadHousing = async () => {
    try {
      setLoading(true);
      const data = await housingApi.getById(id!);
      setHousing(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить объявление');
    } finally {
      setLoading(false);
    }
  };

  const isOwner = isAuthenticated && user && housing?.user === user._id;

  // Combine thumbnail and images, avoiding duplicates
  const allImages = combineImages(housing?.thumbnail, housing?.images);

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

  if (!housing) {
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
        alt={housing.title}
      />

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header Section */}
        <div className="p-6 sm:p-8 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex-1">
              <span className="inline-block px-4 py-2 text-sm font-semibold rounded-full bg-slate-100 text-slate-700 mb-3">
                {formatListingType(housing.listingType)}
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{housing.title}</h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-600">
                <span className="flex items-center gap-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {housing.location}
                </span>
                {housing.address && (
                  <span className="text-sm break-words">{housing.address}</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl sm:text-5xl font-bold text-slate-700 mb-1">
                ${formatNumber(housing.price)}
              </p>
              <p className="text-gray-600">в месяц</p>
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
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{housing.description}</p>
              </div>

              {/* Property Details */}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Детали недвижимости</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {housing.listingType === 'spot_in_room' && housing.gender && (
                                          <div className="p-4 bg-slate-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Пол</p>
                        <p className="text-lg font-semibold text-gray-900">{housing.gender === 'men' ? 'Мужской' : housing.gender === 'women' ? 'Женский' : 'Любой'}</p>
                      </div>
                  )}
                </div>
              </div>

              {/* Amenities */}
              {housing.amenities && housing.amenities.length > 0 && (
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Удобства</h2>
                  <div className="flex flex-wrap gap-2">
                    {housing.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-medium"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Availability */}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Доступность</h2>
                <div className="space-y-3">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Доступно с</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDate(housing.availableFrom)}
                    </p>
                  </div>
                  {housing.availableUntil && (
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Доступно до</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDate(housing.availableUntil)}
                    </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Контактная информация</h2>
                <div className="space-y-3">
                  {housing.contactEmail && (
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Email</p>
                      <a
                        href={`mailto:${housing.contactEmail}`}
                        className="text-lg font-semibold text-slate-600 hover:text-slate-700 hover:underline"
                      >
                        {housing.contactEmail}
                      </a>
                    </div>
                  )}
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Телефон</p>
                    <a
                      href={`tel:${housing.contactPhone}`}
                      className="text-lg font-semibold text-slate-600 hover:text-slate-700 hover:underline"
                    >
                      {housing.contactPhone}
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
              alt={housing.title}
            />
          </div>
        )}

        {/* Action Buttons */}
        {isOwner && housing._id && (
          <ActionButtons
            listingId={housing._id}
            listingType="housing"
            onDelete={() => housingApi.delete(housing._id!)}
            backPath={backPath}
          />
        )}
      </div>
    </div>
  );
};

