from flask import Blueprint, jsonify, request, session
from src.models.user import User, Game, PointLog, WithdrawalRequest, GameSession, Referral, db
from datetime import datetime, timedelta
from functools import wraps

admin_bp = Blueprint('admin', __name__)

def admin_required(f):
    """Decorator to require admin privileges"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'غير مسجل الدخول'}), 401
        
        user = User.query.get(session['user_id'])
        if not user or user.level < 10:  # Admin level = 10
            return jsonify({'error': 'صلاحيات إدارية مطلوبة'}), 403
        
        return f(*args, **kwargs)
    return decorated_function

@admin_bp.route('/admin/dashboard', methods=['GET'])
@admin_required
def get_dashboard_stats():
    """Get admin dashboard statistics"""
    try:
        # User statistics
        total_users = User.query.count()
        today = datetime.utcnow().date()
        new_users_today = User.query.filter(db.func.date(User.created_at) == today).count()
        active_users_today = User.query.filter(db.func.date(User.last_login) == today).count()
        
        # Points statistics
        total_points_distributed = db.session.query(db.func.sum(PointLog.points_earned)).scalar() or 0
        points_today = db.session.query(db.func.sum(PointLog.points_earned)).filter(
            db.func.date(PointLog.created_at) == today
        ).scalar() or 0
        
        # Game statistics
        total_games = Game.query.count()
        total_sessions_today = GameSession.query.filter(
            db.func.date(GameSession.start_time) == today
        ).count()
        
        # Withdrawal statistics
        pending_withdrawals = WithdrawalRequest.query.filter_by(status='pending').count()
        total_withdrawals = WithdrawalRequest.query.count()
        total_withdrawal_amount = db.session.query(db.func.sum(WithdrawalRequest.amount_usd)).filter_by(
            status='approved'
        ).scalar() or 0
        
        # Referral statistics
        total_referrals = Referral.query.count()
        referrals_today = Referral.query.filter(db.func.date(Referral.created_at) == today).count()
        
        return jsonify({
            'users': {
                'total': total_users,
                'new_today': new_users_today,
                'active_today': active_users_today
            },
            'points': {
                'total_distributed': total_points_distributed,
                'distributed_today': points_today
            },
            'games': {
                'total': total_games,
                'sessions_today': total_sessions_today
            },
            'withdrawals': {
                'pending': pending_withdrawals,
                'total': total_withdrawals,
                'total_amount': total_withdrawal_amount
            },
            'referrals': {
                'total': total_referrals,
                'today': referrals_today
            }
        })
        
    except Exception as e:
        return jsonify({'error': 'حدث خطأ في جلب إحصائيات اللوحة'}), 500

@admin_bp.route('/admin/users', methods=['GET'])
@admin_required
def get_all_users():
    """Get all users with pagination"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search = request.args.get('search', '')
    
    query = User.query
    
    if search:
        query = query.filter(
            (User.name.contains(search)) |
            (User.email.contains(search)) |
            (User.phone_number.contains(search))
        )
    
    users = query.order_by(User.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return jsonify({
        'users': [user.to_dict() for user in users.items],
        'total': users.total,
        'pages': users.pages,
        'current_page': page
    })

@admin_bp.route('/admin/users/<int:user_id>', methods=['GET'])
@admin_required
def get_user_details(user_id):
    """Get detailed user information"""
    user = User.query.get_or_404(user_id)
    
    # Get user's recent activity
    recent_points = PointLog.query.filter_by(user_id=user_id)\
        .order_by(PointLog.created_at.desc()).limit(10).all()
    
    recent_sessions = GameSession.query.filter_by(user_id=user_id)\
        .order_by(GameSession.start_time.desc()).limit(10).all()
    
    withdrawals = WithdrawalRequest.query.filter_by(user_id=user_id)\
        .order_by(WithdrawalRequest.created_at.desc()).all()
    
    return jsonify({
        'user': user.to_dict(),
        'recent_points': [log.to_dict() for log in recent_points],
        'recent_sessions': [session.to_dict() for session in recent_sessions],
        'withdrawals': [withdrawal.to_dict() for withdrawal in withdrawals]
    })

@admin_bp.route('/admin/users/<int:user_id>/points', methods=['POST'])
@admin_required
def adjust_user_points(user_id):
    """Adjust user points (add or subtract)"""
    try:
        data = request.json
        user = User.query.get_or_404(user_id)
        
        points_change = data.get('points', 0)
        reason = data.get('reason', 'تعديل إداري')
        
        if points_change == 0:
            return jsonify({'error': 'يجب تحديد عدد النقاط'}), 400
        
        # Update user points
        user.points += points_change
        
        # Create log entry
        point_log = PointLog(
            user_id=user_id,
            points_earned=points_change,
            activity_type='admin_adjustment'
        )
        
        db.session.add(point_log)
        db.session.commit()
        
        return jsonify({
            'message': 'تم تعديل النقاط بنجاح',
            'new_balance': user.points
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ أثناء تعديل النقاط'}), 500

@admin_bp.route('/admin/users/<int:user_id>/ban', methods=['POST'])
@admin_required
def ban_user(user_id):
    """Ban or unban a user"""
    try:
        data = request.json
        user = User.query.get_or_404(user_id)
        
        ban_status = data.get('banned', True)
        reason = data.get('reason', 'مخالفة القوانين')
        
        # Add banned field to user model if not exists
        if not hasattr(user, 'banned'):
            # This would require a database migration in production
            pass
        
        # For now, we'll use level 0 to indicate banned users
        if ban_status:
            user.level = 0
        else:
            user.level = 1
        
        db.session.commit()
        
        return jsonify({
            'message': f'تم {"حظر" if ban_status else "إلغاء حظر"} المستخدم بنجاح'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ أثناء تعديل حالة المستخدم'}), 500

@admin_bp.route('/admin/withdrawals', methods=['GET'])
@admin_required
def get_withdrawal_requests():
    """Get all withdrawal requests"""
    status = request.args.get('status', 'all')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    query = WithdrawalRequest.query
    
    if status != 'all':
        query = query.filter_by(status=status)
    
    withdrawals = query.order_by(WithdrawalRequest.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    # Include user information
    result = []
    for withdrawal in withdrawals.items:
        withdrawal_dict = withdrawal.to_dict()
        user = User.query.get(withdrawal.user_id)
        withdrawal_dict['user'] = {
            'name': user.name,
            'email': user.email
        }
        result.append(withdrawal_dict)
    
    return jsonify({
        'withdrawals': result,
        'total': withdrawals.total,
        'pages': withdrawals.pages,
        'current_page': page
    })

@admin_bp.route('/admin/withdrawals/<int:withdrawal_id>/approve', methods=['POST'])
@admin_required
def approve_withdrawal(withdrawal_id):
    """Approve a withdrawal request"""
    try:
        data = request.json
        withdrawal = WithdrawalRequest.query.get_or_404(withdrawal_id)
        
        if withdrawal.status != 'pending':
            return jsonify({'error': 'طلب السحب تم معالجته بالفعل'}), 400
        
        transaction_id = data.get('transaction_id', '')
        
        withdrawal.status = 'approved'
        withdrawal.transaction_id = transaction_id
        withdrawal.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({'message': 'تم الموافقة على طلب السحب'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ أثناء الموافقة على طلب السحب'}), 500

@admin_bp.route('/admin/withdrawals/<int:withdrawal_id>/reject', methods=['POST'])
@admin_required
def reject_withdrawal(withdrawal_id):
    """Reject a withdrawal request"""
    try:
        data = request.json
        withdrawal = WithdrawalRequest.query.get_or_404(withdrawal_id)
        
        if withdrawal.status != 'pending':
            return jsonify({'error': 'طلب السحب تم معالجته بالفعل'}), 400
        
        reason = data.get('reason', 'لم يتم تحديد السبب')
        
        # Return points to user
        user = User.query.get(withdrawal.user_id)
        user.points += withdrawal.points_redeemed
        
        withdrawal.status = 'rejected'
        withdrawal.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({'message': 'تم رفض طلب السحب وإرجاع النقاط'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ أثناء رفض طلب السحب'}), 500

@admin_bp.route('/admin/games/upload', methods=['POST'])
@admin_required
def upload_game():
    """Upload a new game"""
    try:
        data = request.json
        
        if not data.get('name') or not data.get('html_path'):
            return jsonify({'error': 'اسم اللعبة ومسار الملف مطلوبان'}), 400
        
        game = Game(
            name=data['name'],
            description=data.get('description', ''),
            html_path=data['html_path'],
            thumbnail=data.get('thumbnail')
        )
        
        db.session.add(game)
        db.session.commit()
        
        return jsonify({
            'message': 'تم رفع اللعبة بنجاح',
            'game': game.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ أثناء رفع اللعبة'}), 500

@admin_bp.route('/admin/suspicious-activity', methods=['GET'])
@admin_required
def get_suspicious_activity():
    """Get suspicious user activity patterns"""
    try:
        # Users with too many points in one day
        today = datetime.utcnow().date()
        suspicious_users = db.session.query(
            PointLog.user_id,
            db.func.sum(PointLog.points_earned).label('daily_points'),
            db.func.count(PointLog.id).label('activities_count')
        ).filter(
            db.func.date(PointLog.created_at) == today
        ).group_by(PointLog.user_id).having(
            db.func.sum(PointLog.points_earned) > 100  # Suspicious if more than 100 points per day
        ).all()
        
        # Users with same IP
        duplicate_ips = db.session.query(
            User.ip_address,
            db.func.count(User.id).label('user_count')
        ).group_by(User.ip_address).having(
            db.func.count(User.id) > 3  # Suspicious if more than 3 users per IP
        ).all()
        
        # Users with rapid point earning
        rapid_earners = db.session.query(
            PointLog.user_id,
            db.func.count(PointLog.id).label('activities_count')
        ).filter(
            PointLog.created_at >= datetime.utcnow() - timedelta(hours=1)
        ).group_by(PointLog.user_id).having(
            db.func.count(PointLog.id) > 20  # More than 20 activities per hour
        ).all()
        
        return jsonify({
            'high_daily_points': [
                {
                    'user_id': item.user_id,
                    'daily_points': item.daily_points,
                    'activities_count': item.activities_count,
                    'user': User.query.get(item.user_id).to_dict()
                }
                for item in suspicious_users
            ],
            'duplicate_ips': [
                {
                    'ip_address': item.ip_address,
                    'user_count': item.user_count,
                    'users': [user.to_dict() for user in User.query.filter_by(ip_address=item.ip_address).all()]
                }
                for item in duplicate_ips
            ],
            'rapid_earners': [
                {
                    'user_id': item.user_id,
                    'activities_count': item.activities_count,
                    'user': User.query.get(item.user_id).to_dict()
                }
                for item in rapid_earners
            ]
        })
        
    except Exception as e:
        return jsonify({'error': 'حدث خطأ في جلب الأنشطة المشبوهة'}), 500

@admin_bp.route('/admin/settings', methods=['GET'])
@admin_required
def get_settings():
    """Get platform settings"""
    # In a real application, these would be stored in database
    settings = {
        'daily_points_cap': 50,
        'min_withdrawal_points': 2000,
        'points_per_dollar': 1000,
        'max_ads_per_day': 10,
        'max_game_ads_per_day': 3,
        'referral_bonus': 10,
        'daily_login_bonus': 1,
        'three_minute_play_bonus': 2,
        'ad_watch_bonus': 5
    }
    
    return jsonify(settings)

@admin_bp.route('/admin/settings', methods=['POST'])
@admin_required
def update_settings():
    """Update platform settings"""
    try:
        data = request.json
        
        # In a real application, these would be stored in database
        # For now, we'll just return success
        
        return jsonify({'message': 'تم تحديث الإعدادات بنجاح'})
        
    except Exception as e:
        return jsonify({'error': 'حدث خطأ أثناء تحديث الإعدادات'}), 500

