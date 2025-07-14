from flask import Blueprint, jsonify, request, session
from src.models.user import User, PointLog, WithdrawalRequest, Referral, db
from datetime import datetime, timedelta

points_bp = Blueprint('points', __name__)

@points_bp.route('/points/balance', methods=['GET'])
def get_points_balance():
    """Get user's current points balance"""
    if 'user_id' not in session:
        return jsonify({'error': 'غير مسجل الدخول'}), 401
    
    user = User.query.get(session['user_id'])
    if not user:
        return jsonify({'error': 'المستخدم غير موجود'}), 404
    
    return jsonify({
        'points': user.points,
        'daily_points_earned': user.get_daily_points_earned(),
        'daily_points_cap': user.daily_points_cap,
        'level': user.level
    })

@points_bp.route('/points/history', methods=['GET'])
def get_points_history():
    """Get user's points earning history"""
    if 'user_id' not in session:
        return jsonify({'error': 'غير مسجل الدخول'}), 401
    
    user_id = session['user_id']
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    point_logs = PointLog.query.filter_by(user_id=user_id)\
        .order_by(PointLog.created_at.desc())\
        .paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'logs': [log.to_dict() for log in point_logs.items],
        'total': point_logs.total,
        'pages': point_logs.pages,
        'current_page': page
    })

