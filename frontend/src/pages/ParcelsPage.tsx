import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { parcelsApi } from '../services/api';
import type { Parcels } from '../types';
import { ParcelsForm } from '../components/ParcelsForm';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/LoadingSpinner';

export const ParcelsPage = () => {
  const [parcels, setParcels] = useState<Parcels[]>([]);
  const [filteredParcels, setFilteredParcels] = useState<Parcels[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [editingParcel, setEditingParcel] = useState<Parcels | undefined>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Filter states
  const [filters, setFilters] = useState({
    direction: '' as '' | 'US_to_Kazakhstan' | 'Kazakhstan_to_US',
    locationFrom: '',
    locationTo: '',
    fromDate: '',
    toDate: '',
  });

  const loadParcels = async () => {
    try {
      setLoading(true);
      const data = await parcelsApi.getAll();
      setParcels(data);
      setFilteredParcels(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить объявления');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParcels();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...parcels];

    if (filters.direction) {
      filtered = filtered.filter(item => item.direction === filters.direction);
    }

    if (filters.locationFrom) {
      filtered = filtered.filter(item => 
        item.locationFrom.toLowerCase().includes(filters.locationFrom.toLowerCase())
      );
    }

    if (filters.locationTo) {
      filtered = filtered.filter(item => 
        item.locationTo.toLowerCase().includes(filters.locationTo.toLowerCase())
      );
    }

    // Travel date range filter
    if (filters.fromDate || filters.toDate) {
      filtered = filtered.filter(item => {
        const travelDate = new Date(item.travelDate);
        if (filters.fromDate && filters.toDate) {
          const fromDate = new Date(filters.fromDate);
          const toDate = new Date(filters.toDate);
          return travelDate >= fromDate && travelDate <= toDate;
        } else if (filters.fromDate) {
          const fromDate = new Date(filters.fromDate);
          return travelDate >= fromDate;
        } else if (filters.toDate) {
          const toDate = new Date(filters.toDate);
          return travelDate <= toDate;
        }
        return true;
      });
    }

    setFilteredParcels(filtered);
  }, [parcels, filters]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      direction: '',
      locationFrom: '',
      locationTo: '',
      fromDate: '',
      toDate: '',
    });
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;


  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingParcel(undefined);
    loadParcels();
  };

  const handleAddNew = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setEditingParcel(undefined);
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
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Доставка посылок</h1>
          <p className="text-gray-600 text-sm sm:text-base">Свяжитесь с путешественниками между США и Казахстаном</p>
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
            {editingParcel ? 'Редактировать объявление' : 'Создать новое объявление'}
          </h2>
          <ParcelsForm parcel={editingParcel} onSuccess={handleFormSuccess} />
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Направление
              </label>
              <select
                value={filters.direction}
                onChange={(e) => handleFilterChange('direction', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-slate-400 focus:border-slate-500 transition-all shadow-sm"
              >
                <option value="">Все направления</option>
                <option value="US_to_Kazakhstan">США → Казахстан</option>
                <option value="Kazakhstan_to_US">Казахстан → США</option>
              </select>
            </div>

            <div className="bg-white/60 rounded-lg p-3 border border-slate-200/50">
              <label className="flex items-center gap-1 text-sm font-semibold text-slate-700 mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Откуда
              </label>
              <input
                type="text"
                value={filters.locationFrom}
                onChange={(e) => handleFilterChange('locationFrom', e.target.value)}
                placeholder="например, Лос-Анджелес"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-slate-400 focus:border-slate-500 transition-all shadow-sm"
              />
            </div>

            <div className="bg-white/60 rounded-lg p-3 border border-slate-200/50">
              <label className="flex items-center gap-1 text-sm font-semibold text-slate-700 mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Куда
              </label>
              <input
                type="text"
                value={filters.locationTo}
                onChange={(e) => handleFilterChange('locationTo', e.target.value)}
                placeholder="например, Алматы"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-slate-400 focus:border-slate-500 transition-all shadow-sm"
              />
            </div>

            <div className="bg-white/60 rounded-lg p-3 border border-slate-200/50">
              <label className="flex items-center gap-1 text-sm font-semibold text-slate-700 mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Дата поездки
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="date"
                  value={filters.fromDate}
                  onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-slate-400 focus:border-slate-500 transition-all shadow-sm"
                  placeholder="От"
                />
                <span className="text-slate-500 font-medium text-center sm:text-left">до</span>
                <input
                  type="date"
                  value={filters.toDate}
                  onChange={(e) => handleFilterChange('toDate', e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-slate-400 focus:border-slate-500 transition-all shadow-sm"
                  placeholder="До"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results count */}
      {parcels.length > 0 && (
        <div className="text-sm text-gray-600">
          Показано {filteredParcels.length} из {parcels.length} {parcels.length === 1 ? 'объявление' : parcels.length < 5 ? 'объявления' : 'объявлений'}
        </div>
      )}

      {filteredParcels.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredParcels.map((item) => (
            <Link
              key={item._id}
              to={`/parcels/${item._id}`}
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
                  <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(item.travelDate).toLocaleDateString('ru-RU', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
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
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-200">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-lg font-medium text-gray-900 mb-2">
            {activeFiltersCount > 0 ? 'Нет объявлений, соответствующих фильтрам' : 'Объявления о посылках не найдены'}
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

