import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HousingPage } from './pages/HousingPage';
import { AutoPage } from './pages/AutoPage';
import { ParcelsPage } from './pages/ParcelsPage';
import { MyListingsPage } from './pages/MyListingsPage';
import { HousingDetailPage } from './pages/HousingDetailPage';
import { AutoDetailPage } from './pages/AutoDetailPage';
import { ParcelsDetailPage } from './pages/ParcelsDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ContactPage } from './pages/ContactPage';
import { ProtectedRoute } from './components/ProtectedRoute';

const Navigation = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-stone-700 hover:text-stone-800 transition-colors">
            LogoName
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-2 items-center">
            <Link
              to="/housing"
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-stone-700 hover:bg-stone-50 rounded-lg transition-colors"
            >
              Жилье
            </Link>
            <Link
              to="/auto"
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-stone-700 hover:bg-stone-50 rounded-lg transition-colors"
            >
              Авто
            </Link>
            <Link
              to="/parcels"
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-stone-700 hover:bg-stone-50 rounded-lg transition-colors"
            >
              Посылки
            </Link>
            <Link
              to="/contact"
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-stone-700 hover:bg-stone-50 rounded-lg transition-colors"
            >
              Контакты
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/my-listings"
                  className="px-3 py-2 text-sm font-medium text-stone-700 hover:text-stone-800 hover:bg-stone-50 rounded-lg transition-colors"
                >
                  Мои объявления
                </Link>
                <div className="ml-4 pl-4 border-l border-gray-200 flex items-center gap-3">
                  <span className="text-sm text-gray-600 hidden lg:inline">Привет, {user?.name}</span>
                  <button
                    onClick={logout}
                    className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-stone-700 hover:bg-stone-50 rounded-lg transition-colors"
                  >
                    Выйти
                  </button>
                </div>
              </>
            ) : (
              <div className="ml-4 flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-stone-600 hover:bg-stone-50 rounded-lg transition-colors"
                >
                  Вход
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-slate-600 rounded-lg hover:bg-slate-700 transition-colors shadow-sm"
                >
                  Регистрация
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2">
              <Link
                to="/housing"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 text-base font-medium text-gray-700 hover:text-stone-600 hover:bg-stone-50 rounded-lg transition-colors"
              >
                Жилье
              </Link>
              <Link
                to="/auto"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 text-base font-medium text-gray-700 hover:text-stone-600 hover:bg-stone-50 rounded-lg transition-colors"
              >
                Авто
              </Link>
              <Link
                to="/parcels"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 text-base font-medium text-gray-700 hover:text-stone-600 hover:bg-stone-50 rounded-lg transition-colors"
              >
                Посылки
              </Link>
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 text-base font-medium text-gray-700 hover:text-stone-600 hover:bg-stone-50 rounded-lg transition-colors"
              >
                Контакты
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/my-listings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 text-base font-medium text-stone-700 hover:bg-stone-50 rounded-lg transition-colors"
                  >
                    Мои объявления
                  </Link>
                  <div className="pt-2 border-t border-gray-200">
                    <div className="px-4 py-2 text-sm text-gray-600">{user?.name}</div>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-base font-medium text-gray-700 hover:text-stone-700 hover:bg-stone-50 rounded-lg transition-colors"
                    >
                      Выйти
                    </button>
                  </div>
                </>
              ) : (
                <div className="pt-2 border-t border-gray-200 flex flex-col gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 text-base font-medium text-gray-700 hover:text-stone-600 hover:bg-stone-50 rounded-lg transition-colors text-center"
                  >
                    Вход
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 text-base font-medium text-white bg-stone-500 rounded-lg hover:bg-stone-600 transition-colors shadow-sm text-center"
                  >
                    Регистрация
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-to-br from-stone-50 to-slate-50">
          <Navigation />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/" element={<HousingPage />} />
              <Route path="/housing" element={<HousingPage />} />
              <Route path="/housing/:id" element={<HousingDetailPage />} />
              <Route path="/auto" element={<AutoPage />} />
              <Route path="/auto/:id" element={<AutoDetailPage />} />
              <Route path="/parcels" element={<ParcelsPage />} />
              <Route path="/parcels/:id" element={<ParcelsDetailPage />} />
              <Route
                path="/my-listings"
                element={
                  <ProtectedRoute>
                    <MyListingsPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