@points_bp.route('/points/watch-ad', methods=['POST'])
def watch_ad():
    """Award points for watching standalone ad"""
    if 'user_id' not in session:
        return jsonify({'error': 'غير مسجل الدخول'}), 401
    
    try:
        user_id = session['user_id']
        user = User.query.get(user_id)
        
        if not user.can_earn_daily_points():
            return jsonify({'error': 'تم الوصول للحد الأقصى من النقاط اليومية'}), 400
        
        # Check ad watching limit (max 10 ads per day)
        today = datetime.utcnow().date()
        today_ad_views = PointLog.query.filter(
            PointLog.user_id == user_id,
            PointLog.activity_type == 'watch_ad',
            PointLog.game_id.is_(None),  # Standalone ads
            db.func.date(PointLog.created_at) == today
        ).count()
        
        if today_ad_views >= 10:
            return jsonify({'error': 'تم الوصول للحد الأقصى من مشاهدة الإعلانات اليوم'}), 400
        
        # Award points for watching ad
        user.add_points(5, 'watch_ad')
        
        return jsonify({
            'message': 'تم منح النقاط لمشاهدة الإعلان',
            'points_awarded': 5,
            'total_points': user.points
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ أثناء منح نقاط الإعلان'}), 500

@points_bp.route('/points/refer-friend', methods=['POST'])
def refer_friend():
    """Create referral link or process referral"""
    if 'user_id' not in session:
        return jsonify({'error': 'غير مسجل الدخول'}), 401
    
    try:
        data = request.json
        referrer_id = session['user_id']
        
        if data.get('action') == 'create_link':
            # Generate referral link
            referral_code = f"ref_{referrer_id}_{datetime.utcnow().timestamp()}"
            return jsonify({
                'referral_link': f"/register?ref={referrer_id}",
                'referral_code': referral_code
            })
        
        elif data.get('action') == 'process_referral':
            referred_email = data.get('referred_email')
            if not referred_email:
                return jsonify({'error': 'بريد المُحال مطلوب'}), 400
            
            # Find referred user
            referred_user = User.query.filter_by(email=referred_email).first()
            if not referred_user:
                return jsonify({'error': 'المستخدم المُحال غير موجود'}), 404
            
            # Check if referral already exists
            existing_referral = Referral.query.filter_by(
                referrer_id=referrer_id,
                referred_id=referred_user.id
            ).first()
            
            if existing_referral:
                return jsonify({'error': 'تم إحالة هذا المستخدم من قبل'}), 400
            
            # Create referral
            referral = Referral(
                referrer_id=referrer_id,
                referred_id=referred_user.id
            )
            db.session.add(referral)
            
            # Award points to referrer
            referrer = User.query.get(referrer_id)
            if referrer.can_earn_daily_points():
                referrer.add_points(10, 'invite_friend')
            
            db.session.commit()
            
            return jsonify({
                'message': 'تم منح نقاط الإحالة بنجاح',
                'points_awarded': 10
            }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ أثناء معالجة الإحالة'}), 500

@points_bp.route('/points/withdraw', methods=['POST'])
def request_withdrawal():
    """Request points withdrawal"""
    if 'user_id' not in session:
        return jsonify({'error': 'غير مسجل الدخول'}), 401
    
    try:
        data = request.json
        user_id = session['user_id']
        user = User.query.get(user_id)
        
        points_to_redeem = data.get('points', 0)
        payment_method = data.get('payment_method')
        
        if not payment_method or payment_method not in ['payeer', 'mobile_credit', 'gift_card']:
            return jsonify({'error': 'طريقة الدفع غير صحيحة'}), 400
        
        if points_to_redeem < 2000:  # Minimum 2000 points = $2
            return jsonify({'error': 'الحد الأدنى للسحب 2000 نقطة (2 دولار)'}), 400
        
        if user.points < points_to_redeem:
            return jsonify({'error': 'رصيد النقاط غير كافي'}), 400
        
        # Calculate USD amount (100 points = $0.1)
        amount_usd = points_to_redeem / 1000
        
        # Create withdrawal request
        withdrawal = WithdrawalRequest(
            user_id=user_id,
            points_redeemed=points_to_redeem,
            amount_usd=amount_usd,
            payment_method=payment_method
        )
        
        # Deduct points from user
        user.points -= points_to_redeem
        
        db.session.add(withdrawal)
        db.session.commit()
        
        return jsonify({
            'message': 'تم إرسال طلب السحب بنجاح',
            'withdrawal_id': withdrawal.id,
            'amount_usd': amount_usd,
            'remaining_points': user.points
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ أثناء طلب السحب'}), 500

@points_bp.route('/points/withdrawals', methods=['GET'])
def get_withdrawals():
    """Get user's withdrawal history"""
    if 'user_id' not in session:
        return jsonify({'error': 'غير مسجل الدخول'}), 401
    
    user_id = session['user_id']
    withdrawals = WithdrawalRequest.query.filter_by(user_id=user_id)\
        .order_by(WithdrawalRequest.created_at.desc()).all()
    
    return jsonify([withdrawal.to_dict() for withdrawal in withdrawals])

@points_bp.route('/points/stats', methods=['GET'])
def get_points_stats():
    """Get user's points statistics"""
    if 'user_id' not in session:
        return jsonify({'error': 'غير مسجل الدخول'}), 401
    
    user_id = session['user_id']
    
    # Get stats for different time periods
    today = datetime.utcnow().date()
    week_ago = today - timedelta(days=7)
    month_ago = today - timedelta(days=30)
    
    today_points = db.session.query(db.func.sum(PointLog.points_earned)).filter(
        PointLog.user_id == user_id,
        db.func.date(PointLog.created_at) == today
    ).scalar() or 0
    
    week_points = db.session.query(db.func.sum(PointLog.points_earned)).filter(
        PointLog.user_id == user_id,
        db.func.date(PointLog.created_at) >= week_ago
    ).scalar() or 0
    
    month_points = db.session.query(db.func.sum(PointLog.points_earned)).filter(
        PointLog.user_id == user_id,
        db.func.date(PointLog.created_at) >= month_ago
    ).scalar() or 0
    
    total_points = db.session.query(db.func.sum(PointLog.points_earned)).filter(
        PointLog.user_id == user_id
    ).scalar() or 0
    
    return jsonify({
        'today_points': today_points,
        'week_points': week_points,
        'month_points': month_points,
        'total_earned': total_points,
        'current_balance': User.query.get(user_id).points
    })

