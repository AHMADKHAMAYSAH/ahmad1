import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  User, 
  Coins, 
  Calendar, 
  Trophy, 
  Target,
  Clock,
  Star,
  TrendingUp
} from 'lucide-react'

const ProfilePage = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalGamesPlayed: 0,
    totalPlayTime: 0,
    dailyStreak: 0,
    totalPointsEarned: 0
  })

  if (!user) {
    return (
      <div className="text-center py-12">
        <Alert className="max-w-md mx-auto">
          <AlertDescription>يجب تسجيل الدخول لعرض الملف الشخصي</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">الملف الشخصي</h1>
        <p className="text-gray-600">إدارة حسابك ومتابعة إحصائياتك</p>
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="p-4 bg-blue-100 rounded-full">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-2xl">{user.name}</CardTitle>
              <CardDescription className="text-lg">{user.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{user.points}</div>
              <div className="text-sm text-gray-600">النقاط الحالية</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{user.level}</div>
              <div className="text-sm text-gray-600">المستوى</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.dailyStreak}</div>
              <div className="text-sm text-gray-600">أيام متتالية</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.totalGamesPlayed}</div>
              <div className="text-sm text-gray-600">ألعاب لعبت</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 space-x-reverse">
              <Coins className="h-5 w-5 text-yellow-600" />
              <span>إحصائيات النقاط</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">النقاط الحالية:</span>
              <span className="font-medium">{user.points}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">إجمالي النقاط المكتسبة:</span>
              <span className="font-medium">{stats.totalPointsEarned}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">نقاط اليوم:</span>
              <span className="font-medium">{user.daily_points_earned || 0}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 space-x-reverse">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <span>الإنجازات</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Badge variant="secondary">
                <Star className="mr-1 h-3 w-3" />
                مستوى {user.level}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">الألعاب المكتملة:</span>
              <span className="font-medium">{stats.totalGamesPlayed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">أيام اللعب المتتالية:</span>
              <span className="font-medium">{stats.dailyStreak}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 space-x-reverse">
              <Clock className="h-5 w-5 text-blue-600" />
              <span>وقت اللعب</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">إجمالي وقت اللعب:</span>
              <span className="font-medium">{Math.floor(stats.totalPlayTime / 60)} دقيقة</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">متوسط الجلسة:</span>
              <span className="font-medium">
                {stats.totalGamesPlayed > 0 
                  ? Math.floor(stats.totalPlayTime / stats.totalGamesPlayed / 60) 
                  : 0} دقيقة
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle>إعدادات الحساب</CardTitle>
          <CardDescription>إدارة معلومات حسابك الشخصية</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">الاسم</label>
              <div className="mt-1 p-2 border rounded-md bg-gray-50">{user.name}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">البريد الإلكتروني</label>
              <div className="mt-1 p-2 border rounded-md bg-gray-50">{user.email}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">رقم الهاتف</label>
              <div className="mt-1 p-2 border rounded-md bg-gray-50">
                {user.phone_number || 'غير محدد'}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">تاريخ التسجيل</label>
              <div className="mt-1 p-2 border rounded-md bg-gray-50">
                {new Date(user.created_at).toLocaleDateString('ar-SA')}
              </div>
            </div>
          </div>
          
          <div className="flex space-x-4 space-x-reverse pt-4">
            <Button variant="outline">تعديل المعلومات</Button>
            <Button variant="outline">تغيير كلمة المرور</Button>
          </div>
        </CardContent>
      </Card>

      {/* Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 space-x-reverse">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span>تقدم المستوى</span>
          </CardTitle>
          <CardDescription>
            المستوى الحالي: {user.level} | النقاط للمستوى التالي: {Math.max(0, (user.level + 1) * 100 - user.points)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>المستوى {user.level}</span>
              <span>المستوى {user.level + 1}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (user.points % 100))}%`
                }}
              ></div>
            </div>
            <div className="text-center text-sm text-gray-600">
              {user.points % 100} / 100 نقطة للمستوى التالي
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProfilePage

