import { useState } from 'react';
import type { Auto } from '../types';
import { autoApi } from '../services/api';
import { uploadImage } from '../utils/cloudinary';

interface AutoFormProps {
  auto?: Auto;
  onSuccess: () => void;
}

export const AutoForm = ({ auto, onSuccess }: AutoFormProps) => {
  const [formData, setFormData] = useState<Partial<Auto>>({
    listingType: auto?.listingType || 'rent',
    make: auto?.make || '',
    model: auto?.model || '',
    year: auto?.year || new Date().getFullYear(),
    location: auto?.location || 'Orange County',
    address: auto?.address || '',
    price: auto?.price || 0,
    mileage: auto?.mileage || 0,
    condition: auto?.condition || 'good',
    transmission: auto?.transmission || 'automatic',
    fuelType: auto?.fuelType || 'gasoline',
    description: auto?.description || '',
    thumbnail: auto?.thumbnail || '',
    images: auto?.images || [],
    contactPhone: auto?.contactPhone || '',
    contactEmail: auto?.contactEmail || '',
    availableFrom: auto?.availableFrom 
      ? (typeof auto.availableFrom === 'string' 
          ? auto.availableFrom.split('T')[0] 
          : new Date(auto.availableFrom).toISOString().split('T')[0])
      : new Date().toISOString().split('T')[0],
    availableUntil: auto?.availableUntil 
      ? (typeof auto.availableUntil === 'string' 
          ? auto.availableUntil.split('T')[0] 
          : new Date(auto.availableUntil).toISOString().split('T')[0])
      : '',
  });
  const [priceInput, setPriceInput] = useState<string>(auto?.price && auto.price > 0 ? auto.price.toString() : '');
  const [mileageInput, setMileageInput] = useState<string>(auto?.mileage && auto.mileage > 0 ? auto.mileage.toString() : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Ensure price and mileage are valid numbers
      const submitData = {
        ...formData,
        price: priceInput === '' ? 0 : Number(priceInput) || 0,
        mileage: mileageInput === '' ? 0 : Number(mileageInput) || 0,
      };

      if (auto?._id) {
        await autoApi.update(auto._id, submitData);
      } else {
        await autoApi.create(submitData as Omit<Auto, '_id' | 'createdAt' | 'updatedAt'>);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
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
          onChange={(e) => setFormData({ ...formData, listingType: e.target.value as Auto['listingType'] })}
          className="w-full p-2 border rounded"
          required
        >
          <option value="rent">Аренда</option>
          <option value="sale">Продажа</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Марка</label>
          <input
            type="text"
            value={formData.make}
            onChange={(e) => setFormData({ ...formData, make: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Модель</label>
          <input
            type="text"
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Год</label>
          <input
            type="number"
            value={formData.year}
            onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
            className="w-full p-2 border rounded"
            required
            min="1900"
            max={new Date().getFullYear() + 1}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Пробег</label>
          <input
            type="number"
            value={mileageInput}
            onChange={(e) => {
              setMileageInput(e.target.value);
              const numValue = e.target.value === '' ? 0 : Number(e.target.value);
              setFormData({ ...formData, mileage: numValue });
            }}
            onBlur={() => {
              if (mileageInput === '') {
                setMileageInput('');
                setFormData({ ...formData, mileage: 0 });
              }
            }}
            className="w-full p-2 border rounded"
            required
            min="0"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Местоположение</label>
        <select
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value as Auto['location'] })}
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
        <label className="block text-sm font-medium mb-1">Цена</label>
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

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Состояние</label>
          <select
            value={formData.condition}
            onChange={(e) => setFormData({ ...formData, condition: e.target.value as Auto['condition'] })}
            className="w-full p-2 border rounded"
            required
          >
            <option value="excellent">Отличное</option>
            <option value="good">Хорошее</option>
            <option value="fair">Удовлетворительное</option>
            <option value="poor">Плохое</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Коробка передач</label>
          <select
            value={formData.transmission}
            onChange={(e) => setFormData({ ...formData, transmission: e.target.value as Auto['transmission'] })}
            className="w-full p-2 border rounded"
            required
          >
            <option value="automatic">Автоматическая</option>
            <option value="manual">Механическая</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Тип топлива</label>
          <select
            value={formData.fuelType}
            onChange={(e) => setFormData({ ...formData, fuelType: e.target.value as Auto['fuelType'] })}
            className="w-full p-2 border rounded"
            required
          >
            <option value="gasoline">Бензин</option>
            <option value="electric">Электрический</option>
            <option value="hybrid">Гибрид</option>
            <option value="diesel">Дизель</option>
          </select>
        </div>
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
        <label className="block text-sm font-medium mb-1">Миниатюра карточки (необязательно)</label>
        <p className="text-xs text-gray-500 mb-2">Это изображение будет показано на карточках объявлений. Если не указано, будет использовано первое изображение.</p>
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

      {formData.listingType === 'rent' && (
        <>
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
        </>
      )}

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
        {loading ? 'Сохранение...' : auto ? 'Обновить' : 'Создать'}
      </button>
    </form>
  );
};

