from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    phone_number = db.Column(db.String(20), unique=True, nullable=True)
    google_id = db.Column(db.String(100), unique=True, nullable=True)
    facebook_id = db.Column(db.String(100), unique=True, nullable=True)
    points = db.Column(db.Integer, default=0)
    daily_points_cap = db.Column(db.Integer, default=50)
    level = db.Column(db.Integer, default=1)
    ip_address = db.Column(db.String(45), nullable=True)
    last_login = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    point_logs = db.relationship('PointLog', backref='user', lazy=True)
    withdrawal_requests = db.relationship('WithdrawalRequest', backref='user', lazy=True)
    game_sessions = db.relationship('GameSession', backref='user', lazy=True)
    referrals_made = db.relationship('Referral', foreign_keys='Referral.referrer_id', backref='referrer', lazy=True)
    referrals_received = db.relationship('Referral', foreign_keys='Referral.referred_id', backref='referred', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def add_points(self, points, activity_type, game_id=None, ad_id=None):
        """Add points to user and create log entry"""
        self.points += points
        
        # Create point log
        point_log = PointLog(
            user_id=self.id,
            points_earned=points,
            activity_type=activity_type,
            game_id=game_id,
            ad_id=ad_id
        )
        db.session.add(point_log)
        db.session.commit()

    def can_earn_daily_points(self):
        """Check if user can still earn points today"""
        today = datetime.utcnow().date()
        today_points = db.session.query(db.func.sum(PointLog.points_earned)).filter(
            PointLog.user_id == self.id,
            db.func.date(PointLog.created_at) == today
        ).scalar() or 0
        
        return today_points < self.daily_points_cap

    def get_daily_points_earned(self):
        """Get points earned today"""
        today = datetime.utcnow().date()
        return db.session.query(db.func.sum(PointLog.points_earned)).filter(
            PointLog.user_id == self.id,
            db.func.date(PointLog.created_at) == today
        ).scalar() or 0

    def __repr__(self):
        return f'<User {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone_number': self.phone_number,
            'points': self.points,
            'level': self.level,
            'daily_points_cap': self.daily_points_cap,
            'daily_points_earned': self.get_daily_points_earned(),
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'created_at': self.created_at.isoformat()
        }


class Game(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    html_path = db.Column(db.String(255), nullable=False)
    thumbnail = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    game_sessions = db.relationship('GameSession', backref='game', lazy=True)
    point_logs = db.relationship('PointLog', backref='game', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'html_path': self.html_path,
            'thumbnail': self.thumbnail,
            'created_at': self.created_at.isoformat()
        }


class Ad(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # video, banner, interstitial
    provider = db.Column(db.String(50), nullable=False)  # adsterra, admob, unity
    duration = db.Column(db.Integer, nullable=True)  # in seconds
    points_reward = db.Column(db.Integer, default=5)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    point_logs = db.relationship('PointLog', backref='ad', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'type': self.type,
            'provider': self.provider,
            'duration': self.duration,
            'points_reward': self.points_reward
        }


class PointLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    points_earned = db.Column(db.Integer, nullable=False)
    activity_type = db.Column(db.String(50), nullable=False)  # play_game, watch_ad, daily_login, invite_friend
    game_id = db.Column(db.Integer, db.ForeignKey('game.id'), nullable=True)
    ad_id = db.Column(db.Integer, db.ForeignKey('ad.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'points_earned': self.points_earned,
            'activity_type': self.activity_type,
            'game_id': self.game_id,
            'ad_id': self.ad_id,
            'created_at': self.created_at.isoformat()
        }


class WithdrawalRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    points_redeemed = db.Column(db.Integer, nullable=False)
    amount_usd = db.Column(db.Float, nullable=False)
    payment_method = db.Column(db.String(50), nullable=False)  # payeer, mobile_credit, gift_card
    status = db.Column(db.String(20), default='pending')  # pending, approved, rejected
    transaction_id = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'points_redeemed': self.points_redeemed,
            'amount_usd': self.amount_usd,
            'payment_method': self.payment_method,
            'status': self.status,
            'transaction_id': self.transaction_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }


class Referral(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    referrer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    referred_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'referrer_id': self.referrer_id,
            'referred_id': self.referred_id,
            'created_at': self.created_at.isoformat()
        }


class GameSession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    game_id = db.Column(db.Integer, db.ForeignKey('game.id'), nullable=False)
    start_time = db.Column(db.DateTime, default=datetime.utcnow)
    end_time = db.Column(db.DateTime, nullable=True)
    duration_minutes = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def end_session(self):
        """End the game session and calculate duration"""
        self.end_time = datetime.utcnow()
        if self.start_time:
            duration = self.end_time - self.start_time
            self.duration_minutes = duration.total_seconds() / 60

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'game_id': self.game_id,
            'start_time': self.start_time.isoformat(),
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'duration_minutes': self.duration_minutes,
            'created_at': self.created_at.isoformat()
        }

