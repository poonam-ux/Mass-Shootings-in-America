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

@app.route('/data/<path:filename>')
def custom_static(filename):
    return send_from_directory('data', filename, as_attachment=False)


@app.route('/query', methods=['GET','POST'])
def query_selected_post():
    reqFilter = request.args.get('requestType')
    reqVal = request.args.get('requestValue')
    csv_file = csv.reader(open('data/mass_shootings.csv', "r"), delimiter=",")
    jsonData = {}
    counter = 0
    for row in csv_file:
    #if current rows 2nd value is equal to input, print that row
        if reqVal == 'ALL':
            jsonData[counter] = row
            counter +=1
        if reqVal == row[18] and reqFilter == 'raceSelect':
            jsonData[counter] = row
            counter +=1

        if reqVal == row[11] and reqFilter == 'ageSelect':
            jsonData[counter] = row
            counter +=1
    return jsonify(result=jsonData)

@app.route('/queryall', methods=['GET','POST'])
def query_all_post():
    csv_file = csv.reader(open('data/mass_shootings.csv', "r"), delimiter=",")
    jsonData = {}
    counter = 0
    for row in csv_file:
        jsonData[counter] = row
        counter +=1
       
    return jsonify(result=jsonData)

if __name__ == '__main__':
    app.run(debug=True)
