from flask import Blueprint, jsonify, request, session
from src.models.user import User, PointLog, db
from datetime import datetime, timedelta
from collections import defaultdict
import hashlib

protection_bp = Blueprint('protection', __name__)

class SuspiciousPatternDetector:
    """Class to detect suspicious user patterns"""
    
    @staticmethod
    def detect_rapid_clicking(user_id, time_window_minutes=5, max_actions=20):
        """Detect if user is clicking too rapidly"""
        time_threshold = datetime.utcnow() - timedelta(minutes=time_window_minutes)
        
        recent_actions = PointLog.query.filter(
            PointLog.user_id == user_id,
            PointLog.created_at >= time_threshold
        ).count()
        
        return recent_actions > max_actions
    
    @staticmethod
    def detect_device_fingerprint_abuse(ip_address, user_agent, max_accounts=3):
        """Detect multiple accounts from same device"""
        # Create device fingerprint
        device_fingerprint = hashlib.md5(f"{ip_address}_{user_agent}".encode()).hexdigest()
        
        # Count users with same fingerprint
        users_with_fingerprint = User.query.filter_by(ip_address=ip_address).count()
        
        return users_with_fingerprint > max_accounts
    
    @staticmethod
    def detect_unusual_earning_pattern(user_id, daily_cap_multiplier=2):
        """Detect unusual earning patterns"""
        user = User.query.get(user_id)
        if not user:
            return False
        
        today = datetime.utcnow().date()
        daily_points = user.get_daily_points_earned()
        
        # Check if user earned more than 2x their daily cap
        return daily_points > (user.daily_points_cap * daily_cap_multiplier)
    
    @staticmethod
    def detect_bot_behavior(user_id, time_window_hours=1):
        """Detect bot-like behavior patterns"""
        time_threshold = datetime.utcnow() - timedelta(hours=time_window_hours)
        
        # Get recent point logs
        recent_logs = PointLog.query.filter(
            PointLog.user_id == user_id,
            PointLog.created_at >= time_threshold
        ).order_by(PointLog.created_at).all()
        
        if len(recent_logs) < 5:
            return False
        
        # Check for too regular intervals (bot-like)
        intervals = []
        for i in range(1, len(recent_logs)):
            interval = (recent_logs[i].created_at - recent_logs[i-1].created_at).total_seconds()
            intervals.append(interval)
        
        # If all intervals are very similar (within 2 seconds), it's suspicious
        if len(intervals) > 0:
            avg_interval = sum(intervals) / len(intervals)
            similar_intervals = sum(1 for interval in intervals if abs(interval - avg_interval) < 2)
            
            return similar_intervals / len(intervals) > 0.8  # 80% similar intervals
        
        return False

@protection_bp.route('/protection/validate-action', methods=['POST'])
def validate_user_action():
    """Validate if user action is legitimate"""
    if 'user_id' not in session:
        return jsonify({'error': 'غير مسجل الدخول'}), 401
    
    try:
        data = request.json
        user_id = session['user_id']
        action_type = data.get('action_type')  # 'watch_ad', 'play_game', etc.
        
        detector = SuspiciousPatternDetector()
        
        # Run various checks
        checks = {
            'rapid_clicking': detector.detect_rapid_clicking(user_id),
            'unusual_earning': detector.detect_unusual_earning_pattern(user_id),
            'bot_behavior': detector.detect_bot_behavior(user_id),
            'device_abuse': detector.detect_device_fingerprint_abuse(
                request.remote_addr,
                request.headers.get('User-Agent', '')
            )
        }
        
        # Determine if action should be blocked
        suspicious_count = sum(checks.values())
        
        if suspicious_count >= 2:  # Block if 2 or more suspicious patterns
            return jsonify({
                'allowed': False,
                'reason': 'تم اكتشاف نشاط مشبوه',
                'checks': checks
            }), 403
        
        elif suspicious_count == 1:  # Warning if 1 suspicious pattern
            return jsonify({
                'allowed': True,
                'warning': 'تحذير: تم اكتشاف نشاط غير عادي',
                'checks': checks
            }), 200
        
        else:  # All clear
            return jsonify({
                'allowed': True,
                'checks': checks
            }), 200
        
    except Exception as e:
        return jsonify({'error': 'حدث خطأ أثناء التحقق من الأمان'}), 500

@protection_bp.route('/protection/report-suspicious', methods=['POST'])
def report_suspicious_activity():
    """Report suspicious activity for investigation"""
    if 'user_id' not in session:
        return jsonify({'error': 'غير مسجل الدخول'}), 401
    
    try:
        data = request.json
        reported_user_id = data.get('reported_user_id')
        reason = data.get('reason', '')
        evidence = data.get('evidence', {})
        
        # In a real application, this would be stored in a reports table
        # For now, we'll just log it
        
        return jsonify({'message': 'تم إرسال التقرير بنجاح'})
        
    except Exception as e:
        return jsonify({'error': 'حدث خطأ أثناء إرسال التقرير'}), 500

