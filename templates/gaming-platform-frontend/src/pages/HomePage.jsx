import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Gamepad2, 
  Coins, 
  Users, 
  Gift, 
  Play, 
  Star,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react'

const HomePage = () => {
  const { user } = useAuth()

  const features = [
    {
      icon: Gamepad2,
      title: 'ألعاب متنوعة',
      description: 'استمتع بمجموعة من الألعاب الشيقة والممتعة'
    },
    {
      icon: Coins,
      title: 'اكسب نقاط',
      description: 'احصل على نقاط مقابل اللعب ومشاهدة الإعلانات'
    },
    {
      icon: Gift,
      title: 'جوائز حقيقية',
      description: 'استبدل نقاطك بأرصدة وبطاقات وتحويلات'
    },
    {
      icon: Users,
      title: 'نظام الإحالات',
      description: 'ادع أصدقاءك واحصل على نقاط إضافية'
    },
    {
      icon: Shield,
      title: 'آمن ومحمي',
      description: 'نظام حماية متقدم لضمان عدالة اللعب'
    },
    {
      icon: Zap,
      title: 'سريع وسهل',
      description: 'واجهة بسيطة وسهلة الاستخدام'
    }
  ]

  const stats = [
    { label: 'مستخدم نشط', value: '10,000+', icon: Users },
    { label: 'لعبة متاحة', value: '4', icon: Gamepad2 },
    { label: 'نقطة موزعة', value: '1M+', icon: Coins },
    { label: 'جائزة مستلمة', value: '500+', icon: Gift }
  ]

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            العب واربح مع
            <span className="text-blue-600 block">منصة الألعاب الربحية</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            استمتع بألعاب شيقة واكسب نقاط حقيقية يمكنك استبدالها بجوائز ومكافآت مالية
          </p>
          
          {user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" asChild className="text-lg px-8 py-3">
                <Link to="/games">
                  <Play className="mr-2 h-5 w-5" />
                  ابدأ اللعب الآن
                </Link>
              </Button>
              <div className="flex items-center space-x-2 space-x-reverse bg-yellow-100 px-4 py-2 rounded-full">
                <Coins className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">رصيدك: {user.points} نقطة</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg px-8 py-3">
                <Link to="/register">
                  <Star className="mr-2 h-5 w-5" />
                  إنشاء حساب مجاني
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8 py-3">
                <Link to="/games">
                  <Play className="mr-2 h-5 w-5" />
                  تصفح الألعاب
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 rounded-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">إحصائيات المنصة</h2>
          <p className="text-gray-600">أرقام تعكس نجاح منصتنا وثقة المستخدمين</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <Icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">لماذا تختار منصتنا؟</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            نوفر لك تجربة لعب ممتعة ومربحة مع ضمان الأمان والعدالة
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
                    <Icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">كيف تعمل المنصة؟</h2>
          <p className="text-gray-600">خطوات بسيطة للبدء في الربح</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full text-2xl font-bold mb-4">
              1
            </div>
            <h3 className="text-xl font-semibold mb-2">سجل حسابك</h3>
            <p className="text-gray-600">أنشئ حساب مجاني في دقائق معدودة</p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full text-2xl font-bold mb-4">
              2
            </div>
            <h3 className="text-xl font-semibold mb-2">العب واكسب</h3>
            <p className="text-gray-600">استمتع بالألعاب واحصل على نقاط</p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full text-2xl font-bold mb-4">
              3
            </div>
            <h3 className="text-xl font-semibold mb-2">استبدل واربح</h3>
            <p className="text-gray-600">حول نقاطك إلى أموال حقيقية</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="text-center py-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-3xl p-12">
            <h2 className="text-3xl font-bold mb-4">ابدأ رحلتك الآن</h2>
            <p className="text-xl mb-8 opacity-90">
              انضم إلى آلاف المستخدمين الذين يربحون يومياً من منصتنا
            </p>
            <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-3">
              <Link to="/register">
                <TrendingUp className="mr-2 h-5 w-5" />
                إنشاء حساب مجاني
              </Link>
            </Button>
          </div>
        </section>
      )}
    </div>
  )
}

export default HomePage

