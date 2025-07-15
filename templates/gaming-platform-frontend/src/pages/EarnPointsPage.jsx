import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Tv, 
  Coins, 
  Play, 
  Users, 
  Gift,
  Clock,
  Star,
  Zap,
  Target
} from 'lucide-react'

const EarnPointsPage = () => {
  const { user } = useAuth()
  const [adWatching, setAdWatching] = useState(false)

  const watchAd = async () => {
    setAdWatching(true)
    // Simulate ad watching
    setTimeout(() => {
      setAdWatching(false)
      alert('تهانينا! حصلت على 5 نقاط من مشاهدة الإعلان!')
    }, 3000)
  }

  const earnMethods = [
    {
      icon: Play,
      title: 'اللعب اليومي',
      description: 'احصل على نقاط مقابل اللعب كل يوم',
      points: '1-8',
      action: 'العب الآن',
      link: '/games',
      color: 'blue'
    },
    {
      icon: Tv,
      title: 'مشاهدة الإعلانات',
      description: 'شاهد إعلانات قصيرة واحصل على نقاط فورية',
      points: '5',
      action: 'شاهد إعلان',
      onClick: watchAd,
      color: 'purple',
      disabled: adWatching
    },
    {
      icon: Users,
      title: 'دعوة الأصدقاء',
      description: 'ادع أصدقاءك واحصل على نقاط عن كل صديق ينضم',
      points: '10',
      action: 'ادع صديق',
      link: '/referrals',
      color: 'green'
    },
    {
      icon: Target,
      title: 'المهام اليومية',
      description: 'أكمل المهام اليومية للحصول على نقاط إضافية',
      points: '3-15',
      action: 'عرض المهام',
      color: 'orange'
    }
  ]

  const dailyTasks = [
    { task: 'العب لعبة واحدة على الأقل', points: 3, completed: false },
    { task: 'شاهد 3 إعلانات', points: 15, completed: false },
    { task: 'ادع صديق جديد', points: 10, completed: false },
    { task: 'العب لمدة 10 دقائق', points: 5, completed: false }
  ]

  const bonusOffers = [
    {
      title: 'مكافأة نهاية الأسبوع',
      description: 'احصل على 50 نقطة إضافية عند اللعب في عطلة نهاية الأسبوع',
      points: 50,
      timeLeft: '2 أيام',
      active: true
    },
    {
      title: 'تحدي الشهر',
      description: 'اجمع 500 نقطة هذا الشهر واحصل على مكافأة 100 نقطة',
      points: 100,
      progress: '320/500',
      active: true
    }
  ]

  if (!user) {
    return (
      <div className="text-center py-12">
        <Alert className="max-w-md mx-auto">
          <AlertDescription>يجب تسجيل الدخول لعرض طرق كسب النقاط</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          💰 اكسب النقاط
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          اكتشف طرق مختلفة لكسب النقاط وزيادة رصيدك
        </p>
      </div>

      {/* Current Balance */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">{user.points}</div>
            <div className="text-lg text-gray-700 mb-4">رصيدك الحالي</div>
            <div className="flex justify-center space-x-4 space-x-reverse text-sm">
              <div className="flex items-center space-x-1 space-x-reverse">
                <Clock className="h-4 w-4 text-green-600" />
                <span>نقاط اليوم: {user.daily_points_earned || 0}</span>
              </div>
              <div className="flex items-center space-x-1 space-x-reverse">
                <Star className="h-4 w-4 text-yellow-600" />
                <span>المستوى: {user.level}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Earn Methods */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">طرق كسب النقاط</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {earnMethods.map((method, index) => {
            const Icon = method.icon
            const colorClasses = {
              blue: 'bg-blue-100 text-blue-600 border-blue-200',
              purple: 'bg-purple-100 text-purple-600 border-purple-200',
              green: 'bg-green-100 text-green-600 border-green-200',
              orange: 'bg-orange-100 text-orange-600 border-orange-200'
            }
            
            return (
              <Card key={index} className={`hover:shadow-lg transition-shadow ${colorClasses[method.color]}`}>
                <CardHeader>
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className={`p-3 rounded-full ${colorClasses[method.color]}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{method.title}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        +{method.points} نقطة
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base mb-4">
                    {method.description}
                  </CardDescription>
                  <Button 
                    className="w-full" 
                    onClick={method.onClick}
                    disabled={method.disabled}
                    asChild={!method.onClick}
                  >
                    {method.onClick ? (
                      <>
                        {method.disabled ? (
                          <>
                            <Zap className="mr-2 h-4 w-4 animate-pulse" />
                            جاري المشاهدة...
                          </>
                        ) : (
                          <>
                            <Icon className="mr-2 h-4 w-4" />
                            {method.action}
                          </>
                        )}
                      </>
                    ) : (
                      <a href={method.link}>
                        <Icon className="mr-2 h-4 w-4" />
                        {method.action}
                      </a>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Daily Tasks */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">المهام اليومية</h2>
        <Card>
          <CardHeader>
            <CardTitle>أكمل مهامك اليومية</CardTitle>
            <CardDescription>احصل على نقاط إضافية بإكمال المهام التالية</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dailyTasks.map((task, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      task.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
                    }`}>
                      {task.completed && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                    <span className={task.completed ? 'line-through text-gray-500' : 'text-gray-900'}>
                      {task.task}
                    </span>
                  </div>
                  <Badge variant={task.completed ? 'secondary' : 'default'}>
                    +{task.points} نقطة
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bonus Offers */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">عروض المكافآت</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bonusOffers.map((offer, index) => (
            <Card key={index} className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{offer.title}</CardTitle>
                  <Badge className="bg-yellow-600">
                    <Gift className="mr-1 h-3 w-3" />
                    +{offer.points}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base mb-4">
                  {offer.description}
                </CardDescription>
                <div className="flex justify-between items-center text-sm">
                  {offer.timeLeft && (
                    <span className="text-orange-600 font-medium">
                      متبقي: {offer.timeLeft}
                    </span>
                  )}
                  {offer.progress && (
                    <span className="text-blue-600 font-medium">
                      التقدم: {offer.progress}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse text-blue-900">
            <Zap className="h-5 w-5" />
            <span>نصائح لكسب المزيد من النقاط</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-blue-800">
            <li>• العب يومياً للحصول على مكافأة الاستمرارية</li>
            <li>• ادع أصدقاءك للحصول على نقاط الإحالة</li>
            <li>• شاهد الإعلانات للحصول على نقاط فورية</li>
            <li>• أكمل المهام اليومية لمضاعفة نقاطك</li>
            <li>• استفد من العروض الخاصة والمكافآت الموسمية</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

export default EarnPointsPage

