import { Link } from 'react-router-dom'
import { Gamepad2, Mail, Phone, MapPin } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 space-x-reverse mb-4">
              <Gamepad2 className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">منصة الألعاب الربحية</span>
            </div>
            <p className="text-gray-300 mb-4">
              منصة ألعاب ترفيهية تتيح لك اللعب وكسب النقاط ومشاهدة الإعلانات للحصول على جوائز حقيقية. 
              استمتع بوقتك واربح في نفس الوقت!
            </p>
            <div className="flex space-x-4 space-x-reverse">
              <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-300">
                <Mail className="h-4 w-4" />
                <span>support@gaming-platform.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">روابط سريعة</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/games" className="text-gray-300 hover:text-white transition-colors">
                  الألعاب
                </Link>
              </li>
              <li>
                <Link to="/earn-points" className="text-gray-300 hover:text-white transition-colors">
                  اكسب نقاط
                </Link>
              </li>
              <li>
                <Link to="/referrals" className="text-gray-300 hover:text-white transition-colors">
                  الإحالات
                </Link>
              </li>
              <li>
                <Link to="/withdraw" className="text-gray-300 hover:text-white transition-colors">
                  سحب الأرباح
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">الدعم</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white transition-colors">
                  تواصل معنا
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  الأسئلة الشائعة
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  شروط الاستخدام
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  سياسة الخصوصية
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300">
            © 2025 منصة الألعاب الربحية. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

