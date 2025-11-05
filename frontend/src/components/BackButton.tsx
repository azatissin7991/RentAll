import { Link } from 'react-router-dom';

interface BackButtonProps {
  to: string;
  label?: string;
  className?: string;
}

/**
 * Reusable back button component
 * Provides consistent navigation back to a previous page
 * 
 * @param to - Path to navigate to
 * @param label - Button label (default: "Back to Listings")
 * @param className - Additional CSS classes
 */
export const BackButton: React.FC<BackButtonProps> = ({
  to,
  label = 'Назад к объявлениям',
  className = '',
}) => {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-2 text-gray-600 hover:text-stone-700 transition-colors ${className}`}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      {label}
    </Link>
  );
};

