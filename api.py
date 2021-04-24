from flask import Flask, request, render_template,jsonify,send_from_directory,safe_join
import csv
import json

app = Flask(__name__)

@app.route('/')
def map_view():
    return render_template('MapView.html')

@app.route('/chart')
def chart_view():
    return render_template('ChartView.html')

@app.route('/table')
def table_view():
    return render_template('TableView.html')

if __name__ == '__main__':
    app.run(debug=True)
