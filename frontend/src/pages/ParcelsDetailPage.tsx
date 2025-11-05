import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { parcelsApi } from '../services/api';
import type { Parcels } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

export const ParcelsDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [parcel, setParcel] = useState<Parcels | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, isAuthenticated } = useAuth();

  // Determine back navigation based on where user came from
  const fromMyListings = (location.state as any)?.from === 'my-listings';
  const backPath = fromMyListings ? '/my-listings' : '/parcels';

  useEffect(() => {
    if (id) {
      loadParcel();
    }
  }, [id]);

  const loadParcel = async () => {
    try {
      setLoading(true);
      const data = await parcelsApi.getById(id!);
      setParcel(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить объявление');
    } finally {
      setLoading(false);
    }
  };

  const isOwner = isAuthenticated && user && parcel?.user === user._id;

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

  if (!parcel) {
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
      <Link
        to={backPath}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-stone-700 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Назад к объявлениям
      </Link>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header Section */}
        <div className="p-6 sm:p-8 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex-1">
              <span className={`inline-block px-4 py-2 text-sm font-semibold rounded-full mb-3 ${
                parcel.direction === 'US_to_Kazakhstan' ? 'bg-stone-200 text-stone-800' : 'bg-slate-200 text-slate-800'
              }`}>
                {parcel.direction === 'US_to_Kazakhstan' ? 'США → Казахстан' : 'Казахстан → США'}
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                {parcel.locationFrom} → {parcel.locationTo}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-600">
                <span className="flex items-center gap-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm sm:text-base">Дата поездки: {new Date(parcel.travelDate).toLocaleDateString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </span>
              </div>
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
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{parcel.description}</p>
              </div>

              {/* Route Information */}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Информация о маршруте</h2>
                <div className="space-y-3">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Откуда</p>
                    <p className="text-lg font-semibold text-gray-900">{parcel.locationFrom}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Куда</p>
                    <p className="text-lg font-semibold text-gray-900">{parcel.locationTo}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Дата поездки</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(parcel.travelDate).toLocaleDateString('ru-RU', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Contact Information */}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Контактная информация</h2>
                <div className="space-y-3">
                  {parcel.contactEmail && (
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Email</p>
                      <a
                        href={`mailto:${parcel.contactEmail}`}
                        className="text-lg font-semibold text-slate-600 hover:text-slate-700 hover:underline"
                      >
                        {parcel.contactEmail}
                      </a>
                    </div>
                  )}
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Телефон</p>
                    <a
                      href={`tel:${parcel.contactPhone}`}
                      className="text-lg font-semibold text-slate-600 hover:text-slate-700 hover:underline"
                    >
                      {parcel.contactPhone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {isOwner && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate(`/my-listings?edit=${parcel._id}`, { 
                        state: { 
                          from: 'detail',
                          detailId: parcel._id,
                          detailType: 'parcels'
                        } 
                      })}
                      className="flex-1 px-4 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
                    >
                      Редактировать объявление
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm('Вы уверены, что хотите удалить это объявление?')) {
                          try {
                            await parcelsApi.delete(parcel._id!);
                            navigate(backPath);
                          } catch (err) {
                            alert(err instanceof Error ? err.message : 'Не удалось удалить');
                          }
                        }
                      }}
                      className="flex-1 px-4 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
                    >
                      Удалить объявление
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

