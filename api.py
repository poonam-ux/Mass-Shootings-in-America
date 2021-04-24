from flask import Flask, request, render_template,jsonify,send_from_directory,safe_join
import csv
import json

app = Flask(__name__)

@app.route('/')
def map_view():
    return render_template('MapView.html')

if __name__ == '__main__':
    app.run(debug=True)
