import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Coins, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw,
  Tv,
  Trophy,
  Star
} from 'lucide-react'
import axios from 'axios'

const GamePlayer = () => {
  const { gameId } = useParams()
  const [searchParams] = useSearchParams()
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()
  const iframeRef = useRef(null)
  
  const [game, setGame] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sessionId, setSessionId] = useState(null)
  const [gameStartTime, setGameStartTime] = useState(null)
  const [playTime, setPlayTime] = useState(0)
  const [pointsEarned, setPointsEarned] = useState(0)
  const [adWatched, setAdWatched] = useState(false)
  
  const isPreview = searchParams.get('preview') === 'true'

  useEffect(() => {
    fetchGame()
    
    // Timer for play time
    const timer = setInterval(() => {
      if (gameStartTime) {
        setPlayTime(Math.floor((Date.now() - gameStartTime) / 1000))
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [gameId, gameStartTime])

  useEffect(() => {
    if (!isPreview && user && game) {
      startGameSession()
    }
  }, [game, user, isPreview])

  const fetchGame = async () => {
    try {
      const response = await axios.get(`/api/games/${gameId}`)
      setGame(response.data)
    } catch (error) {
      setError('حدث خطأ في تحميل اللعبة')
    } finally {
      setLoading(false)
    }
  }

  const startGameSession = async () => {
    try {
      const response = await axios.post(`/api/games/${gameId}/start-session`)
      setSessionId(response.data.session_id)
      setGameStartTime(Date.now())
      
      if (response.data.points_awarded > 0) {
        setPointsEarned(prev => prev + response.data.points_awarded)
        updateUser({ points: user.points + response.data.points_awarded })
      }
    } catch (error) {
      console.error('Failed to start game session:', error)
    }
  }

  const endGameSession = async () => {
    if (!sessionId) return
    
    try {
      const response = await axios.post(`/api/games/sessions/${sessionId}/end`)
      
      if (response.data.points_awarded > 0) {
        setPointsEarned(prev => prev + response.data.points_awarded)
        updateUser({ points: user.points + response.data.points_awarded })
      }
    } catch (error) {
      console.error('Failed to end game session:', error)
    }
  }

  const watchAd = async () => {
    if (adWatched) return
    
    try {
      // Simulate ad watching
      const confirmed = window.confirm('هل تريد مشاهدة إعلان لكسب 5 نقاط؟')
      if (!confirmed) return
      
      // In real implementation, show actual ad
      setTimeout(async () => {
        try {
          const response = await axios.post(`/api/games/${gameId}/watch-ad`)
          setPointsEarned(prev => prev + response.data.points_awarded)
          setAdWatched(true)
          updateUser({ points: response.data.total_points })
          
          alert('تهانينا! حصلت على 5 نقاط من مشاهدة الإعلان!')
        } catch (error) {
          alert(error.response?.data?.error || 'حدث خطأ أثناء منح النقاط')
        }
      }, 2000)
      
    } catch (error) {
      console.error('Failed to watch ad:', error)
    }
  }

  const restartGame = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <Play className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">جاري تحميل اللعبة...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/games')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          العودة للألعاب
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate('/games')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          العودة للألعاب
        </Button>
        
        {isPreview && (
          <Badge variant="secondary" className="text-sm">
            معاينة - سجل للعب وكسب النقاط
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Game Area */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2 space-x-reverse">
                  <span>{game.name}</span>
                  {!isPreview && user && (
                    <Badge variant="outline" className="text-green-600">
                      جلسة نشطة
                    </Badge>
                  )}
                </CardTitle>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Button variant="outline" size="sm" onClick={restartGame}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <iframe
                  ref={iframeRef}
                  src={`http://localhost:5001${game.html_path}`}
                  className="w-full h-full border-0"
                  title={game.name}
                  allowFullScreen
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Game Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">معلومات اللعبة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">{game.description}</p>
              
              {!isPreview && user && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">وقت اللعب:</span>
                    <Badge variant="outline">
                      <Clock className="mr-1 h-3 w-3" />
                      {formatTime(playTime)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">النقاط المكتسبة:</span>
                    <Badge className="bg-green-100 text-green-800">
                      <Coins className="mr-1 h-3 w-3" />
                      {pointsEarned}
                    </Badge>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Points System */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2 space-x-reverse">
                <Trophy className="h-5 w-5 text-yellow-600" />
                <span>نظام النقاط</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">أول لعبة يومياً:</span>
                <span className="font-medium text-green-600">+1 نقطة</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">اللعب لمدة 3 دقائق:</span>
                <span className="font-medium text-blue-600">+2 نقطة</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">مشاهدة إعلان:</span>
                <span className="font-medium text-purple-600">+5 نقاط</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {!isPreview && user && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">إجراءات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={watchAd} 
                  disabled={adWatched}
                  className="w-full"
                  variant={adWatched ? "outline" : "default"}
                >
                  <Tv className="mr-2 h-4 w-4" />
                  {adWatched ? 'تم مشاهدة الإعلان' : 'شاهد إعلان (+5 نقاط)'}
                </Button>
                
                <Button 
                  onClick={endGameSession}
                  variant="outline"
                  className="w-full"
                >
                  إنهاء الجلسة
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Login CTA for preview */}
          {isPreview && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg text-blue-900">
                  <Star className="inline mr-2 h-5 w-5" />
                  ابدأ الربح
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-blue-800">
                  سجل حساب مجاني لكسب النقاط من هذه اللعبة
                </p>
                <Button asChild className="w-full">
                  <a href="/register">إنشاء حساب مجاني</a>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <a href="/login">تسجيل الدخول</a>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Current Balance */}
          {user && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-800 mb-1">
                    {user.points}
                  </div>
                  <div className="text-sm text-yellow-700">
                    رصيدك الحالي
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default GamePlayer

