import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import { housingApi, autoApi, parcelsApi } from '../services/api';
import type { Housing, Auto, Parcels } from '../types';
import { HousingForm } from '../components/HousingForm';
import { AutoForm } from '../components/AutoForm';
import { ParcelsForm } from '../components/ParcelsForm';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';

type TabType = 'housing' | 'auto' | 'parcels';

export const MyListingsPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('housing');
  const [housing, setHousing] = useState<Housing[]>([]);
  const [auto, setAuto] = useState<Auto[]>([]);
  const [parcels, setParcels] = useState<Parcels[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Housing | Auto | Parcels | undefined>();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Track if user came from detail page to handle cancel navigation
  const fromDetail = (location.state as any)?.from === 'detail';
  const detailId = (location.state as any)?.detailId;
  const detailType = (location.state as any)?.detailType; // 'housing', 'auto', or 'parcels'

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadAllListings();
  }, [isAuthenticated, navigate]);

  // Handle edit query parameter - wait for listings to load
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId && !loading) {
      // Try to find the item in loaded lists first
      const housingItem = housing.find(item => item._id === editId);
      const autoItem = auto.find(item => item._id === editId);
      const parcelItem = parcels.find(item => item._id === editId);

      if (housingItem) {
        setActiveTab('housing');
        setEditingItem(housingItem);
        setShowForm(true);
        setSearchParams({}); // Clear the query parameter
      } else if (autoItem) {
        setActiveTab('auto');
        setEditingItem(autoItem);
        setShowForm(true);
        setSearchParams({}); // Clear the query parameter
      } else if (parcelItem) {
        setActiveTab('parcels');
        setEditingItem(parcelItem);
        setShowForm(true);
        setSearchParams({}); // Clear the query parameter
      } else if (housing.length === 0 && auto.length === 0 && parcels.length === 0) {
        // If lists are empty but loading is done, item might not exist or lists are empty
        // Try to fetch the specific item by ID
        const fetchItemById = async () => {
          try {
            // Try housing first
            try {
              const item = await housingApi.getById(editId);
              if (item.user === user?._id) {
                setActiveTab('housing');
                setEditingItem(item);
                setShowForm(true);
                setSearchParams({});
                return;
              }
            } catch {}

            // Try auto
            try {
              const item = await autoApi.getById(editId);
              if (item.user === user?._id) {
                setActiveTab('auto');
                setEditingItem(item);
                setShowForm(true);
                setSearchParams({});
                return;
              }
            } catch {}

            // Try parcels
            try {
              const item = await parcelsApi.getById(editId);
              if (item.user === user?._id) {
                setActiveTab('parcels');
                setEditingItem(item);
                setShowForm(true);
                setSearchParams({});
                return;
              }
            } catch {}
          } catch (err) {
            console.error('Failed to fetch item for editing:', err);
          }
        };
        fetchItemById();
      }
    }
  }, [searchParams, housing, auto, parcels, loading, setSearchParams, user?._id]);

  const loadAllListings = async () => {
    try {
      setLoading(true);
      const [housingData, autoData, parcelsData] = await Promise.all([
        housingApi.getMyListings(),
        autoApi.getMyListings(),
        parcelsApi.getMyListings(),
      ]);
      setHousing(housingData);
      setAuto(autoData);
      setParcels(parcelsData);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить объявления');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, type: TabType) => {
    if (!confirm('Вы уверены, что хотите удалить это объявление?')) return;
    try {
      if (type === 'housing') {
        await housingApi.delete(id);
      } else if (type === 'auto') {
        await autoApi.delete(id);
      } else {
        await parcelsApi.delete(id);
      }
      loadAllListings();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Не удалось удалить');
    }
  };

  const handleDeleteAll = async () => {
    const currentListings = activeTab === 'housing' ? housing : activeTab === 'auto' ? auto : parcels;
    const listingType = activeTab === 'housing' ? 'housing' : activeTab === 'auto' ? 'auto' : 'parcel';
    
    if (currentListings.length === 0) {
      alert(`Нет ${listingType === 'housing' ? 'объявлений о жилье' : listingType === 'auto' ? 'объявлений об авто' : 'объявлений о посылках'} для удаления.`);
      return;
    }

    const confirmMessage = `Вы уверены, что хотите удалить ВСЕ ${currentListings.length} ${listingType === 'housing' ? 'объявлений о жилье' : listingType === 'auto' ? 'объявлений об авто' : 'объявлений о посылках'}? Это действие нельзя отменить.`;
    if (!confirm(confirmMessage)) return;

    try {
      // Delete all listings in parallel
      const deletePromises = currentListings.map((item) => {
        if (!item._id) return Promise.resolve();
        if (activeTab === 'housing') {
          return housingApi.delete(item._id);
        } else if (activeTab === 'auto') {
          return autoApi.delete(item._id);
        } else {
          return parcelsApi.delete(item._id);
        }
      });

      await Promise.all(deletePromises);
      loadAllListings();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Не удалось удалить все объявления');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingItem(undefined);
    loadAllListings();
    
    // If came from detail page, navigate back after successful save
    if (fromDetail && detailId && detailType) {
      navigate(`/${detailType}/${detailId}`);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(undefined);
    
    // If came from detail page, navigate back to detail page
    if (fromDetail && detailId && detailType) {
      navigate(`/${detailType}/${detailId}`);
    } else {
      // Otherwise, just reload listings to refresh the page
      loadAllListings();
    }
  };

  const handleAddNew = () => {
    setEditingItem(undefined);
    setShowForm(true);
  };

  const handleEdit = (item: Housing | Auto | Parcels) => {
    setEditingItem(item);
    setShowForm(true);
  };

  if (loading) return <LoadingSpinner />;
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-medium">Ошибка загрузки объявлений</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  const currentListings = activeTab === 'housing' ? housing : activeTab === 'auto' ? auto : parcels;
  const totalListings = housing.length + auto.length + parcels.length;

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Мои объявления</h1>
        <p className="text-gray-600 text-sm sm:text-base">Управляйте всеми своими объявлениями в одном месте</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700">
            Всего: {totalListings} {totalListings === 1 ? 'объявление' : totalListings < 5 ? 'объявления' : 'объявлений'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          <button
            onClick={() => {
              setActiveTab('housing');
              setShowForm(false);
              setEditingItem(undefined);
            }}
            className={`px-4 py-3 font-medium text-sm sm:text-base whitespace-nowrap transition-colors ${
              activeTab === 'housing'
                ? 'border-b-2 border-stone-600 text-stone-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Жилье ({housing.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('auto');
              setShowForm(false);
              setEditingItem(undefined);
            }}
            className={`px-4 py-3 font-medium text-sm sm:text-base whitespace-nowrap transition-colors ${
              activeTab === 'auto'
                ? 'border-b-2 border-stone-600 text-stone-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Авто ({auto.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('parcels');
              setShowForm(false);
              setEditingItem(undefined);
            }}
            className={`px-4 py-3 font-medium text-sm sm:text-base whitespace-nowrap transition-colors ${
              activeTab === 'parcels'
                ? 'border-b-2 border-stone-600 text-stone-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Посылки ({parcels.length})
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={showForm ? handleCancel : handleAddNew}
          className="flex-1 sm:flex-none sm:w-auto px-6 py-3 bg-slate-600 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors shadow-sm hover:shadow-md flex items-center justify-center gap-2"
        >
          {showForm ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Отмена
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Добавить новое объявление {activeTab === 'housing' ? 'о жилье' : activeTab === 'auto' ? 'об авто' : 'о посылках'}
            </>
          )}
        </button>
        
        {!showForm && currentListings.length > 0 && (
          <button
            onClick={handleDeleteAll}
            className="flex-1 sm:flex-none sm:w-auto px-6 py-3 bg-slate-600 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors shadow-sm hover:shadow-md flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="hidden sm:inline">Удалить все</span>
            <span className="sm:hidden">Удалить все ({currentListings.length})</span>
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {editingItem ? 'Редактировать объявление' : 'Создать новое объявление'}
          </h2>
          {activeTab === 'housing' && (
            <HousingForm
              housing={editingItem as Housing | undefined}
              onSuccess={handleFormSuccess}
            />
          )}
          {activeTab === 'auto' && (
            <AutoForm
              auto={editingItem as Auto | undefined}
              onSuccess={handleFormSuccess}
            />
          )}
          {activeTab === 'parcels' && (
            <ParcelsForm
              parcel={editingItem as Parcels | undefined}
              onSuccess={handleFormSuccess}
            />
          )}
        </div>
      )}

      {/* Listings Grid */}
      {currentListings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {activeTab === 'housing' &&
            housing.map((item) => (
              <Link
                key={item._id}
                to={`/housing/${item._id}`}
                state={{ from: 'my-listings' }}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200 flex flex-col cursor-pointer"
              >
                {(item.thumbnail || (item.images && item.images.length > 0)) && (
                  <div className="w-full h-48 overflow-hidden">
                    <img
                      src={item.thumbnail || item.images[0]}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-5 sm:p-6 flex-1 flex flex-col">
                  <div className="mb-3">
                    <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-700 mb-2">
                      {item.listingType === 'room' ? 'Комната' : item.listingType === 'apartment' ? 'Квартира' : 'Место в комнате'}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">{item.location}</p>
                  </div>
                  <p className="text-2xl font-bold text-slate-700 mb-4">
                    ${item.price.toLocaleString()}/месяц
                  </p>
                  <p className="text-sm text-gray-700 mb-4 line-clamp-2 flex-1">{item.description}</p>
                  <div className="mt-auto pt-4 border-t border-gray-100 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm">
                      {item.contactEmail && (
                        <a
                          href={`mailto:${item.contactEmail}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-slate-600 hover:text-slate-700 hover:underline truncate"
                          title={item.contactEmail}
                        >
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="truncate">{item.contactEmail}</span>
                        </a>
                      )}
                      <a
                        href={`tel:${item.contactPhone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-slate-600 hover:text-slate-700 hover:underline"
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="truncate">{item.contactPhone}</span>
                      </a>
                    </div>
                    <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleEdit(item);
                      }}
                      className="flex-1 px-3 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        item._id && handleDelete(item._id, 'housing');
                      }}
                      className="flex-1 px-3 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
                    >
                      Удалить
                    </button>
                  </div>
                  </div>
                </div>
              </Link>
            ))}

          {activeTab === 'auto' &&
            auto.map((item) => (
              <Link
                key={item._id}
                to={`/auto/${item._id}`}
                state={{ from: 'my-listings' }}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200 flex flex-col cursor-pointer"
              >
                {(item.thumbnail || (item.images && item.images.length > 0)) && (
                  <div className="w-full h-48 overflow-hidden">
                    <img
                      src={item.thumbnail || item.images[0]}
                      alt={`${item.year} ${item.make} ${item.model}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-5 sm:p-6 flex-1 flex flex-col">
                  <div className="mb-3">
                    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-2 ${
                      item.listingType === 'rent' ? 'bg-stone-200 text-stone-800' : 'bg-slate-200 text-slate-800'
                    }`}>
                      {item.listingType === 'rent' ? 'Аренда' : 'Продажа'}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                      {item.year} {item.make} {item.model}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">{item.location}</p>
                  </div>
                  <p className="text-2xl font-bold text-slate-700 mb-2">
                    ${item.price.toLocaleString()}{item.listingType === 'rent' ? '/месяц' : ''}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    {item.mileage.toLocaleString()} миль • {item.condition === 'excellent' ? 'Отличное' : item.condition === 'good' ? 'Хорошее' : item.condition === 'fair' ? 'Удовлетворительное' : 'Плохое'}
                  </p>
                  <p className="text-sm text-gray-500 mb-2">
                    {item.transmission === 'automatic' ? 'Автомат' : 'Механика'} • {item.fuelType === 'gasoline' ? 'Бензин' : item.fuelType === 'electric' ? 'Электрический' : item.fuelType === 'hybrid' ? 'Гибрид' : 'Дизель'}
                  </p>
                  <p className="text-sm text-gray-700 mb-4 line-clamp-2 flex-1">{item.description}</p>
                  <div className="mt-auto pt-4 border-t border-gray-100 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm">
                      {item.contactEmail && (
                        <a
                          href={`mailto:${item.contactEmail}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-slate-600 hover:text-slate-700 hover:underline truncate"
                          title={item.contactEmail}
                        >
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="truncate">{item.contactEmail}</span>
                        </a>
                      )}
                      <a
                        href={`tel:${item.contactPhone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-slate-600 hover:text-slate-700 hover:underline"
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="truncate">{item.contactPhone}</span>
                      </a>
                    </div>
                    <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleEdit(item);
                      }}
                      className="flex-1 px-3 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        item._id && handleDelete(item._id, 'auto');
                      }}
                      className="flex-1 px-3 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
                    >
                      Удалить
                    </button>
                  </div>
                  </div>
                </div>
              </Link>
            ))}

          {activeTab === 'parcels' &&
            parcels.map((item) => (
              <Link
                key={item._id}
                to={`/parcels/${item._id}`}
                state={{ from: 'my-listings' }}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200 flex flex-col cursor-pointer"
              >
                <div className="p-5 sm:p-6 flex-1 flex flex-col">
                  <div className="mb-3">
                    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-2 ${
                      item.direction === 'US_to_Kazakhstan' ? 'bg-stone-200 text-stone-800' : 'bg-slate-200 text-slate-800'
                    }`}>
                      {item.direction === 'US_to_Kazakhstan' ? 'США → КЗ' : 'КЗ → США'}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                      {item.locationFrom} → {item.locationTo}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {new Date(item.travelDate).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <p className="text-sm text-gray-700 mb-4 line-clamp-2 flex-1">{item.description}</p>
                  <div className="mt-auto pt-4 border-t border-gray-100 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm">
                      {item.contactEmail && (
                        <a
                          href={`mailto:${item.contactEmail}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-slate-600 hover:text-slate-700 hover:underline truncate"
                          title={item.contactEmail}
                        >
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="truncate">{item.contactEmail}</span>
                        </a>
                      )}
                      <a
                        href={`tel:${item.contactPhone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-slate-600 hover:text-slate-700 hover:underline"
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="truncate">{item.contactPhone}</span>
                      </a>
                    </div>
                    <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleEdit(item);
                      }}
                      className="flex-1 px-3 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        item._id && handleDelete(item._id, 'parcels');
                      }}
                      className="flex-1 px-3 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
                    >
                      Удалить
                    </button>
                  </div>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg font-medium text-gray-900 mb-2">Объявления {activeTab === 'housing' ? 'о жилье' : activeTab === 'auto' ? 'об авто' : 'о посылках'} не найдены</p>
          <button
            onClick={handleAddNew}
            className="mt-4 px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
          >
            Создайте ваше первое объявление {activeTab === 'housing' ? 'о жилье' : activeTab === 'auto' ? 'об авто' : 'о посылках'}
          </button>
        </div>
      )}
    </div>
  );
};

