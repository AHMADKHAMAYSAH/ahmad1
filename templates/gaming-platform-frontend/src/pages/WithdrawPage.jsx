import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  CreditCard, 
  Coins, 
  DollarSign, 
  Gift,
  Clock,
  CheckCircle,
  AlertCircle,
  Smartphone
} from 'lucide-react'

const WithdrawPage = () => {
  const { user } = useAuth()
  const [withdrawMethod, setWithdrawMethod] = useState('')
  const [amount, setAmount] = useState('')
  const [accountInfo, setAccountInfo] = useState('')
  const [loading, setLoading] = useState(false)

  const withdrawMethods = [
    {
      id: 'paypal',
      name: 'PayPal',
      icon: CreditCard,
      minPoints: 100,
      rate: 0.01, // 1 point = $0.01
      description: 'تحويل فوري إلى حساب PayPal'
    },
    {
      id: 'bank',
      name: 'تحويل بنكي',
      icon: CreditCard,
      minPoints: 500,
      rate: 0.01,
      description: 'تحويل إلى الحساب البنكي (1-3 أيام عمل)'
    },
    {
      id: 'mobile',
      name: 'رصيد الهاتف',
      icon: Smartphone,
      minPoints: 50,
      rate: 0.008,
      description: 'شحن رصيد الهاتف المحمول'
    },
    {
      id: 'gift_card',
      name: 'بطاقة هدايا',
      icon: Gift,
      minPoints: 200,
      rate: 0.009,
      description: 'بطاقات هدايا لمتاجر مختلفة'
    }
  ]

  const recentWithdrawals = [
    {
      id: 1,
      method: 'PayPal',
      amount: '$5.00',
      points: 500,
      status: 'completed',
      date: '2025-01-10'
    },
    {
      id: 2,
      method: 'رصيد الهاتف',
      amount: '10 ريال',
      points: 125,
      status: 'pending',
      date: '2025-01-12'
    }
  ]

  const handleWithdraw = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      alert('تم إرسال طلب السحب بنجاح! سيتم مراجعته خلال 24 ساعة.')
      setAmount('')
      setAccountInfo('')
      setWithdrawMethod('')
    }, 2000)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'rejected':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'مكتمل'
      case 'pending':
        return 'قيد المراجعة'
      case 'rejected':
        return 'مرفوض'
      default:
        return 'غير معروف'
    }
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <Alert className="max-w-md mx-auto">
          <AlertDescription>يجب تسجيل الدخول لعرض صفحة السحب</AlertDescription>
        </Alert>
      </div>
    )
  }

  const selectedMethod = withdrawMethods.find(m => m.id === withdrawMethod)
  const maxWithdrawPoints = Math.floor(user.points / (selectedMethod?.minPoints || 1)) * (selectedMethod?.minPoints || 1)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          💳 سحب الأرباح
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          حول نقاطك إلى أموال حقيقية أو بطاقات هدايا
        </p>
      </div>

      {/* Current Balance */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">{user.points}</div>
            <div className="text-lg text-gray-700 mb-4">نقطة متاحة للسحب</div>
            <div className="text-sm text-gray-600">
              القيمة التقديرية: ${(user.points * 0.01).toFixed(2)}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Withdraw Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>طلب سحب جديد</CardTitle>
              <CardDescription>اختر طريقة السحب وأدخل التفاصيل المطلوبة</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleWithdraw} className="space-y-6">
                {/* Withdraw Method */}
                <div className="space-y-2">
                  <Label>طريقة السحب</Label>
                  <Select value={withdrawMethod} onValueChange={setWithdrawMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر طريقة السحب" />
                    </SelectTrigger>
                    <SelectContent>
                      {withdrawMethods.map((method) => {
                        const Icon = method.icon
                        return (
                          <SelectItem key={method.id} value={method.id}>
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <Icon className="h-4 w-4" />
                              <span>{method.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {method.minPoints}+ نقطة
                              </Badge>
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                  {selectedMethod && (
                    <p className="text-sm text-gray-600">{selectedMethod.description}</p>
                  )}
                </div>

                {/* Amount */}
                {selectedMethod && (
                  <div className="space-y-2">
                    <Label>عدد النقاط</Label>
                    <Input
                      type="number"
                      placeholder={`الحد الأدنى: ${selectedMethod.minPoints}`}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min={selectedMethod.minPoints}
                      max={user.points}
                      step={selectedMethod.minPoints}
                      required
                    />
                    {amount && (
                      <p className="text-sm text-green-600">
                        القيمة: ${(amount * selectedMethod.rate).toFixed(2)}
                      </p>
                    )}
                  </div>
                )}

                {/* Account Info */}
                {selectedMethod && (
                  <div className="space-y-2">
                    <Label>
                      {selectedMethod.id === 'paypal' && 'بريد PayPal الإلكتروني'}
                      {selectedMethod.id === 'bank' && 'رقم الحساب البنكي'}
                      {selectedMethod.id === 'mobile' && 'رقم الهاتف'}
                      {selectedMethod.id === 'gift_card' && 'نوع البطاقة المطلوبة'}
                    </Label>
                    <Input
                      type={selectedMethod.id === 'paypal' ? 'email' : 'text'}
                      placeholder={
                        selectedMethod.id === 'paypal' ? 'example@email.com' :
                        selectedMethod.id === 'bank' ? '1234567890' :
                        selectedMethod.id === 'mobile' ? '+966501234567' :
                        'Amazon, iTunes, Google Play...'
                      }
                      value={accountInfo}
                      onChange={(e) => setAccountInfo(e.target.value)}
                      required
                    />
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loading || !selectedMethod || !amount || !accountInfo}
                >
                  {loading ? 'جاري الإرسال...' : 'إرسال طلب السحب'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Withdraw Methods Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">طرق السحب المتاحة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {withdrawMethods.map((method) => {
                const Icon = method.icon
                return (
                  <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Icon className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium">{method.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {method.minPoints}+
                    </Badge>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Withdrawal Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">قواعد السحب</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• الحد الأدنى للسحب يختلف حسب الطريقة</li>
                <li>• معالجة الطلبات خلال 24-48 ساعة</li>
                <li>• التحقق من الهوية مطلوب للمبالغ الكبيرة</li>
                <li>• رسوم المعالجة قد تطبق على بعض الطرق</li>
                <li>• يمكن إلغاء الطلب قبل المعالجة</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Withdrawals */}
      <Card>
        <CardHeader>
          <CardTitle>طلبات السحب الأخيرة</CardTitle>
          <CardDescription>تتبع حالة طلبات السحب السابقة</CardDescription>
        </CardHeader>
        <CardContent>
          {recentWithdrawals.length > 0 ? (
            <div className="space-y-4">
              {recentWithdrawals.map((withdrawal) => (
                <div key={withdrawal.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="flex items-center space-x-1 space-x-reverse">
                      {getStatusIcon(withdrawal.status)}
                      <span className="text-sm font-medium">{withdrawal.method}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {withdrawal.amount} ({withdrawal.points} نقطة)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {getStatusText(withdrawal.status)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(withdrawal.date).toLocaleDateString('ar-SA')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              لا توجد طلبات سحب سابقة
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default WithdrawPage

