import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Mail, 
  Phone, 
  MessageCircle, 
  Clock,
  HelpCircle,
  Bug,
  Star,
  CreditCard
} from 'lucide-react'

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: '',
        message: ''
      })
    }, 2000)
  }

  const contactMethods = [
    {
      icon: Mail,
      title: 'البريد الإلكتروني',
      description: 'support@gaming-platform.com',
      response: 'الرد خلال 24 ساعة'
    },
    {
      icon: MessageCircle,
      title: 'الدردشة المباشرة',
      description: 'متاح من 9 صباحاً إلى 9 مساءً',
      response: 'رد فوري'
    },
    {
      icon: Phone,
      title: 'الهاتف',
      description: '+966 11 123 4567',
      response: 'أوقات العمل الرسمية'
    }
  ]

  const categories = [
    { value: 'technical', label: 'مشكلة تقنية', icon: Bug },
    { value: 'account', label: 'مشكلة في الحساب', icon: Star },
    { value: 'payment', label: 'مشكلة في الدفع', icon: CreditCard },
    { value: 'general', label: 'استفسار عام', icon: HelpCircle }
  ]

  const faqs = [
    {
      question: 'كيف يمكنني كسب النقاط؟',
      answer: 'يمكنك كسب النقاط من خلال اللعب يومياً، مشاهدة الإعلانات، ودعوة الأصدقاء.'
    },
    {
      question: 'ما هو الحد الأدنى للسحب؟',
      answer: 'الحد الأدنى للسحب يختلف حسب طريقة السحب، ويبدأ من 50 نقطة لرصيد الهاتف.'
    },
    {
      question: 'كم يستغرق معالجة طلب السحب؟',
      answer: 'عادة ما تتم معالجة طلبات السحب خلال 24-48 ساعة من تاريخ الطلب.'
    },
    {
      question: 'هل يمكنني تغيير معلومات حسابي؟',
      answer: 'نعم، يمكنك تعديل معلومات حسابك من صفحة الملف الشخصي.'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          📞 تواصل معنا
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          نحن هنا لمساعدتك! تواصل معنا لأي استفسار أو مشكلة
        </p>
      </div>

      {/* Contact Methods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {contactMethods.map((method, index) => {
          const Icon = method.icon
          return (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">{method.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-900 font-medium mb-2">{method.description}</p>
                <p className="text-sm text-gray-600">{method.response}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>إرسال رسالة</CardTitle>
              <CardDescription>املأ النموذج أدناه وسنرد عليك في أقرب وقت</CardDescription>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">
                    تم إرسال رسالتك بنجاح! سنرد عليك خلال 24 ساعة.
                  </AlertDescription>
                </Alert>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">الاسم</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="اسمك الكامل"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">البريد الإلكتروني</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="بريدك الإلكتروني"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">نوع الاستفسار</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع الاستفسار" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => {
                          const Icon = category.icon
                          return (
                            <SelectItem key={category.value} value={category.value}>
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <Icon className="h-4 w-4" />
                                <span>{category.label}</span>
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">الموضوع</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="موضوع الرسالة"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message">الرسالة</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="اكتب رسالتك هنا..."
                      rows={6}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'جاري الإرسال...' : 'إرسال الرسالة'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* FAQ */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 space-x-reverse">
                <HelpCircle className="h-5 w-5 text-blue-600" />
                <span>الأسئلة الشائعة</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <h4 className="font-medium text-gray-900 mb-2">{faq.question}</h4>
                  <p className="text-sm text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Support Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 space-x-reverse">
                <Clock className="h-5 w-5 text-green-600" />
                <span>ساعات الدعم</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">الأحد - الخميس:</span>
                <span className="font-medium">9:00 ص - 9:00 م</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">الجمعة - السبت:</span>
                <span className="font-medium">10:00 ص - 6:00 م</span>
              </div>
              <div className="text-sm text-gray-600 mt-4">
                * جميع الأوقات بتوقيت الرياض (GMT+3)
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>روابط مفيدة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <a href="#" className="block text-blue-600 hover:underline text-sm">
                دليل المستخدم
              </a>
              <a href="#" className="block text-blue-600 hover:underline text-sm">
                شروط الاستخدام
              </a>
              <a href="#" className="block text-blue-600 hover:underline text-sm">
                سياسة الخصوصية
              </a>
              <a href="#" className="block text-blue-600 hover:underline text-sm">
                قواعد المنصة
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ContactPage

