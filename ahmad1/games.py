from flask import Blueprint, jsonify, request, session
from src.models.user import User, Game, GameSession, PointLog, db
from datetime import datetime

games_bp = Blueprint('games', __name__)

@games_bp.route('/games', methods=['GET'])
def get_games():
    """Get all available games"""
    games = Game.query.all()
    return jsonify([game.to_dict() for game in games])

@games_bp.route('/games/<int:game_id>', methods=['GET'])
def get_game(game_id):
    """Get specific game details"""
    game = Game.query.get_or_404(game_id)
    return jsonify(game.to_dict())

@games_bp.route('/games', methods=['POST'])
def create_game():
    """Create a new game (admin only)"""
    if 'user_id' not in session:
        return jsonify({'error': 'غير مسجل الدخول'}), 401
    
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
            'message': 'تم إنشاء اللعبة بنجاح',
            'game': game.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ أثناء إنشاء اللعبة'}), 500

@games_bp.route('/games/<int:game_id>/start-session', methods=['POST'])
def start_game_session(game_id):
    """Start a new game session"""
    if 'user_id' not in session:
        return jsonify({'error': 'غير مسجل الدخول'}), 401
    
    try:
        user_id = session['user_id']
        user = User.query.get(user_id)
        game = Game.query.get_or_404(game_id)
        
        # Check if user has already played this game today
        today = datetime.utcnow().date()
        today_sessions = GameSession.query.filter(
            GameSession.user_id == user_id,
            GameSession.game_id == game_id,
            db.func.date(GameSession.start_time) == today
        ).count()
        
        # Award points for first play of the day
        if today_sessions == 0 and user.can_earn_daily_points():
            user.add_points(1, 'play_game', game_id=game_id)
        
        # Create new game session
        session_obj = GameSession(
            user_id=user_id,
            game_id=game_id
        )
        
        db.session.add(session_obj)
        db.session.commit()
        
        return jsonify({
            'message': 'تم بدء جلسة اللعب',
            'session_id': session_obj.id,
            'points_awarded': 1 if today_sessions == 0 else 0
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ أثناء بدء جلسة اللعب'}), 500

@games_bp.route('/games/sessions/<int:session_id>/end', methods=['POST'])
def end_game_session(session_id):
    """End a game session"""
    if 'user_id' not in session:
        return jsonify({'error': 'غير مسجل الدخول'}), 401
    
    try:
        user_id = session['user_id']
        user = User.query.get(user_id)
        session_obj = GameSession.query.filter_by(
            id=session_id,
            user_id=user_id
        ).first_or_404()
        
        # End the session
        session_obj.end_session()
        
        # Award points for playing 3+ minutes
        points_awarded = 0
        if session_obj.duration_minutes and session_obj.duration_minutes >= 3 and user.can_earn_daily_points():
            user.add_points(2, 'play_game', game_id=session_obj.game_id)
            points_awarded = 2
        
        db.session.commit()
        
        return jsonify({
            'message': 'تم إنهاء جلسة اللعب',
            'duration_minutes': session_obj.duration_minutes,
            'points_awarded': points_awarded
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ أثناء إنهاء جلسة اللعب'}), 500

@games_bp.route('/games/<int:game_id>/watch-ad', methods=['POST'])
def watch_ad_in_game(game_id):
    """Award points for watching ad in game"""
    if 'user_id' not in session:
        return jsonify({'error': 'غير مسجل الدخول'}), 401
    
    try:
        user_id = session['user_id']
        user = User.query.get(user_id)
        game = Game.query.get_or_404(game_id)
        
        if not user.can_earn_daily_points():
            return jsonify({'error': 'تم الوصول للحد الأقصى من النقاط اليومية'}), 400
        
        # Check if user already watched ad in this game session today
        today = datetime.utcnow().date()
        today_ad_views = PointLog.query.filter(
            PointLog.user_id == user_id,
            PointLog.activity_type == 'watch_ad',
            PointLog.game_id == game_id,
            db.func.date(PointLog.created_at) == today
        ).count()
        
        if today_ad_views >= 3:  # Limit ad views per game per day
            return jsonify({'error': 'تم الوصول للحد الأقصى من مشاهدة الإعلانات لهذه اللعبة اليوم'}), 400
        
        # Award points for watching ad
        user.add_points(5, 'watch_ad', game_id=game_id)
        
        return jsonify({
            'message': 'تم منح النقاط لمشاهدة الإعلان',
            'points_awarded': 5,
            'total_points': user.points
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'حدث خطأ أثناء منح نقاط الإعلان'}), 500

@games_bp.route('/games/my-sessions', methods=['GET'])
def get_my_game_sessions():
    """Get user's game sessions"""
    if 'user_id' not in session:
        return jsonify({'error': 'غير مسجل الدخول'}), 401
    
    user_id = session['user_id']
    sessions = GameSession.query.filter_by(user_id=user_id).order_by(GameSession.created_at.desc()).limit(50).all()
    
    return jsonify([session_obj.to_dict() for session_obj in sessions])

@games_bp.route('/games/leaderboard', methods=['GET'])
def get_leaderboard():
    """Get top players leaderboard"""
    top_users = User.query.order_by(User.points.desc()).limit(10).all()
    
    leaderboard = []
    for i, user in enumerate(top_users, 1):
        leaderboard.append({
            'rank': i,
            'name': user.name,
            'points': user.points,
            'level': user.level
        })
    
    return jsonify(leaderboard)

