import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { housingApi } from '../services/api';
import type { Housing } from '../types';
import { HousingForm } from '../components/HousingForm';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const HousingPage = () => {
  const [housing, setHousing] = useState<Housing[]>([]);
  const [filteredHousing, setFilteredHousing] = useState<Housing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [editingHousing, setEditingHousing] = useState<Housing | undefined>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Filter states
  const [filters, setFilters] = useState({
    location: '' as '' | 'Orange County' | 'Los Angeles',
    listingType: '' as '' | 'room' | 'apartment' | 'spot_in_room',
    maxPrice: '',
    gender: '' as '' | 'men' | 'women' | 'any',
  });

  const loadHousing = async () => {
    try {
      setLoading(true);
      const data = await housingApi.getAll();
      setHousing(data);
      setFilteredHousing(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить объявления');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHousing();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...housing];

    if (filters.location) {
      filtered = filtered.filter(item => item.location === filters.location);
    }

    if (filters.listingType) {
      filtered = filtered.filter(item => item.listingType === filters.listingType);
    }

    if (filters.maxPrice) {
      const max = parseInt(filters.maxPrice);
      filtered = filtered.filter(item => item.price <= max);
    }

    if (filters.gender) {
      filtered = filtered.filter(item => item.gender === filters.gender || item.gender === 'any');
    }

    setFilteredHousing(filtered);
  }, [housing, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      listingType: '',
      maxPrice: '',
      gender: '',
    });
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;


  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingHousing(undefined);
    loadHousing();
  };

  const handleAddNew = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setEditingHousing(undefined);
    setShowForm(!showForm);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Объявления о жилье</h1>
          <p className="text-gray-600 text-sm sm:text-base">Найдите свое идеальное место</p>
        </div>
        <button
          onClick={handleAddNew}
          className="w-full sm:w-auto px-6 py-3 bg-slate-600 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors shadow-sm hover:shadow-md flex items-center justify-center gap-2"
        >
          {showForm ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Отмена
            </>
          ) : isAuthenticated ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Добавить объявление
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Войдите для добавления
            </>
          )}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {editingHousing ? 'Редактировать объявление' : 'Создать новое объявление'}
          </h2>
          <HousingForm housing={editingHousing} onSuccess={handleFormSuccess} />
        </div>
      )}

      {/* Filters */}
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-md border border-slate-200 p-4 sm:p-6 overflow-hidden relative">
        {/* Decorative accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-400 via-slate-500 to-slate-400"></div>
        
        <div className="flex items-center justify-between mb-4 mt-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-800 font-semibold transition-all duration-200 shadow-sm hover:shadow"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Фильтры
            {activeFiltersCount > 0 && (
              <span className="inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-bold leading-none text-white bg-slate-600 rounded-full shadow-sm">
                {activeFiltersCount}
              </span>
            )}
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg font-medium transition-all duration-200"
            >
              Очистить все
            </button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-200">
            <div className="bg-white/60 rounded-lg p-3 border border-slate-200/50">
              <label className="flex items-center gap-1 text-sm font-semibold text-slate-700 mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Местоположение
              </label>
              <select
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-slate-400 focus:border-slate-500 transition-all shadow-sm"
              >
                <option value="">Все местоположения</option>
                <option value="Orange County">Orange County</option>
                <option value="Los Angeles">Los Angeles</option>
              </select>
            </div>

            <div className="bg-white/60 rounded-lg p-3 border border-slate-200/50">
              <label className="flex items-center gap-1 text-sm font-semibold text-slate-700 mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Тип объявления
              </label>
              <select
                value={filters.listingType}
                onChange={(e) => handleFilterChange('listingType', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-slate-400 focus:border-slate-500 transition-all shadow-sm"
              >
                <option value="">Все типы</option>
                <option value="room">Комната</option>
                <option value="apartment">Квартира</option>
                <option value="spot_in_room">Место в комнате</option>
              </select>
            </div>

            <div className="bg-white/60 rounded-lg p-3 border border-slate-200/50">
              <label className="flex items-center gap-1 text-sm font-semibold text-slate-700 mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Максимальная цена ($)
              </label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
               
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-slate-400 focus:border-slate-500 transition-all shadow-sm"
              />
            </div>

            <div className="bg-white/60 rounded-lg p-3 border border-slate-200/50">
              <label className="flex items-center gap-1 text-sm font-semibold text-slate-700 mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Пол (место в комнате)
              </label>
              <select
                value={filters.gender}
                onChange={(e) => handleFilterChange('gender', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-slate-400 focus:border-slate-500 transition-all shadow-sm"
              >
                <option value="">Любой</option>
                <option value="men">Мужской</option>
                <option value="women">Женский</option>
                <option value="any">Любой</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results count */}
      {housing.length > 0 && (
        <div className="text-sm text-gray-600">
          Показано {filteredHousing.length} из {housing.length} {housing.length === 1 ? 'объявление' : housing.length < 5 ? 'объявления' : 'объявлений'}
        </div>
      )}

      {filteredHousing.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredHousing.map((item) => (
            <Link
              key={item._id}
              to={`/housing/${item._id}`}
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
                  <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {item.location}
                  </p>
                </div>
                
                <div className="mb-4">
                  <p className="text-2xl sm:text-3xl font-bold text-slate-700 mb-1">
                    ${item.price.toLocaleString()}
                    <span className="text-sm sm:text-base font-normal text-gray-600">/месяц</span>
                  </p>
                </div>

                <p className="text-sm text-gray-700 mb-4 line-clamp-3 flex-1">{item.description}</p>

                <div className="mt-auto pt-4 border-t border-gray-100">
                  <div className="space-y-2">
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
                    {item.amenities && item.amenities.length > 0 && (
                      <p className="text-xs text-gray-500">{item.amenities.length} {item.amenities.length === 1 ? 'удобство' : item.amenities.length < 5 ? 'удобства' : 'удобств'}</p>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <p className="text-lg font-medium text-gray-900 mb-2">
            {activeFiltersCount > 0 ? 'Нет объявлений, соответствующих фильтрам' : 'Объявления о жилье не найдены'}
          </p>
          {activeFiltersCount > 0 && (
            <p className="text-gray-500 mb-4">
              Попробуйте изменить фильтры
            </p>
          )}
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              Очистить фильтры
            </button>
          )}
        </div>
      )}
    </div>
  );
};

