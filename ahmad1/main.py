import os
import sys
# DON'T CHANGE THIS !!!
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from flask import Flask, send_from_directory
from flask_cors import CORS
from src.models.user import db
from src.routes.user import user_bp
from src.routes.auth import auth_bp
from src.routes.games import games_bp
from src.routes.points import points_bp
from src.routes.admin import admin_bp
from src.routes.protection import protection_bp

app = Flask(__name__, static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SECRET_KEY'] = 'gaming_platform_secret_key_2025'

# Enable CORS for all routes
CORS(app, supports_credentials=True)

# Register blueprints
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(games_bp, url_prefix='/api')
app.register_blueprint(points_bp, url_prefix='/api')
app.register_blueprint(admin_bp, url_prefix='/api')
app.register_blueprint(protection_bp, url_prefix='/api')

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(os.path.dirname(__file__), 'database', 'app.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Initialize database and seed data
with app.app_context():
    db.create_all()
    
    # Seed initial games data
    from src.models.user import Game
    
    if Game.query.count() == 0:
        games_data = [
            {
                'name': 'سباق السيارات',
                'description': 'لعبة سباق مثيرة تجنب فيها السيارات الأخرى واجمع النقاط',
                'html_path': '/games/car-racing.html',
                'thumbnail': '/images/car-racing-thumb.jpg'
            },
            {
                'name': 'تحدي الذاكرة',
                'description': 'اختبر ذاكرتك مع لعبة الكروت المطابقة',
                'html_path': '/games/memory-cards.html',
                'thumbnail': '/images/memory-cards-thumb.jpg'
            },
            {
                'name': 'القفز والجري',
                'description': 'اقفز فوق العوائق واجمع العملات الذهبية',
                'html_path': '/games/jump-run.html',
                'thumbnail': '/images/jump-run-thumb.jpg'
            },
            {
                'name': 'تركيب الصور',
                'description': 'حل الألغاز وركب القطع في مكانها الصحيح',
                'html_path': '/games/puzzle-jigsaw.html',
                'thumbnail': '/images/puzzle-jigsaw-thumb.jpg'
            }
        ]
        
        for game_data in games_data:
            game = Game(**game_data)
            db.session.add(game)
        
        db.session.commit()
        print("تم إنشاء الألعاب الأولية بنجاح")

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    static_folder_path = app.static_folder
    if static_folder_path is None:
        return "Static folder not configured", 404

    if path != "" and os.path.exists(os.path.join(static_folder_path, path)):
        return send_from_directory(static_folder_path, path)
    else:
        index_path = os.path.join(static_folder_path, 'index.html')
        if os.path.exists(index_path):
            return send_from_directory(static_folder_path, 'index.html')
        else:
            return "index.html not found", 404

# Health check endpoint
@app.route('/api/health')
def health_check():
    return {'status': 'healthy', 'message': 'Gaming Platform API is running'}

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

