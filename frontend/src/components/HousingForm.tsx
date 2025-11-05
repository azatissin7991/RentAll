import { useState } from 'react';
import type { Housing } from '../types';
import { housingApi } from '../services/api';
import { uploadImage } from '../utils/cloudinary';

interface HousingFormProps {
  housing?: Housing;
  onSuccess: () => void;
}

export const HousingForm = ({ housing, onSuccess }: HousingFormProps) => {
  const [formData, setFormData] = useState<Partial<Housing>>({
    listingType: housing?.listingType || 'room',
    title: housing?.title || '',
    description: housing?.description || '',
    location: housing?.location || 'Orange County',
    address: housing?.address || '',
    price: housing?.price || 0,
    gender: housing?.gender || 'any',
    amenities: housing?.amenities || [],
    thumbnail: housing?.thumbnail || '',
    images: housing?.images || [],
    contactPhone: housing?.contactPhone || '',
    contactEmail: housing?.contactEmail || '',
    availableFrom: housing?.availableFrom 
      ? (typeof housing.availableFrom === 'string' 
          ? housing.availableFrom.split('T')[0] 
          : new Date(housing.availableFrom).toISOString().split('T')[0])
      : new Date().toISOString().split('T')[0],
    availableUntil: housing?.availableUntil 
      ? (typeof housing.availableUntil === 'string' 
          ? housing.availableUntil.split('T')[0] 
          : new Date(housing.availableUntil).toISOString().split('T')[0])
      : '',
  });
  const [amenityInput, setAmenityInput] = useState('');
  const [priceInput, setPriceInput] = useState<string>(housing?.price && housing.price > 0 ? housing.price.toString() : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Ensure price is a valid number
      const submitData = {
        ...formData,
        price: priceInput === '' ? 0 : Number(priceInput) || 0,
      };

      if (housing?._id) {
        await housingApi.update(housing._id, submitData);
      } else {
        await housingApi.create(submitData as Omit<Housing, '_id' | 'createdAt' | 'updatedAt'>);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const addAmenity = () => {
    if (amenityInput.trim()) {
      setFormData({
        ...formData,
        amenities: [...(formData.amenities || []), amenityInput.trim()],
      });
      setAmenityInput('');
    }
  };

  const removeAmenity = (index: number) => {
    setFormData({
      ...formData,
      amenities: formData.amenities?.filter((_, i) => i !== index) || [],
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    setError('');

    try {
      const uploadPromises = Array.from(files).map(file => uploadImage(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      
      setFormData({
        ...formData,
        images: [...(formData.images || []), ...uploadedUrls],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить изображения');
    } finally {
      setUploadingImages(false);
      // Reset input
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images?.filter((_, i) => i !== index) || [],
    });
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingThumbnail(true);
    setError('');

    try {
      const uploadedUrl = await uploadImage(file);
      setFormData({
        ...formData,
        thumbnail: uploadedUrl,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить миниатюру');
    } finally {
      setUploadingThumbnail(false);
      // Reset input
      e.target.value = '';
    }
  };

  const removeThumbnail = () => {
    setFormData({
      ...formData,
      thumbnail: '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500">{error}</div>}
      
      <div>
        <label className="block text-sm font-medium mb-1">Тип объявления</label>
        <select
          value={formData.listingType}
          onChange={(e) => setFormData({ ...formData, listingType: e.target.value as Housing['listingType'] })}
          className="w-full p-2 border rounded"
          required
        >
          <option value="room">Комната</option>
          <option value="apartment">Квартира</option>
          <option value="spot_in_room">Место в комнате</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Название</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Описание</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Местоположение</label>
        <select
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value as Housing['location'] })}
          className="w-full p-2 border rounded"
          required
        >
          <option value="Orange County">Orange County</option>
          <option value="Los Angeles">Los Angeles</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Адрес (необязательно)</label>
        <input
          type="text"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Цена (в месяц)</label>
        <input
          type="number"
          value={priceInput}
          onChange={(e) => {
            setPriceInput(e.target.value);
            const numValue = e.target.value === '' ? 0 : Number(e.target.value);
            setFormData({ ...formData, price: numValue });
          }}
          onBlur={() => {
            if (priceInput === '') {
              setPriceInput('');
              setFormData({ ...formData, price: 0 });
            }
          }}
          className="w-full p-2 border rounded"
          required
          min="0"
        />
      </div>

      {formData.listingType === 'spot_in_room' && (
        <div>
          <label className="block text-sm font-medium mb-1">Пол</label>
          <select
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value as Housing['gender'] })}
            className="w-full p-2 border rounded"
            required
          >
            <option value="men">Мужской</option>
            <option value="women">Женский</option>
            <option value="any">Любой</option>
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Главное изображение</label>
        
        <input
          type="file"
          accept="image/*"
          onChange={handleThumbnailUpload}
          disabled={uploadingThumbnail}
          className="w-full p-2 border rounded mb-2"
        />
        {uploadingThumbnail && (
          <p className="text-sm text-gray-500 mb-2">Загрузка миниатюры...</p>
        )}
        {formData.thumbnail && (
          <div className="relative group mb-2 inline-block">
            <img
              src={formData.thumbnail}
              alt="Thumbnail"
              className="w-32 h-32 object-cover rounded border"
            />
            <button
              type="button"
              onClick={removeThumbnail}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              title="Удалить миниатюру"
            >
              ×
            </button>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Изображения</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          disabled={uploadingImages}
          className="w-full p-2 border rounded mb-2"
        />
        {uploadingImages && (
          <p className="text-sm text-gray-500 mb-2">Загрузка изображений...</p>
        )}
        {formData.images && formData.images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
            {formData.images.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <img
                  src={imageUrl}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-24 object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Удалить изображение"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Удобства</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={amenityInput}
            onChange={(e) => setAmenityInput(e.target.value)}
            className="flex-1 p-2 border rounded"
            placeholder="Добавить удобство"
          />
          <button type="button" onClick={addAmenity} className="px-4 py-2 bg-gray-200 rounded">
            Добавить
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.amenities?.map((amenity, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-slate-100 rounded flex items-center gap-2"
            >
              {amenity}
              <button
                type="button"
                onClick={() => removeAmenity(index)}
                className="text-red-500"
              >
                ×
              </button>
            </span>
          ))}
        </div>
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

      <div>
        <label className="block text-sm font-medium mb-1">Доступно с</label>
        <input
          type="date"
          value={formData.availableFrom}
          onChange={(e) => setFormData({ ...formData, availableFrom: e.target.value })}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Доступно до (необязательно)</label>
        <input
          type="date"
          value={formData.availableUntil || ''}
          onChange={(e) => setFormData({ ...formData, availableUntil: e.target.value || undefined })}
          className="w-full p-2 border rounded"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-700 disabled:opacity-50"
      >
        {loading ? 'Сохранение...' : housing ? 'Обновить' : 'Создать'}
      </button>
    </form>
  );
};

