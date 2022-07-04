var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client({ 
  hosts: [ 'http://localhost:9200'] 
  });

client.ping({ 
  requestTimeout: 1000000, 
  }, function(error) { 
  if (error) { 
  console.error('Cannot connect to Elasticsearch.'); 
  } else { 
  console.log('Connected to Elasticsearch was successful!'); 
  } 
  });

function groupBy(list, keyGetter) {
  const map = new Map();
  list.forEach((item) => {
        const key = keyGetter(item);
        const collection = map.get(key);
        if (!collection) {
            map.set(key, [item]);
        } else {
            collection.push(item);
        }
  });
  return map;
}

async function getAllDocuments(index, query, size = 1000) {
  
  var data = [];
  
  const getNext = async (scrollId) => {
    return await client.scroll({
      scroll: '2m',
      scrollId: scrollId
    });
  }

  let result = await client.search({
    index: 'jaeger-span-2022-05-19',
    size: size,
    scroll: '2m',
    body: {"query": {
      "match": {
             "kind":"SERVER"
                 }
          },
      "query":{
        "bool": {
          "must": [{
            "script": {
              "script": {
                "inline": "doc['traceID.keyword'].value == doc['spanID.keyword'].value"
    
                      }
                    } 
                  }]
                }
              }}
  })

  console.log('Total hits:', result.hits.total);
  console.log('Page hits count:', result.hits.hits.length);

  while (result.hits.hits.length) {
    console.log('Getting next', result.hits.hits.length);
    data = data.concat(result.hits.hits);
    result = await getNext(result._scroll_id);
  }
  
  console.log('Done', data.length);
 
  /*
  for(var i=0; i<data.length;i++){
    console.log(data[i])
  }
  */
  
  let redCars = data.filter(car => car._source.operationName === "getToken");
  console.log(redCars);
  
  const grouped = groupBy(data, d => d._source.name);
  console.log(grouped);
  return data;
}

getAllDocuments();
