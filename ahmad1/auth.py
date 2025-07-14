from flask import Blueprint, jsonify, request, session
from src.models.user import User, db
from datetime import datetime
import re

auth_bp = Blueprint('auth', __name__)

def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_phone(phone):
    # Simple phone validation - adjust as needed
    pattern = r'^\+?[1-9]\d{1,14}$'
    return re.match(pattern, phone) is not None

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
        
        # Validate required fields
        if not data.get('name') or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'الاسم والبريد الإلكتروني وكلمة المرور مطلوبة'}), 400
        
        # Validate email format
        if not validate_email(data['email']):
            return jsonify({'error': 'صيغة البريد الإلكتروني غير صحيحة'}), 400
        
        # Validate phone if provided
        if data.get('phone_number') and not validate_phone(data['phone_number']):
            return jsonify({'error': 'صيغة رقم الهاتف غير صحيحة'}), 400
        
        # Check if user already exists
        existing_user = User.query.filter(
            (User.email == data['email']) | 
            (User.phone_number == data.get('phone_number'))
        ).first()
        
        if existing_user:
            return jsonify({'error': 'المستخدم موجود بالفعل'}), 409
        
        # Create new user
        user = User(
            name=data['name'],
            email=data['email'],
            phone_number=data.get('phone_number'),
            google_id=data.get('google_id'),
            facebook_id=data.get('facebook_id'),
            ip_address=request.remote_addr
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # Log the user in
        session['user_id'] = user.id
        session['user_name'] = user.name
        
        return jsonify({
            'message': 'تم التسجيل بنجاح',
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ أثناء التسجيل'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'البريد الإلكتروني وكلمة المرور مطلوبان'}), 400
        
        # Find user by email
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'البريد الإلكتروني أو كلمة المرور غير صحيحة'}), 401
        
        # Update last login and IP
        user.last_login = datetime.utcnow()
        user.ip_address = request.remote_addr
        
        # Check for daily login bonus
        today = datetime.utcnow().date()
        last_login_date = user.last_login.date() if user.last_login else None
        
        if last_login_date != today and user.can_earn_daily_points():
            user.add_points(1, 'daily_login')
        
        db.session.commit()
        
        # Log the user in
        session['user_id'] = user.id
        session['user_name'] = user.name
        
        return jsonify({
            'message': 'تم تسجيل الدخول بنجاح',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'حدث خطأ أثناء تسجيل الدخول'}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'تم تسجيل الخروج بنجاح'}), 200

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    if 'user_id' not in session:
        return jsonify({'error': 'غير مسجل الدخول'}), 401
    
    user = User.query.get(session['user_id'])
    if not user:
        session.clear()
        return jsonify({'error': 'المستخدم غير موجود'}), 404
    
    return jsonify(user.to_dict()), 200

@auth_bp.route('/check-auth', methods=['GET'])
def check_auth():
    if 'user_id' in session:
        user = User.query.get(session['user_id'])
        if user:
            return jsonify({
                'authenticated': True,
                'user': user.to_dict()
            }), 200
    
    return jsonify({'authenticated': False}), 200

