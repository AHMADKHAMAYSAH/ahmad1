import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  Coins, 
  CreditCard, 
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Settings
} from 'lucide-react'

const AdminDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalUsers: 1250,
    activeUsers: 890,
    totalPoints: 125000,
    pendingWithdrawals: 15,
    totalWithdrawals: 450,
    suspiciousActivity: 3
  })

  const [recentUsers, setRecentUsers] = useState([
    { id: 1, name: 'أحمد محمد', email: 'ahmed@example.com', points: 150, level: 3, status: 'active', joinDate: '2025-01-10' },
    { id: 2, name: 'فاطمة علي', email: 'fatima@example.com', points: 89, level: 2, status: 'active', joinDate: '2025-01-09' },
    { id: 3, name: 'محمد سالم', email: 'mohammed@example.com', points: 45, level: 1, status: 'suspended', joinDate: '2025-01-08' }
  ])

  const [pendingWithdrawals, setPendingWithdrawals] = useState([
    { id: 1, user: 'أحمد محمد', method: 'PayPal', amount: '$15.00', points: 1500, date: '2025-01-12', status: 'pending' },
    { id: 2, user: 'نورا أحمد', method: 'رصيد الهاتف', amount: '25 ريال', points: 312, date: '2025-01-12', status: 'pending' },
    { id: 3, user: 'سالم محمد', method: 'تحويل بنكي', amount: '$50.00', points: 5000, date: '2025-01-11', status: 'pending' }
  ])

  // Check if user is admin
  if (!user || user.level < 10) {
    return (
      <div className="text-center py-12">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertDescription>ليس لديك صلاحية للوصول إلى لوحة الإدارة</AlertDescription>
        </Alert>
      </div>
    )
  }

  const handleWithdrawalAction = (id, action) => {
    setPendingWithdrawals(prev => 
      prev.map(withdrawal => 
        withdrawal.id === id 
          ? { ...withdrawal, status: action }
          : withdrawal
      )
    )
    alert(`تم ${action === 'approved' ? 'الموافقة على' : 'رفض'} طلب السحب`)
  }

  const handleUserAction = (id, action) => {
    setRecentUsers(prev => 
      prev.map(user => 
        user.id === id 
          ? { ...user, status: action }
          : user
      )
    )
    alert(`تم ${action === 'suspended' ? 'تعليق' : 'تفعيل'} المستخدم`)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">لوحة تحكم الإدارة</h1>
          <p className="text-gray-600">إدارة المنصة ومراقبة النشاطات</p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          مدير المنصة
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المستخدمين</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% من الشهر الماضي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المستخدمون النشطون</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% من الإجمالي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي النقاط</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPoints.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              موزعة على جميع المستخدمين
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">طلبات السحب المعلقة</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingWithdrawals}</div>
            <p className="text-xs text-muted-foreground">
              تحتاج مراجعة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي السحوبات</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalWithdrawals}</div>
            <p className="text-xs text-muted-foreground">
              مكتملة بنجاح
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">نشاط مشبوه</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.suspiciousActivity}</div>
            <p className="text-xs text-muted-foreground">
              يحتاج تحقيق
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">المستخدمون</TabsTrigger>
          <TabsTrigger value="withdrawals">طلبات السحب</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
          <TabsTrigger value="settings">الإعدادات</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>إدارة المستخدمين</CardTitle>
              <CardDescription>عرض وإدارة حسابات المستخدمين</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <div className="text-center">
                        <div className="text-sm font-medium">{user.points} نقطة</div>
                        <div className="text-xs text-gray-600">المستوى {user.level}</div>
                      </div>
                      
                      <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                        {user.status === 'active' ? 'نشط' : 'معلق'}
                      </Badge>
                      
                      <div className="flex space-x-2 space-x-reverse">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant={user.status === 'active' ? 'destructive' : 'default'}
                          size="sm"
                          onClick={() => handleUserAction(user.id, user.status === 'active' ? 'suspended' : 'active')}
                        >
                          {user.status === 'active' ? 'تعليق' : 'تفعيل'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Withdrawals Tab */}
        <TabsContent value="withdrawals">
          <Card>
            <CardHeader>
              <CardTitle>طلبات السحب المعلقة</CardTitle>
              <CardDescription>مراجعة والموافقة على طلبات السحب</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingWithdrawals.filter(w => w.status === 'pending').map((withdrawal) => (
                  <div key={withdrawal.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{withdrawal.user}</div>
                        <div className="text-sm text-gray-600">
                          {withdrawal.method} - {withdrawal.amount}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 space-x-reverse">
                      <div className="text-center">
                        <div className="text-sm font-medium">{withdrawal.points} نقطة</div>
                        <div className="text-xs text-gray-600">
                          {new Date(withdrawal.date).toLocaleDateString('ar-SA')}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 space-x-reverse">
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleWithdrawalAction(withdrawal.id, 'approved')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          موافقة
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleWithdrawalAction(withdrawal.id, 'rejected')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          رفض
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {pendingWithdrawals.filter(w => w.status === 'pending').length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    لا توجد طلبات سحب معلقة
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>إحصائيات الألعاب</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>سباق السيارات:</span>
                    <span className="font-medium">450 جلسة</span>
                  </div>
                  <div className="flex justify-between">
                    <span>تحدي الذاكرة:</span>
                    <span className="font-medium">320 جلسة</span>
                  </div>
                  <div className="flex justify-between">
                    <span>القفز والجري:</span>
                    <span className="font-medium">280 جلسة</span>
                  </div>
                  <div className="flex justify-between">
                    <span>تركيب الصور:</span>
                    <span className="font-medium">190 جلسة</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>إحصائيات الإعلانات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>إجمالي المشاهدات:</span>
                    <span className="font-medium">12,450</span>
                  </div>
                  <div className="flex justify-between">
                    <span>معدل النقر:</span>
                    <span className="font-medium">3.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الإيرادات المقدرة:</span>
                    <span className="font-medium">$245.80</span>
                  </div>
                  <div className="flex justify-between">
                    <span>متوسط المشاهدة اليومية:</span>
                    <span className="font-medium">890</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات المنصة</CardTitle>
              <CardDescription>إدارة إعدادات النقاط والمكافآت</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">نقاط اللعب اليومي</label>
                    <input 
                      type="number" 
                      defaultValue="1" 
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">نقاط مشاهدة الإعلان</label>
                    <input 
                      type="number" 
                      defaultValue="5" 
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">نقاط الإحالة</label>
                    <input 
                      type="number" 
                      defaultValue="10" 
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">الحد الأقصى للنقاط اليومية</label>
                    <input 
                      type="number" 
                      defaultValue="50" 
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                </div>
                
                <Button>حفظ الإعدادات</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AdminDashboard

