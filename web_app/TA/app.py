from flask import Flask, render_template, request, jsonify, json
from elasticsearch import Elasticsearch
import numpy
app = Flask(__name__)

es = Elasticsearch('http://localhost:9200',timeout=5000)

@app.route("/", methods=["POST","GET"])
def index():
   return render_template("index.html")

@app.route('/get_data', methods=["GET","POST"])
def get_data():
    
    page = es.search(index='jaeger-span-2022-05-19', scroll='10m', size=10000, body={
        "query":{
            "bool": {
            "must": [
                {"match": {"kind":"SERVER"}},
                    {"match": {"name.keyword":"ts-auth-service_getToken"}},
                {
                "script": {
                "script": {
                    "source": "doc['traceID.keyword'].value == doc['spanID.keyword'].value"

                        }
                        } 
                    }]
                }
            }})

    query_request = []

    sid = page['_scroll_id']
    print(page['hits']['total']['value'])

    while(int(page['hits']['total']['value']) > 0):
        print("Scrolling...", str(int(page['hits']['total']['value'])))
        query_request.append(page['hits']['hits'])
        page = es.scroll(scroll_id=sid, scroll='10m')
        page['hits']['total']['value'] = len(page['hits']['hits'])


    print(len(query_request))

    result = []

    for i in query_request:
        for j in i:
            result.append(j['_source'])
    
    
    return json.dumps(result)


@app.route('/get_bins', methods=["GET","POST"])
def get_bins():
    import requests
    req = requests.get('http://127.0.0.1:5000/get_data')
    import numpy as np

    duration =[]
    for i in req.text:
       duration.append(i['duration'])
    # Creating histogram
    np.histogram(duration, bins = 1000)
            
    hist, bins = np.histogram(duration, bins = 300) 
            
    # Displaying histogram

    l = [{'key': float(bins[i]), 'value': float(hist[i])} for i in range(len(hist))]
    
    return json.dumps(l)