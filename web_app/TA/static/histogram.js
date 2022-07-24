  async function fetchData(){
    try{
      const response = await fetch("http://127.0.0.1:5000/get_data");
      if(!response.ok){
        throw new Error(`HTTP error: ${response.status}`);
      }
      const data = await response.json();
      console.log(data)
      return data
    }
    catch(error){
      console.error(`Could not get products: ${error}`)
    }
   }

  var margin = {
      top: 20,
      right: 20,
      bottom: 30,
      left: 40
    };    

    var selectedObject = [];
    var selection = "";

    var width = 800 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;

    var x = d3.scaleBand()
      .range([0, width])
      .padding(0.1);
    
    var y = d3.scaleLinear()
      .range([height, 0]);  

    var brush = d3.brushX()
    
    
    var chart = d3.select(".barchart").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", 
                "translate(" + margin.left + "," + margin.top + ")") ;
    // get the data
    d3.json("get_data", function(error, data) {
    if (error) throw error;
  
    // Scale the range of the data in the domains
    x.domain(data.map(function(d) { return d.key; }));
    y.domain([0, d3.max(data, function(d) { return d.value; })]);

    // format the data
    data.forEach(function(d) {
      d.value = +d.value;
    });
    chart.append("defs")
      .append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", width)
      .attr("height", height);

   brush.extent([[0, 0], [width, height]])
      .on("brush", brushed)
      .on("end",brushend)
      .on('end', function(d){
        var selection = d3.event.selection;
        j = data.filter(function(d){
          return selection[0] <= d.value && selection[1] >=d.value;
        }); 
        var obj = { Title: data, ID: j,  Value: j};
        selectedObject.push(obj);
        for(i=0;i<j.length;i++){
          console.log(j[i].value)
          selection += "<tr style= color:" + ">    <td>" + j[i].key + "</td>    <td>" + j[i].value;
        }
        document.getElementById("table").innerHTML = "<tr><td colspan = " + "4" + ">Data Selected: "+j.length+" </td></tr>" + "<tr><th>Trace ID</th><th>Span ID</th><th>Duration</th></tr>" + selection;
        
      });
      
    chart.selectAll(".barchart")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.key); })
      .attr("width", x.bandwidth())
      .attr("y", function(d) { return y(d.value); })
      .attr("height", function(d) { return height - y(d.value); });

    chart.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.key); })
      .attr("width", x.bandwidth())
      .attr("y", function(d) { return y(d.value); })
      .attr("height", function(d) { return height - y(d.value); });

    chart.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    chart.append("text") //Add chart title
      .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom) + ")")
      .style("text-anchor", "middle")
      .text("");

    chart.append("g")
      .attr("class", "y axis")
      .call(d3.axisLeft(y));

    chart.append("g")
      .attr("class", "x brush")
      .call(brush) //call the brush function, causing it to create the rectangles
      .selectAll("rect") //select all the just-created rectangles
      .attr("y", -6)
      .attr("height", (height + margin.top)) //set their height
    
    

    function resizePath(d) {
      var e = +(d == "e"),
        x = e ? 1 : -1,
        y = height / 3;
      return "M" + (.5 * x) + "," + y + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6) + "V" + (2 * y - 6) + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y) + "Z" + "M" + (2.5 * x) + "," + (y + 8) + "V" + (2 * y - 8) + "M" + (4.5 * x) + "," + (y + 8) + "V" + (2 * y - 8);
    }

    chart.selectAll(".resize").append("path").attr("d", resizePath);
});

function brushend() {
  if (brush.empty()){
    chart.select("#clip>rect")
      .attr("x", 0)
      .attr("width", width);
  }
}

function brushed() {
  var e = d3.event.selection;
  chart.select("#clip>rect")
    .attr("x", e[0])
    .attr("width", e[1] - e[0]);
}

function clearBrush(){
  var selection = "";
  var selectedObject = [];
  j=[];
  brush
    .clear()
    .event(d3.select(".brush"));
  document.getElementById("table").innerHTML = "<tr><td colspan = " + "4" + ">Data Selected:  </td></tr>" + "<tr><th>ID</th><th>Name</th></tr>"+selection;
}

    


 
