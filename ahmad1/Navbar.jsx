import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  Gamepad2, 
  User, 
  Coins, 
  CreditCard, 
  Users, 
  LogOut, 
  Menu,
  X,
  Home,
  Phone
} from 'lucide-react'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const navItems = [
    { name: 'الرئيسية', path: '/', icon: Home },
    { name: 'الألعاب', path: '/games', icon: Gamepad2 },
    { name: 'اكسب نقاط', path: '/earn-points', icon: Coins },
    { name: 'الإحالات', path: '/referrals', icon: Users },
    { name: 'تواصل معنا', path: '/contact', icon: Phone }
  ]

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 space-x-reverse">
            <Gamepad2 className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">منصة الألعاب</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 space-x-reverse">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center space-x-1 space-x-reverse text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="flex items-center space-x-4 space-x-reverse">
            {user ? (
              <>
                {/* Points Display */}
                <div className="hidden sm:flex items-center space-x-2 space-x-reverse bg-yellow-100 px-3 py-1 rounded-full">
                  <Coins className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">{user.points} نقطة</span>
                </div>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 space-x-reverse">
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">{user.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center space-x-2 space-x-reverse">
                        <User className="h-4 w-4" />
                        <span>حسابي</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/withdraw" className="flex items-center space-x-2 space-x-reverse">
                        <CreditCard className="h-4 w-4" />
                        <span>سحب الأرباح</span>
                      </Link>
                    </DropdownMenuItem>
                    {user.level >= 10 && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center space-x-2 space-x-reverse">
                          <User className="h-4 w-4" />
                          <span>لوحة الإدارة</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center space-x-2 space-x-reverse text-red-600">
                      <LogOut className="h-4 w-4" />
                      <span>تسجيل الخروج</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2 space-x-reverse">
                <Button variant="ghost" asChild>
                  <Link to="/login">تسجيل الدخول</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">إنشاء حساب</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center space-x-2 space-x-reverse p-2 text-gray-700 hover:bg-gray-100 rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
              
              {user && (
                <>
                  <div className="flex items-center space-x-2 space-x-reverse p-2 bg-yellow-100 rounded-md">
                    <Coins className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">{user.points} نقطة</span>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 space-x-reverse p-2 text-gray-700 hover:bg-gray-100 rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    <span>حسابي</span>
                  </Link>
                  <Link
                    to="/withdraw"
                    className="flex items-center space-x-2 space-x-reverse p-2 text-gray-700 hover:bg-gray-100 rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>سحب الأرباح</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar

