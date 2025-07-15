import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Play, 
  Coins, 
  Clock, 
  Users, 
  Star,
  Gamepad2,
  Trophy,
  Target
} from 'lucide-react'
import axios from 'axios'

const GamesPage = () => {
  const { user } = useAuth()
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchGames()
  }, [])

  const fetchGames = async () => {
    try {
      const response = await axios.get('/api/games')
      setGames(response.data)
    } catch (error) {
      setError('حدث خطأ في تحميل الألعاب')
    } finally {
      setLoading(false)
    }
  }

  const gameIcons = {
    'سباق السيارات': '🏎️',
    'تحدي الذاكرة': '🧠',
    'القفز والجري': '🏃‍♂️',
    'تركيب الصور': '🧩'
  }

  const gameCategories = {
    'سباق السيارات': 'سباق',
    'تحدي الذاكرة': 'ذكاء',
    'القفز والجري': 'مغامرة',
    'تركيب الصور': 'ألغاز'
  }

  const pointsInfo = [
    { action: 'أول لعبة يومياً', points: 1, icon: Star },
    { action: 'اللعب لمدة 3 دقائق', points: 2, icon: Clock },
    { action: 'مشاهدة إعلان', points: 5, icon: Coins }
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <Gamepad2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">جاري تحميل الألعاب...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          🎮 مجموعة الألعاب
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          استمتع بألعاب شيقة ومتنوعة واكسب نقاط مع كل لعبة
        </p>
      </div>

      {/* Points Info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
          كيف تكسب النقاط؟
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pointsInfo.map((info, index) => {
            const Icon = info.icon
            return (
              <div key={index} className="flex items-center space-x-3 space-x-reverse bg-white rounded-lg p-4">
                <div className="flex-shrink-0">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{info.action}</p>
                  <p className="text-sm text-blue-600 font-semibold">+{info.points} نقطة</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* User Status */}
      {user && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 space-x-reverse mb-4 sm:mb-0">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">مرحباً، {user.name}</h3>
                <p className="text-sm text-gray-600">المستوى {user.level}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{user.points}</p>
                <p className="text-xs text-gray-600">النقاط الحالية</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{user.daily_points_earned || 0}</p>
                <p className="text-xs text-gray-600">نقاط اليوم</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Games Grid */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {games.map((game) => (
          <Card key={game.id} className="hover:shadow-lg transition-all duration-300 group">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="text-4xl">
                    {gameIcons[game.name] || '🎮'}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{game.name}</CardTitle>
                    <div className="flex items-center space-x-2 space-x-reverse mt-1">
                      <Badge variant="secondary">
                        {gameCategories[game.name] || 'عام'}
                      </Badge>
                      <div className="flex items-center space-x-1 space-x-reverse text-sm text-gray-600">
                        <Trophy className="h-3 w-3" />
                        <span>حتى 8 نقاط</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <CardDescription className="text-base mb-4">
                {game.description}
              </CardDescription>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">نقاط البداية:</span>
                  <span className="font-medium text-green-600">1 نقطة</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">نقاط الإعلان:</span>
                  <span className="font-medium text-blue-600">5 نقاط</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">نقاط اللعب الطويل:</span>
                  <span className="font-medium text-purple-600">2 نقطة</span>
                </div>
              </div>
              
              <div className="mt-6 flex space-x-2 space-x-reverse">
                {user ? (
                  <Button asChild className="flex-1">
                    <Link to={`/games/${game.id}`}>
                      <Play className="mr-2 h-4 w-4" />
                      العب الآن
                    </Link>
                  </Button>
                ) : (
                  <Button asChild className="flex-1">
                    <Link to="/login">
                      <Play className="mr-2 h-4 w-4" />
                      سجل للعب
                    </Link>
                  </Button>
                )}
                
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/games/${game.id}?preview=true`}>
                    <Target className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      {!user && (
        <div className="text-center py-12">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-4">ابدأ اللعب واكسب النقاط</h2>
            <p className="text-lg mb-6 opacity-90">
              سجل حساب مجاني واستمتع بجميع الألعاب واكسب نقاط حقيقية
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/register">
                  <Star className="mr-2 h-5 w-5" />
                  إنشاء حساب مجاني
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600" asChild>
                <Link to="/login">
                  تسجيل الدخول
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GamesPage