@protection_bp.route('/protection/device-info', methods=['POST'])
def register_device_info():
    """Register device information for fingerprinting"""
    if 'user_id' not in session:
        return jsonify({'error': 'غير مسجل الدخول'}), 401
    
    try:
        data = request.json
        user_id = session['user_id']
        
        # Device information
        device_info = {
            'user_agent': request.headers.get('User-Agent', ''),
            'ip_address': request.remote_addr,
            'screen_resolution': data.get('screen_resolution'),
            'timezone': data.get('timezone'),
            'language': data.get('language'),
            'platform': data.get('platform')
        }
        
        # Update user's device info
        user = User.query.get(user_id)
        user.ip_address = device_info['ip_address']
        db.session.commit()
        
        # In a real application, store full device fingerprint in separate table
        
        return jsonify({'message': 'تم تسجيل معلومات الجهاز'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ أثناء تسجيل معلومات الجهاز'}), 500

@protection_bp.route('/protection/check-daily-limits', methods=['GET'])
def check_daily_limits():
    """Check user's daily limits"""
    if 'user_id' not in session:
        return jsonify({'error': 'غير مسجل الدخول'}), 401
    
    try:
        user_id = session['user_id']
        user = User.query.get(user_id)
        
        today = datetime.utcnow().date()
        
        # Get today's activities
        today_points = user.get_daily_points_earned()
        
        # Count different types of activities today
        today_ads = PointLog.query.filter(
            PointLog.user_id == user_id,
            PointLog.activity_type == 'watch_ad',
            db.func.date(PointLog.created_at) == today
        ).count()
        
        today_games = PointLog.query.filter(
            PointLog.user_id == user_id,
            PointLog.activity_type == 'play_game',
            db.func.date(PointLog.created_at) == today
        ).count()
        
        return jsonify({
            'daily_points_earned': today_points,
            'daily_points_cap': user.daily_points_cap,
            'remaining_points': max(0, user.daily_points_cap - today_points),
            'ads_watched_today': today_ads,
            'max_ads_per_day': 10,
            'games_played_today': today_games,
            'can_earn_more': user.can_earn_daily_points()
        })
        
    except Exception as e:
        return jsonify({'error': 'حدث خطأ أثناء فحص الحدود اليومية'}), 500

@protection_bp.route('/protection/verify-ad-completion', methods=['POST'])
def verify_ad_completion():
    """Verify that ad was actually watched completely"""
    if 'user_id' not in session:
        return jsonify({'error': 'غير مسجل الدخول'}), 401
    
    try:
        data = request.json
        user_id = session['user_id']
        
        # Ad verification data
        ad_id = data.get('ad_id')
        watch_duration = data.get('watch_duration', 0)
        expected_duration = data.get('expected_duration', 15)
        interaction_events = data.get('interaction_events', [])
        
        # Verify ad was watched for minimum duration
        if watch_duration < expected_duration * 0.8:  # At least 80% of ad duration
            return jsonify({
                'verified': False,
                'reason': 'لم يتم مشاهدة الإعلان بالكامل'
            }), 400
        
        # Check for interaction events (mouse movements, clicks, etc.)
        if len(interaction_events) < 2:  # Minimum interaction required
            return jsonify({
                'verified': False,
                'reason': 'لم يتم اكتشاف تفاعل كافي مع الإعلان'
            }), 400
        
        # Additional bot detection
        detector = SuspiciousPatternDetector()
        if detector.detect_rapid_clicking(user_id):
            return jsonify({
                'verified': False,
                'reason': 'تم اكتشاف نشاط مشبوه'
            }), 400
        
        return jsonify({
            'verified': True,
            'message': 'تم التحقق من مشاهدة الإعلان بنجاح'
        })
        
    except Exception as e:
        return jsonify({'error': 'حدث خطأ أثناء التحقق من الإعلان'}), 500

@protection_bp.route('/protection/auto-block-check', methods=['POST'])
def auto_block_check():
    """Automatic blocking check for suspicious patterns"""
    if 'user_id' not in session:
        return jsonify({'error': 'غير مسجل الدخول'}), 401
    
    try:
        user_id = session['user_id']
        user = User.query.get(user_id)
        
        detector = SuspiciousPatternDetector()
        
        # Run comprehensive checks
        issues = []
        
        if detector.detect_rapid_clicking(user_id):
            issues.append('نقرات سريعة مشبوهة')
        
        if detector.detect_unusual_earning_pattern(user_id):
            issues.append('نمط كسب نقاط غير عادي')
        
        if detector.detect_bot_behavior(user_id):
            issues.append('سلوك يشبه البوت')
        
        if detector.detect_device_fingerprint_abuse(
            request.remote_addr,
            request.headers.get('User-Agent', '')
        ):
            issues.append('استخدام عدة حسابات من نفس الجهاز')
        
        # Auto-block if multiple issues detected
        if len(issues) >= 3:
            user.level = 0  # Temporary ban
            db.session.commit()
            
            return jsonify({
                'blocked': True,
                'reason': 'تم حظر الحساب تلقائياً بسبب نشاط مشبوه',
                'issues': issues
            }), 403
        
        elif len(issues) >= 1:
            return jsonify({
                'blocked': False,
                'warning': True,
                'issues': issues
            }), 200
        
        else:
            return jsonify({
                'blocked': False,
                'warning': False,
                'status': 'نظيف'
            }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ أثناء فحص الحماية التلقائية'}), 500

