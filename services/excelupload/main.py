from excel_extractor import process_excel


import functions_framework
from flask import jsonify, Request

# For local HTTPS testing
# import os
# if __name__ == "__main__":
#     from flask import Flask, request
#     app = Flask(__name__)

#     @app.route("/extract-locally", methods=["POST"])
#     def local_extract_excel():
#         if not request.files or 'file' not in request.files:
#             return jsonify({'error': 'No file uploaded'}), 400
#         file = request.files['file']
#         filename = file.filename
#         if not filename.endswith(('.xlsx', '.xlsm')):
#             return jsonify({'error': 'Invalid file type'}), 400
#         file_bytes = file.read()
#         try:
#             result = process_excel(file_bytes)
#         except Exception as e:
#             return jsonify({'error': str(e)}), 400
#         response = jsonify(result)
#         response.headers.add('Access-Control-Allow-Origin', '*')
#         response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
#         response.headers.add('Access-Control-Allow-Methods', 'POST')
#         return response

#     app.run(host="0.0.0.0", port=8080, ssl_context=("cert.pem", "key.pem"))

@functions_framework.http
def extract_excel_gcf(request: Request):
    # Handle CORS preflight requests
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', 'https://dev.mtsm.dev,http://localhost:3000,https://localhost:3000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.add('Access-Control-Max-Age', '86400')
        return response

    if request.method != 'POST':
        return (jsonify({'error': 'Only POST allowed'}), 405)

    if not request.files or 'file' not in request.files:
        return (jsonify({'error': 'No file uploaded'}), 400)

    file = request.files['file']
    filename = file.filename
    if not filename.endswith(('.xlsx', '.xlsm')):
        return (jsonify({'error': 'Invalid file type'}), 400)

    file_bytes = file.read()
    try:
        result = process_excel(file_bytes)
    except Exception as e:
        return (jsonify({'error': str(e)}), 400)

    response = jsonify(result)
    response.headers.add('Access-Control-Allow-Origin', 'https://dev.mtsm.dev,http://localhost:3000,https://localhost:3000')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
    return response