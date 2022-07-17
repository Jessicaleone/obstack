    
    /*
    function decodeHtml(html) {
      var txt = document.createElement("textarea");
      txt.innerHTML = html;
    return txt.value;
    }

    var x = decodeHtml(d)
    console.log(typeof x)
    var data = JSON.parse(x)
    console.log(data)
    */
    var data = [{
      key: 1,
      value: 37
    }, {
      key: 1.5,
      value: 13
    }, {
      key: 2.5,
      value: 1
    }, {
      key: 3,
      value: 4
    }, {
      key: 3.5,
      value: 14
    }, {
      key: 4,
      value: 18
    }, {
      key: 4.5,
      value: 21
    }, {
      key: 5,
      value: 17
    }, {
      key: 5.5,
      value: 16
    }, {
      key: 6,
      value: 5
    }, {
      key: 6.5,
      value: 4
    }];
    console.log(typeof data)
    
    var margin = {
      top: 10,
      right: 40,
      bottom: 42,
      left: 10
    };

    var selectedObject = [];
    var selection = "";

    var width = 500 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

    var y = d3.scale.linear()
      .domain([0, d3.max(data, function(d) {
        return d.value
      })])
      .range([height, 0]);

    var x = d3.scale.linear()
      .domain([0, d3.max(data, function(d) {
        return d.key;
      }) + 1])
      .rangeRound([0, width]);

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");

    var chart = d3.select(".chart#chart")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .style("margin-left", 15 + "px");

    chart.append("defs")
      .append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", width)
      .attr("height", height);

    var brush = d3.svg.brush()
      .x(x)
      .on("brush", brushed)
      .on("brushend", brushend)
      .on('brushend', function(d){
        k = brush.extent();
        j = data.filter(function(d){
          return k[0] <= d.value && k[1] >=d.value;
        });
	      console.log(j)  
        var obj = { Title: data, ID: j,  Value: j};
        selectedObject.push(obj);
        for(i=0;i<j.length;i++){
          selection += "<tr style= color:" + ">    <td>" + j[i].key + "</td>    <td>" + j[i].value;
        }
        document.getElementById("table").innerHTML = "<tr><td colspan = " + "4" + ">Data Selected: "+j.length+" </td></tr>" + "<tr><th>ID</th><th>Name</th></tr>" + selection;
        
      });
      

    function brushend() {
      if (brush.empty()){
        chart.select("#clip>rect")
          .attr("x", 0)
          .attr("width", width);
      }
    }

    function brushed() {
      var e = brush.extent();
      chart.select("#clip>rect")
        .attr("x", x(e[0]))
        .attr("width", x(e[1]) - x(e[0]));
    }

    function clearBrush(){
      var selection = "";
      var selectedObject = [];
      j=[];
      d3.selectAll(".brush").call(brush.clear());
      document.getElementById("table").innerHTML = "<tr><td colspan = " + "4" + ">Data Selected:  </td></tr>" + "<tr><th>ID</th><th>Name</th></tr>";
    }

    chart.selectAll(".hidden")
      .data(data)
      .enter().append("rect")
      .attr("class", "hidden")
      .attr("x", function(d) {
        return x(d.key);
      })
      .attr("y", function(d) {
        return y(d.value);
      })
      .attr("height", function(d) {
        return height - y(d.value);
      })
      .attr("width", x(0.5))
      .style("stroke", "white")
      .append("title")
      .text(function(d) {
        return d.key;
      });

    

    chart.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("clip-path", "url(#clip)")
      .attr("class", "bar")
      .attr("x", function(d) {
        return x(d.key);
      })
      .attr("y", function(d) {
        return y(d.value);
      })
      .attr("height", function(d) {
        return height - y(d.value);
      })
      .attr("width", x(0.5))
      .style("stroke", "white")
      .append("title")
      .text(function(d) {
        return d.key;
      });

    chart.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    chart.append("text") //Add chart title
      .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom) + ")")
      .style("text-anchor", "middle")
      .text("");

    chart.append("g")
      .attr("class", "y axis")
      .call(yAxis);

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