import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ActionButtonsProps {
  listingId: string;
  listingType: 'housing' | 'auto' | 'parcels';
  onDelete: () => Promise<void>;
  backPath?: string;
  className?: string;
}

/**
 * Action buttons component for listing detail pages
 * Provides Edit and Delete functionality for listing owners
 * 
 * @param listingId - ID of the listing
 * @param listingType - Type of listing (housing, auto, or parcels)
 * @param onDelete - Async function to handle listing deletion
 * @param backPath - Path to navigate back to after deletion
 * @param className - Additional CSS classes
 */
export const ActionButtons: React.FC<ActionButtonsProps> = ({
  listingId,
  listingType,
  onDelete,
  backPath,
  className = '',
}) => {
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (confirm('Вы уверены, что хотите удалить это объявление?')) {
      try {
        await onDelete();
        if (backPath) {
          navigate(backPath);
        }
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Не удалось удалить');
      }
    }
  };

  const handleEdit = () => {
    navigate(`/my-listings?edit=${listingId}`, {
      state: {
        from: 'detail',
        detailId: listingId,
        detailType: listingType,
      },
    });
  };

  return (
    <div className={`p-6 sm:p-8 border-t border-gray-200 ${className}`}>
      <div className="flex gap-3">
        <button
          onClick={handleEdit}
          className="flex-1 px-4 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
        >
          Редактировать объявление
        </button>
        <button
          onClick={handleDelete}
          className="flex-1 px-4 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
        >
          Удалить объявление
        </button>
      </div>
    </div>
  );
};

