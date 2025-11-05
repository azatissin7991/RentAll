import { useState } from 'react';
import type { Parcels } from '../types';
import { parcelsApi } from '../services/api';

interface ParcelsFormProps {
  parcel?: Parcels;
  onSuccess: () => void;
}

export const ParcelsForm = ({ parcel, onSuccess }: ParcelsFormProps) => {
  const [formData, setFormData] = useState<Partial<Parcels>>({
    direction: parcel?.direction || 'US_to_Kazakhstan',
    travelDate: parcel?.travelDate 
      ? (typeof parcel.travelDate === 'string' 
          ? parcel.travelDate.split('T')[0] 
          : new Date(parcel.travelDate).toISOString().split('T')[0])
      : new Date().toISOString().split('T')[0],
    locationFrom: parcel?.locationFrom || '',
    locationTo: parcel?.locationTo || '',
    description: parcel?.description || '',
    contactPhone: parcel?.contactPhone || '',
    contactEmail: parcel?.contactEmail || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (parcel?._id) {
        await parcelsApi.update(parcel._id, formData);
      } else {
        await parcelsApi.create(formData as Omit<Parcels, '_id' | 'createdAt' | 'updatedAt'>);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500">{error}</div>}
      
      <div>
        <label className="block text-sm font-medium mb-1">Направление</label>
        <select
          value={formData.direction}
          onChange={(e) => setFormData({ ...formData, direction: e.target.value as Parcels['direction'] })}
          className="w-full p-2 border rounded"
          required
        >
          <option value="US_to_Kazakhstan">США → Казахстан</option>
          <option value="Kazakhstan_to_US">Казахстан → США</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Дата поездки</label>
        <input
          type="date"
          value={formData.travelDate}
          onChange={(e) => setFormData({ ...formData, travelDate: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Откуда</label>
        <input
          type="text"
          value={formData.locationFrom}
          onChange={(e) => setFormData({ ...formData, locationFrom: e.target.value })}
          className="w-full p-2 border rounded"
          required
          placeholder="например, Лос-Анджелес, Калифорния"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Куда</label>
        <input
          type="text"
          value={formData.locationTo}
          onChange={(e) => setFormData({ ...formData, locationTo: e.target.value })}
          className="w-full p-2 border rounded"
          required
          placeholder="например, Алматы, Казахстан"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Описание</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full p-2 border rounded"
          required
          placeholder="Что вы можете доставить?"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Контактный телефон</label>
        <input
          type="text"
          value={formData.contactPhone}
          onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Контактный email (необязательно)</label>
        <input
          type="email"
          value={formData.contactEmail}
          onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
          className="w-full p-2 border rounded"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-700 disabled:opacity-50"
      >
        {loading ? 'Сохранение...' : parcel ? 'Обновить' : 'Создать'}
      </button>
    </form>
  );
};

