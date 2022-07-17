from flask import Flask, render_template, request, jsonify, json
from elasticsearch import Elasticsearch
import numpy
app = Flask(__name__)

es = Elasticsearch('http://localhost:9200',timeout=5000)

@app.route("/greet", methods=["POST","GET"])
def greet():
    request.form['name_input']

@app.route('/', methods=['GET'])
def index():
    # results = es.get(index='jaeger-span-2022-05-19', id ='pQpB3YAByCFtAE3ebSYQ')
    # return jsonify(results['_source'])
    
    page = es.search(index='jaeger-span-2022-05-19', scroll='10m', size=10000, body={
        "query":{
            "bool": {
            "must": [
                {"match": {"kind":"SERVER"}},
                    {"match": {"name.keyword":"ts-auth-service_getToken"}},
                {
                "script": {
                "script": {
                    "inline": "doc['traceID.keyword'].value == doc['spanID.keyword'].value"

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
    import numpy as np 
    
    duration =[]
    for i in result:
        duration.append(i['duration'])
    # Creating histogram
    np.histogram(duration, bins = 10)
            
    hist, bins = np.histogram(duration, bins = 10) 
            
    # Displaying histogram

    l = [{'key': float(bins[i]), 'value': float(hist[i])} for i in range(len(hist))]
    
    print(l)
    y= json.dumps(l)
    print(type(y))
    return render_template("index.html", data=y)