var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    outerWidth = (w.innerWidth || e.clientWidth || g.clientWidth) - 30,
    outerHeight = (w.innerHeight|| e.clientHeight|| g.clientHeight) - 250;

var margin = { top: 20, right: 20, bottom: 50, left: 50 },
    width = outerWidth - margin.left - margin.right,
    height = outerHeight - margin.top - margin.bottom;

var x = d3.scale.linear()
    .range([0, width]).nice();

var y = d3.scale.linear()
    .range([height, 0]).nice();

d3.csv("allNacimientos.csv", function(data) {

  // parse data
  data.forEach(function(d) {
    d.DIA = +d.DIA;
    d.YEAR = +d.YEAR;
    d.YEAR_ID = +d.YEAR_ID;
  });

  // set axis
  var xMax = d3.max(data, function(d) { return d.YEAR; }) + 2,
      xMin = d3.min(data, function(d) { return d.YEAR; }) - 1,
      yMax = d3.max(data, function(d) { return d.YEAR_ID; }) + 1;

  x.domain([xMin, xMax]);
  y.domain([0, yMax]);
  
  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .ticks(10, "d")
      .tickSize(-height);
      
  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(7, "d")
      .tickSize(-width);
      
  // square size
  var squareHeight = Math.floor((height / yMax) * 0.8);
  var squareWidth  = Math.floor((width  / (xMax - xMin)) * 0.8);

  // square colour
  var color = d3.scale.category10();

  // prepare mouse over tip
  var tip = d3.tip()
      .attr("class", "d3-tip")
      .offset([-10, 0])
      .html(function(d) {
        return d.NOMBRE + ", " + d.APELL1 + " " + d.APELL2 + " (" + d.NACIMIENTO + ")<br>Padres: "
        + d.NOMPADRE + " " + d.APELL2PAD + " | " + d.NOMMADRE + " " + d.APELL2MAD
        + "<br>OBS:" + fun_wrap(d.OBSERVACN);
      });

  // zoom behaviour
  var zoomBeh = d3.behavior.zoom()
      .x(x)
//      .y(y)
      .scaleExtent([1, 5])
      .on("zoom", zoom);
      
  // Prepare draw area
  var svg = d3.select("#stacks")
    .append("svg")
      .attr("width", outerWidth)
      .attr("height", outerHeight)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .call(zoomBeh);

  svg.call(tip);

  svg.append("rect")
      .attr("width", width)
      .attr("height", height);

  // X axis text (Anyo)
  svg.append("g")
      .classed("x axis", true)
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .classed("label", true)
      .attr("x", width)
      .attr("y", 30)
      .style("text-anchor", "end")
      .text("Año");

  // Y axis text (# Nacimiento)
  svg.append("g")
      .classed("y axis", true)
      .call(yAxis)
    .append("text")
      .classed("label", true)
      .attr("transform", "rotate(-90)")
      .attr("y", -30)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Numero de nacimientos");

  // Parent for al SVG drawing objects
  var objects = svg.append("svg")
      .classed("objects", true)
      .attr("width", width)
      .attr("height", height);

  // X axis line
  objects.append("svg:line")
      .classed("axisLine hAxisLine", true)
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", width)
      .attr("y2", 0)
      .attr("transform", "translate(0," + height + ")");

  // Y Axis line
  objects.append("svg:line")
      .classed("axisLine vAxisLine", true)
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", height);

  // Each nacimiento is a square
  objects.selectAll(".rect")
      .data(data)
    .enter().append("rect")
      .attr("width", squareWidth)
      .attr("height", squareHeight)
      .classed("rect", true)
      .attr("transform", transform)
      .style("stroke", function(d) { return color(d.SEXO); })
      .style("fill", function(d) { return color(d.SEXO); })
      .on("mouseover", tip.show)
      .on("mouseout", tip.hide)
      .on("click", function(d){ onClick(d)} );

  // Legend
  var legend = svg.selectAll(".legend")
      .data(color.domain())
    .enter().append("g")
      .classed("legend", true)
      .attr("transform", function(d, i) { return "translate(" + (-width + 10) + "," + ((i * 20) + 12) + ")"; });

  legend.append("circle")
      .attr("r", 5)
      .attr("cx", width + 15)
      .attr("fill", color);

  legend.append("text")
      .attr("x", width + 26)
      .attr("dy", ".35em")
      .text(function(d) { return d; });

  // Filter with search box
  onFilter();
  d3.select('#filterOn').on('keyup', onFilter);
  
  // Reset zoom button
  d3.select("#zoom").on("click", resetZoom);

  function resetZoom() {
      
    zoomBeh.x(x.domain([xMin, xMax]));
     
//    var svg = d3.select("#stacks").transition();
//    svg.select(".x.axis").duration(450).call(xAxis).select(".label").text("Año");
    zoom();

//    objects.selectAll(".rect").transition().duration(1000).attr("transform", transform);
  }
  
  function zoom() {
      
    var svg = d3.select("#stacks").transition();

    svg.select(".x.axis").duration(450).call(xAxis);
    svg.select(".y.axis").duration(450).call(yAxis);
    
    xWidth = x.domain()[1] - x.domain()[0];
    squareWidth  = Math.floor((width  / xWidth) * 0.8);

//    yWidth = yScale.domain()[1] - yScale.domain()[0];      
//    var squareHeight = Math.floor((height / yWidth) * 0.8);
    
    //console.log( maxNumItemsX )
    
    svg.selectAll(".rect")
        .transition().duration(450)
        .attr("transform", transform)
        .attr("width", squareWidth);
        
    // I should fix this
    svg.selectAll(".linkLine")
        .transition().duration(450)
        .remove();
  }

  function transform(d) {
    return "translate(" + x(d.YEAR) + "," + y(d.YEAR_ID) + ")";
  }

  function onFilter(){
    var filterText =  d3.select('#filterOn').property('value');
    
    if (filterText !== ""){
      var selectedOnes = d3.selectAll(".rect")
        .filter(function(d) { return accentFold(d.APELL1.toLowerCase()).indexOf( accentFold(filterText.toLowerCase()) ) !== -1 
                                  || accentFold(d.APELL2.toLowerCase()).indexOf( accentFold(filterText.toLowerCase()) ) !== -1
                                  || accentFold(d.NOMBRE.toLowerCase()).indexOf( accentFold(filterText.toLowerCase()) ) !== -1
                                  || accentFold(d.OBSERVACN.toLowerCase()).indexOf( accentFold(filterText.toLowerCase()) ) !== -1
        });

      d3.selectAll(".linkLine")
        .remove();

      d3.selectAll(".rect")
        .transition().duration(1200)
        .style("opacity","0.1");
      
      selectedOnes
        .transition().duration(1200)
        .style("opacity","1");
        
    }
    else {
      d3.selectAll(".rect")
        .transition().duration(1000)
        .style("opacity", "1");
    }
  }

  function onClick(node) {
    
//    console.log(node);
    
    // print info about selected person
    d3.select("#personData").selectAll("p").remove();

    selectedText = d3.select("#personData")
              .selectAll("p")
              .data( [node], function(d) { return( JSON.stringify(d) ); } );
              
    d3.select("#personData").append("p")
              .html( "<b>Seleccionado:</b><br>" );

    selectedText.enter().append("p")
              .html( function(d){ return printInfo(d)} );
              

    // print info about relatives
    relativesData = data
        .filter( function(d) { return( sameFamily(d,node) ); } );
              
    relativesText = d3.select("#personData")
              .selectAll("p")
              .data( relativesData, function(d) { return( JSON.stringify(d) ); } );
              
    d3.select("#personData").append("p")
              .html( "<b>Posibles padres y/o hijos:</b><br>" );

    relativesText.enter().append("p")
              .html( function(d){ return printInfo(d)} );
              

    // print info about people with same surnames
    homonimsData = data
        .filter( function(d) { return( sameName(d,node) ); } );
              
    homonimsText = d3.select("#personData")
              .selectAll("p")
              .data( homonimsData, function(d) { return( JSON.stringify(d) ); } );
              
    d3.select("#personData").append("p")
              .html( "<b>Otras entradas con los mismos apellidos:</b><br>" );

    homonimsText.enter().append("p")
              .html( function(d){ return printInfo(d)} );
              
    
    // set everybody transparent
    d3.selectAll(".rect")
        .transition().duration(1200)
        .style("opacity","0.1");
        
    // highlight people with same surnames (siblings)
    hasSameName = d3.selectAll(".rect")
        .data( homonimsData, function(d) { return( JSON.stringify(d) ); } )
        .transition().duration(1200)
        .style("opacity","0.5");
        
    // highlight parents and children
    relatives = d3.selectAll(".rect")
        .data( relativesData, function(d) { return( JSON.stringify(d) ); } )
        .transition().duration(1200)
        .style("opacity","0.5");

    // selected person is highlighted
    d3.selectAll(".rect")
        .data ( [node], function(d) { return( JSON.stringify(d) ); } )
        .transition().duration(1200)
        .style("opacity","1");
        
    // draw a line between node and parents and children
    relativesLinks = objects.selectAll(".linkLine")
        .data( relativesData );

    relativesLinks.exit().remove();
        
    relativesLinks
      .enter().append("line")
        .classed("linkLine", true);
        
    relativesLinks
        .style("opacity","0")
        .attr("x1", function(d) { return x(node.YEAR) + squareWidth/2; })
        .attr("y1", function(d) { return y(node.YEAR_ID) + squareHeight/2; })
        .attr("x2", function(d) { return x(node.YEAR) + squareWidth/2; })
        .attr("y2", function(d) { return y(node.YEAR_ID) + squareHeight/2; });
        
    relativesLinks
        .transition().duration(1200)
        .style("opacity","1")
        .attr("x1", function(d) { return x(d.YEAR) + squareWidth/2; })
        .attr("y1", function(d) { return y(d.YEAR_ID) + squareHeight/2; })
        .attr("x2", function(d) { return x(node.YEAR) + squareWidth/2; })
        .attr("y2", function(d) { return y(node.YEAR_ID) + squareHeight/2; });
      
    tip.hide();
  }
  
  function sameFamily(d, node) {
    
    return (accentFold(node.NOMMADRE.charAt(0) + node.APELL2MAD).toLowerCase() === accentFold(d.NOMBRE.charAt(0) + d.APELL1 + " " + d.APELL2).toLowerCase()
            && d.SEXO == "Mujer" && node.YEAR >= d.YEAR)
        || (accentFold(node.NOMPADRE.charAt(0) + node.APELL2PAD).toLowerCase() === accentFold(d.NOMBRE.charAt(0) + d.APELL1 + " " + d.APELL2).toLowerCase()
            && d.SEXO == "Hombre" && node.YEAR >= d.YEAR)
        || (accentFold(d.NOMMADRE.charAt(0) + d.APELL2MAD).toLowerCase() === accentFold(node.NOMBRE.charAt(0) + node.APELL1 + " " + node.APELL2).toLowerCase()
            && node.SEXO == "Mujer" && d.YEAR >= node.YEAR)
        || (accentFold(d.NOMPADRE.charAt(0) + d.APELL2PAD).toLowerCase() === accentFold(node.NOMBRE.charAt(0) + node.APELL1 + " " + node.APELL2).toLowerCase()
            && node.SEXO == "Hombre" && d.YEAR >= node.YEAR);
  }

  function sameName(d, node) {
    
    return accentFold(node.APELL1 + " " + node.APELL2).toLowerCase() === accentFold(d.APELL1 + " " + d.APELL2).toLowerCase()
        || accentFold(node.APELL1 + " " + node.APELL2).toLowerCase() === accentFold(d.APELL1 + " " + d.APELL2).toLowerCase();
  }
  
  function printInfo(d) {
    return cssText("pField", "Nombre: ") + cssText("pData", d.NOMBRE)
            + cssText("pField", "Apellidos: ") + cssText("pData", d.APELL1 + " " + d.APELL2)
            + cssText("pField", "Fecha Nacimiento: ") + cssText("pData", d.NACIMIENTO)
            + cssText("pField", "Padre: ") + cssText("pData", d.NOMPADRE + " " + d.APELL2PAD)
            + cssText("pField", "Madre: ") + cssText("pData", d.NOMMADRE + " " + d.APELL2MAD)
            + cssText("pField", "Padrino: ") + cssText("pData", d.NPADRINO + " " + d.APELLPADRINO)
            + cssText("pField", "Madrina: ") + cssText("pData", d.NMADRINA + " " + d.APELLMADRINA) + "<br>"
            + cssText("pField", "Observacion: ") + cssText("pData", d.OBSERVACN);
  }
  
  function cssText(c, s) {
    return "<span class=\"" + c + "\">" +
           s +
           " </span>";
  }
  
  function fun_wrap(d) {
    return d.replace(/(.{1,80})/g, '$1<br/>');
  }
  
  function accentFold(inStr) {
    return inStr.replace(/([àáâãäå])|([ç])|([èéêë])|([ìíîï])|([ñ])|([òóôõöø])|([ß])|([ùúûü])|([ÿ])|([æ])/g, function(str,a,c,e,i,n,o,s,u,y,ae) { if(a) return 'a'; else if(c) return 'c'; else if(e) return 'e'; else if(i) return 'i'; else if(n) return 'n'; else if(o) return 'o'; else if(s) return 's'; else if(u) return 'u'; else if(y) return 'y'; else if(ae) return 'ae'; });
  }
  
});