from flask import Blueprint, jsonify, request
from model import Database
import os
import requests

# Blueprint utama
utama_bp = Blueprint('utama', __name__)

# Karena di app.py ada url_prefix='/api', rute ini otomatis jadi '/api/portfolio'
@utama_bp.route('/portfolio', methods=['GET'])
def get_portfolio_data():
    """Endpoint API untuk ditarik oleh script.js di Frontend"""
    try:
        db = Database()
        
        # Ambil user_id admin (asumsi admin utama)
        admin_query = "SELECT id FROM users WHERE role = 'admin' LIMIT 1"
        admin_data = db.execute_query(admin_query, fetch=True)
        
        if not admin_data:
            return jsonify({'error': 'Admin has not been set up in the database'}), 500
            
        admin_id = admin_data[0]['id']
        
        # Tarik semua data yang dibutuhkan Frontend sekaligus
        profile = db.execute_query("SELECT * FROM profiles WHERE user_id = %s", (admin_id,), fetch=True)
        skills = db.execute_query("SELECT * FROM skills WHERE user_id = %s ORDER BY id DESC", (admin_id,), fetch=True)
        experiences = db.execute_query("SELECT * FROM experiences WHERE user_id = %s ORDER BY created_at DESC", (admin_id,), fetch=True)
        projects = db.execute_query("SELECT * FROM projects WHERE user_id = %s ORDER BY created_at DESC", (admin_id,), fetch=True)
        
        # Kembalikan semuanya dalam format JSON yang rapi
        return jsonify({
            'success': True,
            'data': {
                'profile': profile[0] if profile else None,
                'skills': skills if skills else [],
                'experiences': experiences if experiences else [],
                'projects': projects if projects else []
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# Rute ini otomatis jadi '/api/contact'
@utama_bp.route('/contact', methods=['POST'])
def send_contact_email():
    """Endpoint API untuk form kontak menggunakan Resend"""
    try:
        data = request.get_json()
        
        nama = data.get('nama')
        email_pengirim = data.get('email')
        pesan = data.get('pesan')
        
        if not nama or not email_pengirim or not pesan:
            return jsonify({'error': 'All fields are required'}), 400
            
        resend_api_key = os.getenv('RESEND_API_KEY')
        if not resend_api_key:
            return jsonify({'error': 'Resend API Key is not set in .env'}), 500
            
        url = "https://api.resend.com/emails"
        headers = {
            "Authorization": f"Bearer {resend_api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "from": 'onboarding@resend.dev',
            "to": '682024025@student.uksw.edu',
            "subject": f"Pesan dari {nama} ({email_pengirim})",
            "html": f"<p><strong>Nama:</strong> {nama}</p><p><strong>Pesan:</strong><br>{pesan}</p>"
        }
        
        response = requests.post(url, json=payload, headers=headers)
        
        if response.status_code in [200, 201]:
            return jsonify({'success': True, 'message': 'Email sent successfully'}), 200
        else:
            return jsonify({'error': 'Failed to send email from server'}), response.status_code
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500