import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Users, 
  Copy, 
  Share, 
  Gift,
  TrendingUp,
  Star,
  Link as LinkIcon,
  MessageCircle
} from 'lucide-react'

const ReferralsPage = () => {
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)
  
  const referralCode = user ? `REF${user.id}${user.name.slice(0, 3).toUpperCase()}` : ''
  const referralLink = `https://gaming-platform.com/register?ref=${referralCode}`

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareViaWhatsApp = () => {
    const message = `🎮 انضم إلي في منصة الألعاب الربحية واكسب نقاط حقيقية!\n\n✨ استخدم رمز الدعوة: ${referralCode}\n🔗 ${referralLink}\n\n💰 احصل على 10 نقاط مجانية عند التسجيل!`
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`)
  }

  const referralStats = {
    totalReferrals: 12,
    activeReferrals: 8,
    totalEarned: 120,
    thisMonth: 45
  }

  const recentReferrals = [
    { name: 'أحمد محمد', date: '2025-01-10', points: 10, status: 'active' },
    { name: 'فاطمة علي', date: '2025-01-08', points: 10, status: 'active' },
    { name: 'محمد سالم', date: '2025-01-05', points: 10, status: 'inactive' },
    { name: 'نورا أحمد', date: '2025-01-03', points: 10, status: 'active' }
  ]

  const referralLevels = [
    {
      level: 1,
      requirement: '5 إحالات',
      bonus: '25 نقطة',
      achieved: referralStats.totalReferrals >= 5
    },
    {
      level: 2,
      requirement: '15 إحالة',
      bonus: '75 نقطة',
      achieved: referralStats.totalReferrals >= 15
    },
    {
      level: 3,
      requirement: '30 إحالة',
      bonus: '200 نقطة',
      achieved: referralStats.totalReferrals >= 30
    }
  ]

  if (!user) {
    return (
      <div className="text-center py-12">
        <Alert className="max-w-md mx-auto">
          <AlertDescription>يجب تسجيل الدخول لعرض صفحة الإحالات</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          👥 برنامج الإحالات
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          ادع أصدقاءك واكسب نقاط عن كل شخص ينضم باستخدام رمز الدعوة الخاص بك
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{referralStats.totalReferrals}</div>
              <div className="text-sm text-gray-600">إجمالي الإحالات</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{referralStats.activeReferrals}</div>
              <div className="text-sm text-gray-600">إحالات نشطة</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{referralStats.totalEarned}</div>
              <div className="text-sm text-gray-600">إجمالي النقاط</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{referralStats.thisMonth}</div>
              <div className="text-sm text-gray-600">نقاط هذا الشهر</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Referral Tools */}
        <div className="lg:col-span-2 space-y-6">
          {/* Referral Code & Link */}
          <Card>
            <CardHeader>
              <CardTitle>رمز الدعوة الخاص بك</CardTitle>
              <CardDescription>شارك هذا الرمز أو الرابط مع أصدقائك</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">رمز الدعوة</label>
                <div className="flex space-x-2 space-x-reverse">
                  <Input value={referralCode} readOnly className="font-mono" />
                  <Button 
                    variant="outline" 
                    onClick={() => copyToClipboard(referralCode)}
                    className="flex-shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">رابط الدعوة</label>
                <div className="flex space-x-2 space-x-reverse">
                  <Input value={referralLink} readOnly className="text-sm" />
                  <Button 
                    variant="outline" 
                    onClick={() => copyToClipboard(referralLink)}
                    className="flex-shrink-0"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {copied && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">
                    تم نسخ الرابط بنجاح!
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex space-x-2 space-x-reverse pt-2">
                <Button onClick={shareViaWhatsApp} className="flex-1">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  مشاركة عبر واتساب
                </Button>
                <Button variant="outline" onClick={() => copyToClipboard(referralLink)}>
                  <Share className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* How it Works */}
          <Card>
            <CardHeader>
              <CardTitle>كيف يعمل برنامج الإحالات؟</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 space-x-reverse">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">شارك رمز الدعوة</h4>
                    <p className="text-sm text-gray-600">أرسل رمز الدعوة أو الرابط لأصدقائك</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 space-x-reverse">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">صديقك ينضم</h4>
                    <p className="text-sm text-gray-600">عندما يسجل صديقك باستخدام رمزك</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 space-x-reverse">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">تحصل على النقاط</h4>
                    <p className="text-sm text-gray-600">احصل على 10 نقاط فوراً + نقاط إضافية من نشاطه</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Referrals */}
          <Card>
            <CardHeader>
              <CardTitle>الإحالات الأخيرة</CardTitle>
              <CardDescription>قائمة بأحدث الأشخاص الذين انضموا باستخدام رمزك</CardDescription>
            </CardHeader>
            <CardContent>
              {recentReferrals.length > 0 ? (
                <div className="space-y-3">
                  {recentReferrals.map((referral, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium">{referral.name}</div>
                          <div className="text-sm text-gray-600">
                            {new Date(referral.date).toLocaleDateString('ar-SA')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={referral.status === 'active' ? 'default' : 'secondary'}>
                          {referral.status === 'active' ? 'نشط' : 'غير نشط'}
                        </Badge>
                        <div className="text-sm text-green-600 font-medium">
                          +{referral.points} نقطة
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  لا توجد إحالات بعد. ابدأ بدعوة أصدقائك!
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Referral Rewards */}
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 space-x-reverse text-yellow-800">
                <Gift className="h-5 w-5" />
                <span>مكافآت الإحالة</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-yellow-700">تسجيل جديد:</span>
                <Badge className="bg-yellow-600">+10 نقاط</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-yellow-700">أول لعبة:</span>
                <Badge className="bg-yellow-600">+5 نقاط</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-yellow-700">نشاط شهري:</span>
                <Badge className="bg-yellow-600">+2 نقطة</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Referral Levels */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 space-x-reverse">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span>مستويات الإحالة</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {referralLevels.map((level, index) => (
                <div key={index} className={`p-3 border rounded-lg ${
                  level.achieved ? 'border-green-200 bg-green-50' : 'border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">المستوى {level.level}</span>
                    {level.achieved && <Star className="h-4 w-4 text-yellow-500" />}
                  </div>
                  <div className="text-sm text-gray-600 mb-1">{level.requirement}</div>
                  <Badge variant={level.achieved ? 'default' : 'outline'}>
                    {level.bonus}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">نصائح للنجاح</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• شارك تجربتك الإيجابية مع الأصدقاء</li>
                <li>• استخدم وسائل التواصل الاجتماعي</li>
                <li>• اشرح فوائد المنصة بوضوح</li>
                <li>• ساعد أصدقاءك في البداية</li>
                <li>• كن صادقاً حول التوقعات</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ReferralsPage

